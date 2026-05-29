#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

// =============================================================================
// Storage keys
// =============================================================================

#[contracttype]
pub enum DataKey {
    Admin,
    Certificate(u64),                    // id → CertificateRecord
    OwnerCertificates(Address),          // owner → Vec<u64>
    NextId,                              // u64 counter
    Revocation(u64),                     // id → RevocationRecord
}

// =============================================================================
// Types
// =============================================================================

#[contracttype]
#[derive(Clone)]
pub struct CertificateRecord {
    pub id: u64,
    pub owner: Address,
    pub course_id: Symbol,
    pub metadata_url: String,
    pub issued_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct RevocationRecord {
    pub certificate_id: u64,
    pub revoked_at: u64,
    pub reason: String,
}

// =============================================================================
// Events
// =============================================================================

const MINT: Symbol = symbol_short!("mint");
const REVOKE: Symbol = symbol_short!("revoke");

// =============================================================================
// Contract
// =============================================================================

#[contract]
pub struct CertificateContract;

#[contractimpl]
impl CertificateContract {
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
    // Minting (admin only)
    // -------------------------------------------------------------------------

    pub fn mint_certificate(
        env: Env,
        admin: Address,
        recipient: Address,
        course_id: Symbol,
        metadata_url: String,
    ) -> u64 {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can mint");

        let id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap();
        let cert = CertificateRecord {
            id,
            owner: recipient.clone(),
            course_id: course_id.clone(),
            metadata_url,
            issued_at: env.ledger().timestamp(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Certificate(id), &cert);

        // Add to owner's certificate list
        let owner_key = DataKey::OwnerCertificates(recipient.clone());
        let mut certs: soroban_sdk::Vec<u64> = env
            .storage()
            .persistent()
            .get(&owner_key)
            .unwrap_or_else(|| soroban_sdk::vec![&env]);
        certs.push_back(id);
        env.storage().persistent().set(&owner_key, &certs);

        // Increment counter
        env.storage()
            .instance()
            .set(&DataKey::NextId, &(id + 1));

        env.events()
            .publish((MINT, symbol_short!("to"), recipient), (id, course_id));

        id
    }

    // -------------------------------------------------------------------------
    // Reading
    // -------------------------------------------------------------------------

    pub fn get_certificate(env: Env, id: u64) -> Option<CertificateRecord> {
        env.storage()
            .persistent()
            .get(&DataKey::Certificate(id))
    }

    pub fn get_certificates_by_owner(env: Env, owner: Address) -> soroban_sdk::Vec<CertificateRecord> {
        let owner_key = DataKey::OwnerCertificates(owner.clone());
        let ids: soroban_sdk::Vec<u64> = match env.storage().persistent().get(&owner_key) {
            Some(i) => i,
            None => return soroban_sdk::vec![&env],
        };

        let mut results = soroban_sdk::vec![&env];
        for id in ids.iter() {
            if let Some(cert) = env.storage().persistent().get(&DataKey::Certificate(id)) {
                results.push_back(cert);
            }
        }
        results
    }

    // -------------------------------------------------------------------------
    // Revocation (admin only)
    // -------------------------------------------------------------------------

    pub fn revoke_certificate(env: Env, admin: Address, cert_id: u64, reason: String) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can revoke");
        assert!(
            env.storage()
                .persistent()
                .has(&DataKey::Certificate(cert_id)),
            "Certificate not found"
        );
        assert!(
            !env.storage()
                .persistent()
                .has(&DataKey::Revocation(cert_id)),
            "Certificate already revoked"
        );

        let revocation = RevocationRecord {
            certificate_id: cert_id,
            revoked_at: env.ledger().timestamp(),
            reason: reason.clone(),
        };

        env.storage()
            .persistent()
            .set(&DataKey::Revocation(cert_id), &revocation);

        env.events()
            .publish((REVOKE, symbol_short!("cert_id")), (cert_id, reason));
    }

