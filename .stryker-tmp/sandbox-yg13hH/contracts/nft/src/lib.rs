#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

#[contracttype]
pub enum DataKey {
    Admin,
    NFTOwner(u32),                    // nft_id -> owner
    NFTMetadata(u32),                 // nft_id -> metadata
    CourseNFTs(Address),              // owner -> Vec<nft_id>
    NextNFTId,
    RoyaltyBasis(u32),                // nft_id -> royalty basis points
    RoyaltyRecipient(u32),            // nft_id -> instructor address
    AccessRights(u32, Address),       // (nft_id, holder) -> has_access
}

#[contracttype]
#[derive(Clone)]
pub struct NFTMetadata {
    pub nft_id: u32,
    pub course_id: Symbol,
    pub course_name: String,
    pub owner: Address,
    pub purchase_date: u64,
    pub royalty_basis: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct CourseNFT {
    pub nft_id: u32,
    pub course_id: Symbol,
    pub owner: Address,
    pub instructor: Address,
    pub purchase_price: i128,
}

#[contract]
pub struct NFTContract;

#[contractimpl]
impl NFTContract {
    pub fn initialize(env: Env, admin: Address) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "Already initialized"
        );
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextNFTId, &0_u32);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn mint_course_nft(
        env: Env,
        admin: Address,
        owner: Address,
        course_id: Symbol,
        course_name: String,
        instructor: Address,
        purchase_price: i128,
        royalty_basis: u32,
    ) -> u32 {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can mint");
        assert!(royalty_basis <= 10000, "Royalty basis must be <= 10000");

        let nft_id_key = DataKey::NextNFTId;
        let nft_id: u32 = env.storage().instance().get(&nft_id_key).unwrap_or(0);

        let metadata = NFTMetadata {
            nft_id,
            course_id: course_id.clone(),
            course_name,
            owner: owner.clone(),
            purchase_date: env.ledger().timestamp(),
            royalty_basis,
        };

        env.storage()
            .instance()
            .set(&DataKey::NFTMetadata(nft_id), &metadata);
        env.storage()
            .instance()
            .set(&DataKey::NFTOwner(nft_id), &owner);
        env.storage()
            .instance()
            .set(&DataKey::RoyaltyBasis(nft_id), &royalty_basis);
        env.storage()
            .instance()
            .set(&DataKey::RoyaltyRecipient(nft_id), &instructor);

        // Add to owner's NFT list
        let owner_key = DataKey::CourseNFTs(owner.clone());
        let mut nfts: Vec<u32> = env
            .storage()
            .instance()
            .get(&owner_key)
            .unwrap_or_else(|| Vec::new(&env));
        nfts.push_back(nft_id);
        env.storage().instance().set(&owner_key, &nfts);

        // Grant access to owner
        env.storage()
            .instance()
            .set(&DataKey::AccessRights(nft_id, owner.clone()), &true);

        env.storage()
            .instance()
            .set(&nft_id_key, &(nft_id + 1));

        env.events().publish(
            (symbol_short!("nft"), symbol_short!("minted")),
            (nft_id, course_id, owner, purchase_price),
        );

        nft_id
    }

    pub fn transfer_nft(env: Env, from: Address, to: Address, nft_id: u32) {
        from.require_auth();

        let owner_key = DataKey::NFTOwner(nft_id);
        let current_owner: Address = env
            .storage()
            .instance()
            .get(&owner_key)
            .expect("NFT not found");
        assert!(current_owner == from, "Not NFT owner");

        // Update owner
        env.storage().instance().set(&owner_key, &to);

        // Update metadata
        let metadata_key = DataKey::NFTMetadata(nft_id);
        let mut metadata: NFTMetadata = env
            .storage()
            .instance()
            .get(&metadata_key)
            .expect("Metadata not found");
        metadata.owner = to.clone();
        env.storage().instance().set(&metadata_key, &metadata);

        // Update owner's NFT list
        let from_key = DataKey::CourseNFTs(from.clone());
        if let Some(mut nfts) = env.storage().instance().get::<DataKey, Vec<u32>>(&from_key) {
            if let Some(pos) = nfts.iter().position(|&id| id == nft_id) {
                nfts.remove(pos as u32);
                env.storage().instance().set(&from_key, &nfts);
            }
        }

        let to_key = DataKey::CourseNFTs(to.clone());
        let mut to_nfts: Vec<u32> = env
            .storage()
            .instance()
            .get(&to_key)
            .unwrap_or_else(|| Vec::new(&env));
        to_nfts.push_back(nft_id);
        env.storage().instance().set(&to_key, &to_nfts);

        // Grant access to new owner
        env.storage()
            .instance()
            .set(&DataKey::AccessRights(nft_id, to.clone()), &true);

        env.events().publish(
            (symbol_short!("nft"), symbol_short!("transferred")),
            (nft_id, from, to),
        );
    }

    pub fn grant_access(env: Env, nft_owner: Address, nft_id: u32, holder: Address) {
        nft_owner.require_auth();

        let owner_key = DataKey::NFTOwner(nft_id);
        let current_owner: Address = env
            .storage()
            .instance()
            .get(&owner_key)
            .expect("NFT not found");
        assert!(current_owner == nft_owner, "Not NFT owner");

        env.storage()
            .instance()
            .set(&DataKey::AccessRights(nft_id, holder.clone()), &true);

        env.events().publish(
            (symbol_short!("nft"), symbol_short!("access_granted")),
            (nft_id, holder),
        );
    }

    pub fn revoke_access(env: Env, nft_owner: Address, nft_id: u32, holder: Address) {
        nft_owner.require_auth();

        let owner_key = DataKey::NFTOwner(nft_id);
        let current_owner: Address = env
            .storage()
            .instance()
            .get(&owner_key)
            .expect("NFT not found");
        assert!(current_owner == nft_owner, "Not NFT owner");

        env.storage()
            .instance()
            .remove(&DataKey::AccessRights(nft_id, holder.clone()));

        env.events().publish(
            (symbol_short!("nft"), symbol_short!("access_revoked")),
            (nft_id, holder),
        );
    }

    pub fn has_access(env: Env, nft_id: u32, holder: Address) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::AccessRights(nft_id, holder.clone()))
            .unwrap_or(false)
    }

    pub fn get_nft_metadata(env: Env, nft_id: u32) -> Option<NFTMetadata> {
        env.storage()
            .instance()
            .get(&DataKey::NFTMetadata(nft_id))
    }

    pub fn get_nft_owner(env: Env, nft_id: u32) -> Option<Address> {
        env.storage()
            .instance()
            .get(&DataKey::NFTOwner(nft_id))
    }

    pub fn get_owner_nfts(env: Env, owner: Address) -> Vec<u32> {
        env.storage()
            .instance()
            .get(&DataKey::CourseNFTs(owner))
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_royalty_info(env: Env, nft_id: u32) -> Option<(Address, u32)> {
        let recipient: Option<Address> = env
            .storage()
            .instance()
            .get(&DataKey::RoyaltyRecipient(nft_id));
        let basis: Option<u32> = env
            .storage()
            .instance()
            .get(&DataKey::RoyaltyBasis(nft_id));

        match (recipient, basis) {
            (Some(r), Some(b)) => Some((r, b)),
            _ => None,
        }
    }
}
