#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

// =============================================================================
// Storage keys
// =============================================================================

#[contracttype]
pub enum DataKey {
    Admin,
    Badge(u64),                          // id → BadgeRecord
    OwnerBadges(Address),                // owner → Vec<u64>
    NextId,                              // u64 counter
    BadgeType(Symbol),                   // type → BadgeTypeRecord
}

// =============================================================================
// Types
// =============================================================================

#[contracttype]
#[derive(Clone)]
pub struct BadgeRecord {
    pub id: u64,
    pub owner: Address,
    pub badge_type: Symbol,
    pub minted_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct BadgeTypeRecord {
    pub name: Symbol,
    pub description: String,
    pub total_minted: u32,
}

// =============================================================================
// Events
// =============================================================================

const MINT: Symbol = symbol_short!("mint");

// =============================================================================
// Contract
// =============================================================================

#[contract]
pub struct BadgesContract;

#[contractimpl]
impl BadgesContract {
    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    pub fn initialize(env: Env, admin: Address) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "Already initialized"
        );
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextId, &1_u64);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    // -------------------------------------------------------------------------
    // Badge Types (admin only)
    // -------------------------------------------------------------------------

    pub fn create_badge_type(
        env: Env,
        admin: Address,
        badge_type: Symbol,
        description: String,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can create badge types");
        assert!(
            !env.storage()
                .instance()
                .has(&DataKey::BadgeType(badge_type.clone())),
            "Badge type already exists"
        );

        let badge_type_record = BadgeTypeRecord {
            name: badge_type.clone(),
            description,
            total_minted: 0,
        };

        env.storage()
            .instance()
            .set(&DataKey::BadgeType(badge_type), &badge_type_record);
    }

    pub fn get_badge_type(env: Env, badge_type: Symbol) -> Option<BadgeTypeRecord> {
        env.storage().instance().get(&DataKey::BadgeType(badge_type))
    }

    // -------------------------------------------------------------------------
    // Minting (admin only)
    // -------------------------------------------------------------------------

    pub fn mint_badge(env: Env, admin: Address, recipient: Address, badge_type: Symbol) -> u64 {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can mint");
        assert!(
            env.storage()
                .instance()
                .has(&DataKey::BadgeType(badge_type.clone())),
            "Badge type does not exist"
        );

        let id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap();
        let badge = BadgeRecord {
            id,
            owner: recipient.clone(),
            badge_type: badge_type.clone(),
            minted_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Badge(id), &badge);

        // Add to owner's badge list
        let owner_key = DataKey::OwnerBadges(recipient.clone());
        let mut badges: Vec<u64> = env
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or_else(|| Vec::new(&env));
        badges.push_back(id);
        env.storage().persistent().set(&owner_key, &badges);

        // Update badge type stats
        let mut badge_type_record: BadgeTypeRecord = env
            .storage()
            .instance()
            .get(&DataKey::BadgeType(badge_type.clone()))
            .unwrap();
        badge_type_record.total_minted = badge_type_record
            .total_minted
            .checked_add(1)
            .expect("arithmetic overflow");
        env.storage()
            .instance()
            .set(&DataKey::BadgeType(badge_type.clone()), &badge_type_record);

        // Increment counter
        env.storage()
            .instance()
            .set(&DataKey::NextId, &(id + 1));

        env.events()
            .publish((MINT, symbol_short!("to"), recipient), (id, badge_type));

        id
    }

    // -------------------------------------------------------------------------
    // Reading
    // -------------------------------------------------------------------------

    pub fn get_badge(env: Env, id: u64) -> Option<BadgeRecord> {
        env.storage().persistent().get(&DataKey::Badge(id))
    }

    pub fn get_badges_by_owner(env: Env, owner: Address) -> Vec<BadgeRecord> {
        let owner_key = DataKey::OwnerBadges(owner.clone());
        let ids: Vec<u64> = match env.storage().persistent().get(&owner_key) {
            Some(i) => i,
            None => return Vec::new(&env),
        };

        let mut results = Vec::new(&env);
        for id in ids.iter() {
            if let Some(badge) = env.storage().persistent().get(&DataKey::Badge(id)) {
                results.push_back(badge);
            }
        }
        results
    }

    pub fn verify_badge(env: Env, owner: Address, badge_type: Symbol) -> bool {
        let badges = Self::get_badges_by_owner(env, owner);
        for badge in badges.iter() {
            if badge.badge_type == badge_type {
                return true;
            }
        }
        false
    }

    // -------------------------------------------------------------------------
    // Transfer (soulbound — panics)
    // -------------------------------------------------------------------------

    pub fn transfer(_env: Env, _from: Address, _to: Address, _id: u64) {
        panic!("soulbound");
    }
}

