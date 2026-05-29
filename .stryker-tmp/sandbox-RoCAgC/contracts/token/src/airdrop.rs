use soroban_sdk::{contracttype, Address, Env, Symbol, Vec, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct AirdropCampaign {
    pub id: u32,
    pub total_amount: i128,
    pub claimed_amount: i128,
    pub expiry_ledger: u32,
    pub merkle_root: [u8; 32],
}

#[contracttype]
#[derive(Clone)]
pub struct AirdropClaim {
    pub recipient: Address,
    pub amount: i128,
    pub claimed: bool,
}

#[contracttype]
pub enum DataKey {
    AirdropCampaign(u32),
    AirdropClaimed(u32, Address),
    AirdropCampaignCount,
}

pub fn create_airdrop(
    env: &Env,
    admin: &Address,
    total_amount: i128,
    expiry_ledger: u32,
    merkle_root: [u8; 32],
) -> u32 {
    admin.require_auth();
    assert!(total_amount > 0, "Total amount must be positive");
    assert!(expiry_ledger > env.ledger().sequence(), "Expiry must be in future");

    let count_key = DataKey::AirdropCampaignCount;
    let campaign_id: u32 = env.storage().instance().get(&count_key).unwrap_or(0);

    let campaign = AirdropCampaign {
        id: campaign_id,
        total_amount,
        claimed_amount: 0,
        expiry_ledger,
        merkle_root,
    };

    env.storage()
        .instance()
        .set(&DataKey::AirdropCampaign(campaign_id), &campaign);
    env.storage()
        .instance()
        .set(&count_key, &(campaign_id + 1));

    env.events().publish(
        (symbol_short!("airdrop"), symbol_short!("created")),
        (campaign_id, total_amount, expiry_ledger),
    );

    campaign_id
}

pub fn claim_airdrop(
    env: &Env,
    campaign_id: u32,
    recipient: &Address,
    amount: i128,
    proof: Vec<[u8; 32]>,
) -> bool {
    recipient.require_auth();
    assert!(amount > 0, "Amount must be positive");

    let campaign_key = DataKey::AirdropCampaign(campaign_id);
    let mut campaign: AirdropCampaign = env
        .storage()
        .instance()
        .get(&campaign_key)
        .expect("Campaign not found");

    assert!(
        env.ledger().sequence() <= campaign.expiry_ledger,
        "Airdrop expired"
    );

    let claim_key = DataKey::AirdropClaimed(campaign_id, recipient.clone());
    assert!(
        !env.storage().instance().has(&claim_key),
        "Already claimed"
    );

    // Verify merkle proof
    let leaf = compute_leaf(recipient, amount);
    assert!(
        verify_merkle_proof(&leaf, &campaign.merkle_root, &proof),
        "Invalid merkle proof"
    );

    campaign.claimed_amount = campaign
        .claimed_amount
        .checked_add(amount)
        .expect("arithmetic overflow");
    assert!(
        campaign.claimed_amount <= campaign.total_amount,
        "Exceeds campaign total"
    );

    env.storage()
        .instance()
        .set(&campaign_key, &campaign);
    env.storage().instance().set(&claim_key, &true);

    env.events().publish(
        (symbol_short!("airdrop"), symbol_short!("claimed")),
        (campaign_id, recipient.clone(), amount),
    );

    true
}

pub fn recover_unclaimed(env: &Env, admin: &Address, campaign_id: u32) -> i128 {
    admin.require_auth();

    let campaign_key = DataKey::AirdropCampaign(campaign_id);
    let campaign: AirdropCampaign = env
        .storage()
        .instance()
        .get(&campaign_key)
        .expect("Campaign not found");

    assert!(
        env.ledger().sequence() > campaign.expiry_ledger,
        "Campaign not expired"
    );

    let unclaimed = campaign
        .total_amount
        .checked_sub(campaign.claimed_amount)
        .expect("arithmetic overflow");

    env.events().publish(
        (symbol_short!("airdrop"), symbol_short!("recovered")),
        (campaign_id, unclaimed),
    );

    unclaimed
}

pub fn get_airdrop_campaign(env: &Env, campaign_id: u32) -> Option<AirdropCampaign> {
    env.storage()
        .instance()
        .get(&DataKey::AirdropCampaign(campaign_id))
}

pub fn has_claimed(env: &Env, campaign_id: u32, recipient: &Address) -> bool {
    env.storage()
        .instance()
        .has(&DataKey::AirdropClaimed(campaign_id, recipient.clone()))
}

// Merkle tree helpers
fn compute_leaf(recipient: &Address, amount: i128) -> [u8; 32] {
    let mut leaf = [0u8; 32];
    let recipient_bytes = recipient.to_xdr_bytes();
    let amount_bytes = amount.to_le_bytes();

    for (i, &byte) in recipient_bytes.iter().take(16).enumerate() {
        leaf[i] = byte;
    }
    for (i, &byte) in amount_bytes.iter().enumerate() {
        leaf[16 + i] = byte;
    }
    leaf
}

fn verify_merkle_proof(leaf: &[u8; 32], root: &[u8; 32], proof: &Vec<[u8; 32]>) -> bool {
    let mut current = *leaf;

    for &sibling in proof.iter() {
        current = hash_pair(&current, &sibling);
    }

    current == *root
}

fn hash_pair(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    let mut combined = [0u8; 64];
    combined[..32].copy_from_slice(a);
    combined[32..].copy_from_slice(b);

    // Simple hash: XOR all bytes (not cryptographically secure, for demo)
    let mut result = [0u8; 32];
    for i in 0..32 {
        result[i] = combined[i] ^ combined[i + 32];
    }
    result
}