    pub fn is_revoked(env: Env, cert_id: u64) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Revocation(cert_id))
    }

    pub fn get_revocation(env: Env, cert_id: u64) -> Option<RevocationRecord> {
        env.storage()
            .persistent()
            .get(&DataKey::Revocation(cert_id))
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
    use soroban_sdk::{symbol_short, Env};

    fn setup() -> (Env, CertificateContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let id = env.register_contract(None, CertificateContract);
        let client = CertificateContractClient::new(&env, &id);
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
    fn test_mint_certificate() {
        let (env, client, admin) = setup();
        let recipient = Address::generate(&env);
        let course = symbol_short!("RUST101");
        let url = String::from_str(&env, "https://example.com/cert/1");

        let id = client.mint_certificate(&admin, &recipient, &course, &url);
        assert_eq!(id, 1);

        let cert = client.get_certificate(&id).unwrap();
        assert_eq!(cert.owner, recipient);
        assert_eq!(cert.course_id, course);
        assert_eq!(cert.id, 1);
    }

    #[test]
    fn test_mint_increments_id() {
        let (env, client, admin) = setup();
        let recipient = Address::generate(&env);
        let course = symbol_short!("RUST101");
        let url = String::from_str(&env, "https://example.com/cert");

        let id1 = client.mint_certificate(&admin, &recipient, &course, &url);
        let id2 = client.mint_certificate(&admin, &recipient, &course, &url);
        assert_eq!(id1, 1);
        assert_eq!(id2, 2);
    }

    #[test]
    #[should_panic(expected = "Only admin can mint")]
    fn test_non_admin_cannot_mint() {
        let (env, client, _) = setup();
        let rando = Address::generate(&env);
        let recipient = Address::generate(&env);
        let course = symbol_short!("RUST101");
        let url = String::from_str(&env, "https://example.com/cert");
        client.mint_certificate(&rando, &recipient, &course, &url);
    }

    #[test]
    fn test_get_certificates_by_owner() {
        let (env, client, admin) = setup();
        let owner = Address::generate(&env);
        let course1 = symbol_short!("RUST101");
        let course2 = symbol_short!("SOL201");
        let url = String::from_str(&env, "https://example.com/cert");

        client.mint_certificate(&admin, &owner, &course1, &url);
        client.mint_certificate(&admin, &owner, &course2, &url);

        let certs = client.get_certificates_by_owner(&owner);
        assert_eq!(certs.len(), 2);
        assert_eq!(certs.get(0).unwrap().course_id, course1);
        assert_eq!(certs.get(1).unwrap().course_id, course2);
    }

    #[test]
    fn test_get_certificates_by_owner_empty() {
        let (env, client, _) = setup();
        let owner = Address::generate(&env);
        let certs = client.get_certificates_by_owner(&owner);
        assert_eq!(certs.len(), 0);
    }

    #[test]
    #[should_panic(expected = "soulbound")]
    fn test_transfer_panics() {
        let (env, client, admin) = setup();
        let owner = Address::generate(&env);
        let other = Address::generate(&env);
        let course = symbol_short!("RUST101");
        let url = String::from_str(&env, "https://example.com/cert");

        let id = client.mint_certificate(&admin, &owner, &course, &url);
        client.transfer(&owner, &other, &id);
    }

    #[test]
    fn test_revoke_certificate() {
        let (env, client, admin) = setup();
        let owner = Address::generate(&env);
        let course = symbol_short!("RUST101");
        let url = String::from_str(&env, "https://example.com/cert");
        let reason = String::from_str(&env, "Academic misconduct");

        let id = client.mint_certificate(&admin, &owner, &course, &url);
        assert!(!client.is_revoked(&id));

        client.revoke_certificate(&admin, &id, &reason);
        assert!(client.is_revoked(&id));

        let revocation = client.get_revocation(&id).unwrap();
        assert_eq!(revocation.certificate_id, id);
        assert_eq!(revocation.reason, reason);
    }

    #[test]
    #[should_panic(expected = "Only admin can revoke")]
    fn test_non_admin_cannot_revoke() {
        let (env, client, admin) = setup();
        let owner = Address::generate(&env);
        let rando = Address::generate(&env);
        let course = symbol_short!("RUST101");
        let url = String::from_str(&env, "https://example.com/cert");
        let reason = String::from_str(&env, "Test");

        let id = client.mint_certificate(&admin, &owner, &course, &url);
        client.revoke_certificate(&rando, &id, &reason);
    }

    #[test]
    #[should_panic(expected = "Certificate not found")]
    fn test_revoke_nonexistent_certificate_panics() {
        let (env, client, admin) = setup();
        let reason = String::from_str(&env, "Test");
        client.revoke_certificate(&admin, &999, &reason);
    }

    #[test]
    #[should_panic(expected = "Certificate already revoked")]
    fn test_revoke_twice_panics() {
        let (env, client, admin) = setup();
        let owner = Address::generate(&env);
        let course = symbol_short!("RUST101");
        let url = String::from_str(&env, "https://example.com/cert");
        let reason = String::from_str(&env, "Test");

        let id = client.mint_certificate(&admin, &owner, &course, &url);
        client.revoke_certificate(&admin, &id, &reason);
        client.revoke_certificate(&admin, &id, &reason);
    }
}