// =============================================================================
// Tests
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    fn setup() -> (Env, BadgesContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let id = env.register_contract(None, BadgesContract);
        let client = BadgesContractClient::new(&env, &id);
        let admin = Address::generate(&env);
        client.initialize(&admin);
        (env, client, admin)
    }

    #[test]
    fn test_initialize_sets_admin() {
        let (_, client, admin) = setup();
        assert_eq!(client.get_admin(), admin);
    }

    #[test]
    #[should_panic(expected = "Already initialized")]
    fn test_double_initialize_panics() {
        let (_, client, admin) = setup();
        client.initialize(&admin);
    }

    #[test]
    fn test_create_badge_type() {
        let (env, client, admin) = setup();
        let badge_type = symbol_short!("FIRST");
        let desc = String::from_str(&env, "First course completion");

        client.create_badge_type(&admin, &badge_type, &desc);
        let badge_type_record = client.get_badge_type(&badge_type).unwrap();
        assert_eq!(badge_type_record.name, badge_type);
        assert_eq!(badge_type_record.total_minted, 0);
    }

    #[test]
    #[should_panic(expected = "Badge type already exists")]
    fn test_create_duplicate_badge_type_panics() {
        let (env, client, admin) = setup();
        let badge_type = symbol_short!("FIRST");
        let desc = String::from_str(&env, "First course completion");

        client.create_badge_type(&admin, &badge_type, &desc);
        client.create_badge_type(&admin, &badge_type, &desc);
    }

    #[test]
    #[should_panic(expected = "Only admin can create badge types")]
    fn test_non_admin_cannot_create_badge_type() {
        let (env, client, _) = setup();
        let rando = Address::generate(&env);
        let badge_type = symbol_short!("FIRST");
        let desc = String::from_str(&env, "First course completion");

        client.create_badge_type(&rando, &badge_type, &desc);
    }

    #[test]
    fn test_mint_badge() {
        let (env, client, admin) = setup();
        let recipient = Address::generate(&env);
        let badge_type = symbol_short!("FIRST");
        let desc = String::from_str(&env, "First course completion");

        client.create_badge_type(&admin, &badge_type, &desc);
        let id = client.mint_badge(&admin, &recipient, &badge_type);
        assert_eq!(id, 1);

        let badge = client.get_badge(&id).unwrap();
        assert_eq!(badge.owner, recipient);
        assert_eq!(badge.badge_type, badge_type);
    }

    #[test]
    #[should_panic(expected = "Badge type does not exist")]
    fn test_mint_nonexistent_badge_type_panics() {
        let (env, client, admin) = setup();
        let recipient = Address::generate(&env);
        let badge_type = symbol_short!("FAKE");

        client.mint_badge(&admin, &recipient, &badge_type);
    }

    #[test]
    #[should_panic(expected = "Only admin can mint")]
    fn test_non_admin_cannot_mint() {
        let (env, client, admin) = setup();
        let rando = Address::generate(&env);
        let recipient = Address::generate(&env);
        let badge_type = symbol_short!("FIRST");
        let desc = String::from_str(&env, "First course completion");

        client.create_badge_type(&admin, &badge_type, &desc);
        client.mint_badge(&rando, &recipient, &badge_type);
    }

    #[test]
    fn test_get_badges_by_owner() {
        let (env, client, admin) = setup();
        let owner = Address::generate(&env);
        let badge_type1 = symbol_short!("FIRST");
        let badge_type2 = symbol_short!("SECOND");
        let desc = String::from_str(&env, "Badge");

        client.create_badge_type(&admin, &badge_type1, &desc);
        client.create_badge_type(&admin, &badge_type2, &desc);
        client.mint_badge(&admin, &owner, &badge_type1);
        client.mint_badge(&admin, &owner, &badge_type2);

        let badges = client.get_badges_by_owner(&owner);
        assert_eq!(badges.len(), 2);
        assert_eq!(badges.get(0).unwrap().badge_type, badge_type1);
        assert_eq!(badges.get(1).unwrap().badge_type, badge_type2);
    }

    #[test]
    fn test_verify_badge() {
        let (env, client, admin) = setup();
        let owner = Address::generate(&env);
        let badge_type = symbol_short!("FIRST");
        let desc = String::from_str(&env, "First course completion");

        client.create_badge_type(&admin, &badge_type, &desc);
        assert!(!client.verify_badge(&owner, &badge_type));

        client.mint_badge(&admin, &owner, &badge_type);
        assert!(client.verify_badge(&owner, &badge_type));
    }

    #[test]
    fn test_badge_type_minted_count() {
        let (env, client, admin) = setup();
        let owner1 = Address::generate(&env);
        let owner2 = Address::generate(&env);
        let badge_type = symbol_short!("FIRST");
        let desc = String::from_str(&env, "First course completion");

        client.create_badge_type(&admin, &badge_type, &desc);
        client.mint_badge(&admin, &owner1, &badge_type);
        client.mint_badge(&admin, &owner2, &badge_type);

        let badge_type_record = client.get_badge_type(&badge_type).unwrap();
        assert_eq!(badge_type_record.total_minted, 2);
    }

    #[test]
    #[should_panic(expected = "soulbound")]
    fn test_transfer_panics() {
        let (env, client, admin) = setup();
        let owner = Address::generate(&env);
        let other = Address::generate(&env);
        let badge_type = symbol_short!("FIRST");
        let desc = String::from_str(&env, "First course completion");

        client.create_badge_type(&admin, &badge_type, &desc);
        let id = client.mint_badge(&admin, &owner, &badge_type);
        client.transfer(&owner, &other, &id);
    }
}
