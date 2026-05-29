#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, IntoVal, String,
    Symbol, Vec,
};

const TTL_THRESHOLD: u32 = 100;
const TTL_EXTEND_TO: u32 = 500;

// =============================================================================
// Storage keys
// =============================================================================

#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    Grant(u64),                          // id → GrantRecord
    GrantMilestone(u64, u32),            // (grant_id, milestone_idx) → MilestoneRecord
    GrantReporting(u64),                 // id → Vec<ReportRecord>
    NextGrantId,                         // u64 counter
    ApplicantGrants(Address),            // address → Vec<u64>
}

// =============================================================================
// Types
// =============================================================================

#[contracttype]
#[derive(Clone)]
pub struct GrantRecord {
    pub id: u64,
    pub applicant: Address,
    pub title: String,
    pub description: String,
    pub total_amount: i128,
    pub status: Symbol,                  // "pending", "approved", "active", "completed", "rejected"
    pub created_at: u64,
    pub approved_at: u64,
    pub milestone_count: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct MilestoneRecord {
    pub grant_id: u64,
    pub milestone_idx: u32,
    pub description: String,
    pub amount: i128,
    pub released: bool,
    pub released_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct ReportRecord {
    pub grant_id: u64,
    pub report_idx: u32,
    pub content: String,
    pub submitted_at: u64,
}

// =============================================================================
// Contract
// =============================================================================

#[contract]
pub struct GrantsContract;

#[contractimpl]
impl GrantsContract {
    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    pub fn initialize(env: Env, admin: Address, token_contract: Address) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "Already initialized"
        );
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::TokenContract, &token_contract);
        env.storage().instance().set(&DataKey::NextGrantId, &1_u64);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    // -------------------------------------------------------------------------
    // Grant Application
    // -------------------------------------------------------------------------

    pub fn apply_for_grant(
        env: Env,
        applicant: Address,
        title: String,
        description: String,
        total_amount: i128,
        milestone_count: u32,
    ) -> u64 {
        applicant.require_auth();
        assert!(total_amount > 0, "Amount must be positive");
        assert!(milestone_count > 0, "Must have at least one milestone");

        let id: u64 = env.storage().instance().get(&DataKey::NextGrantId).unwrap();
        let grant = GrantRecord {
            id,
            applicant: applicant.clone(),
            title,
            description,
            total_amount,
            status: symbol_short!("pending"),
            created_at: env.ledger().timestamp(),
            approved_at: 0,
            milestone_count,
        };

        env.storage().persistent().set(&DataKey::Grant(id), &grant);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Grant(id), TTL_THRESHOLD, TTL_EXTEND_TO);

        // Add to applicant's grant list
        let index_key = DataKey::ApplicantGrants(applicant.clone());
        let mut grants: Vec<u64> = env
            .storage()
            .persistent()
            .get(&index_key)
            .unwrap_or_else(|| vec![&env]);
        grants.push_back(id);
        env.storage().persistent().set(&index_key, &grants);
        env.storage()
            .persistent()
            .extend_ttl(&index_key, TTL_THRESHOLD, TTL_EXTEND_TO);

        env.storage()
            .instance()
            .set(&DataKey::NextGrantId, &(id + 1));

        env.events().publish(
            (symbol_short!("grants"), symbol_short!("applied")),
            (id, applicant, total_amount),
        );

        id
    }

    // -------------------------------------------------------------------------
    // Grant Approval Workflow
    // -------------------------------------------------------------------------

    pub fn approve_grant(env: Env, admin: Address, grant_id: u64) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can approve grants");

        let mut grant: GrantRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Grant(grant_id))
            .expect("Grant not found");

        assert!(grant.status == symbol_short!("pending"), "Grant not pending");

        grant.status = symbol_short!("approved");
        grant.approved_at = env.ledger().timestamp();
        env.storage()
            .persistent()
            .set(&DataKey::Grant(grant_id), &grant);
        env.storage()
            .persistent()
            .extend_ttl(&DataKey::Grant(grant_id), TTL_THRESHOLD, TTL_EXTEND_TO);

        env.events().publish(
            (symbol_short!("grants"), symbol_short!("approved")),
            (grant_id, grant.applicant),
        );
    }

    pub fn reject_grant(env: Env, admin: Address, grant_id: u64) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can reject grants");

        let mut grant: GrantRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Grant(grant_id))
            .expect("Grant not found");

        assert!(grant.status == symbol_short!("pending"), "Grant not pending");

        grant.status = symbol_short!("rejected");
        env.storage()
            .persistent()
            .set(&DataKey::Grant(grant_id), &grant);

        env.events().publish(
            (symbol_short!("grants"), symbol_short!("rejected")),
            (grant_id, grant.applicant),
        );
    }

    // -------------------------------------------------------------------------
    // Milestone-Based Fund Release
    // -------------------------------------------------------------------------

    pub fn set_milestone(
        env: Env,
        admin: Address,
        grant_id: u64,
        milestone_idx: u32,
        description: String,
        amount: i128,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can set milestones");

        let grant: GrantRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Grant(grant_id))
            .expect("Grant not found");

        assert!(milestone_idx < grant.milestone_count, "Invalid milestone index");
        assert!(amount > 0, "Amount must be positive");

        let milestone = MilestoneRecord {
            grant_id,
            milestone_idx,
            description,
            amount,
            released: false,
            released_at: 0,
        };

        let key = DataKey::GrantMilestone(grant_id, milestone_idx);
        env.storage().persistent().set(&key, &milestone);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);

        env.events().publish(
            (symbol_short!("grants"), symbol_short!("milestone")),
            (grant_id, milestone_idx, amount),
        );
    }

    pub fn release_milestone_funds(env: Env, admin: Address, grant_id: u64, milestone_idx: u32) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can release funds");

        let grant: GrantRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Grant(grant_id))
            .expect("Grant not found");

        assert!(grant.status == symbol_short!("approved"), "Grant not approved");

        let key = DataKey::GrantMilestone(grant_id, milestone_idx);
        let mut milestone: MilestoneRecord = env
            .storage()
            .persistent()
            .get(&key)
            .expect("Milestone not found");

        assert!(!milestone.released, "Milestone already released");

        milestone.released = true;
        milestone.released_at = env.ledger().timestamp();
        env.storage().persistent().set(&key, &milestone);
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);

        // Transfer tokens to applicant
        let token_contract: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .unwrap();
        let _: () = env.invoke_contract(
            &token_contract,
            &symbol_short!("transfer"),
            soroban_sdk::vec![
                &env,
                admin.into_val(&env),
                grant.applicant.clone().into_val(&env),
                milestone.amount.into_val(&env)
            ],
        );

        env.events().publish(
            (symbol_short!("grants"), symbol_short!("released")),
            (grant_id, milestone_idx, milestone.amount),
        );
    }

    // -------------------------------------------------------------------------
    // Grant Reporting
    // -------------------------------------------------------------------------

    pub fn submit_report(
        env: Env,
        applicant: Address,
        grant_id: u64,
        content: String,
    ) {
        applicant.require_auth();

        let grant: GrantRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Grant(grant_id))
            .expect("Grant not found");

        assert!(grant.applicant == applicant, "Only grant applicant can report");

        let report_key = DataKey::GrantReporting(grant_id);
        let mut reports: Vec<ReportRecord> = env
            .storage()
            .persistent()
            .get(&report_key)
            .unwrap_or_else(|| vec![&env]);

        let report = ReportRecord {
            grant_id,
            report_idx: reports.len() as u32,
            content,
            submitted_at: env.ledger().timestamp(),
        };

        reports.push_back(report);
        env.storage().persistent().set(&report_key, &reports);
        env.storage()
            .persistent()
            .extend_ttl(&report_key, TTL_THRESHOLD, TTL_EXTEND_TO);

        env.events().publish(
            (symbol_short!("grants"), symbol_short!("report")),
            (grant_id, reports.len() as u32),
        );
    }

    // -------------------------------------------------------------------------
    // Reading
    // -------------------------------------------------------------------------

    pub fn get_grant(env: Env, grant_id: u64) -> Option<GrantRecord> {
        let key = DataKey::Grant(grant_id);
        let grant = env.storage().persistent().get(&key)?;
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        Some(grant)
    }

    pub fn get_milestone(
        env: Env,
        grant_id: u64,
        milestone_idx: u32,
    ) -> Option<MilestoneRecord> {
        let key = DataKey::GrantMilestone(grant_id, milestone_idx);
        let milestone = env.storage().persistent().get(&key)?;
        env.storage()
            .persistent()
            .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
        Some(milestone)
    }

    pub fn get_grant_reports(env: Env, grant_id: u64) -> Vec<ReportRecord> {
        let key = DataKey::GrantReporting(grant_id);
        match env.storage().persistent().get(&key) {
            Some(reports) => {
                env.storage()
                    .persistent()
                    .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
                reports
            }
            None => vec![&env],
        }
    }

    pub fn get_applicant_grants(env: Env, applicant: Address) -> Vec<u64> {
        let key = DataKey::ApplicantGrants(applicant);
        match env.storage().persistent().get(&key) {
            Some(grants) => {
                env.storage()
                    .persistent()
                    .extend_ttl(&key, TTL_THRESHOLD, TTL_EXTEND_TO);
                grants
            }
            None => vec![&env],
        }
    }
}

// =============================================================================
// Tests
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    fn setup() -> (Env, GrantsContractClient<'static>, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, GrantsContract);
        let client = GrantsContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let token = Address::generate(&env);
        client.initialize(&admin, &token);
        (env, client, admin, token)
    }

    #[test]
    fn test_initialize() {
        let (_, client, admin, _) = setup();
        assert_eq!(client.get_admin(), admin);
    }

    #[test]
    fn test_apply_for_grant() {
        let (env, client, _, _) = setup();
        let applicant = Address::generate(&env);
        let title = String::from_str(&env, "Blockchain Education");
        let desc = String::from_str(&env, "Course development");

        let id = client.apply_for_grant(&applicant, &title, &desc, &1000, &2);
        assert_eq!(id, 1);

        let grant = client.get_grant(&id).unwrap();
        assert_eq!(grant.applicant, applicant);
        assert_eq!(grant.total_amount, 1000);
        assert_eq!(grant.milestone_count, 2);
    }

    #[test]
    fn test_approve_grant() {
        let (env, client, admin, _) = setup();
        let applicant = Address::generate(&env);
        let title = String::from_str(&env, "Test");
        let desc = String::from_str(&env, "Test");

        let id = client.apply_for_grant(&applicant, &title, &desc, &1000, &1);
        client.approve_grant(&admin, &id);

        let grant = client.get_grant(&id).unwrap();
        assert_eq!(grant.status, symbol_short!("approved"));
    }

    #[test]
    fn test_reject_grant() {
        let (env, client, admin, _) = setup();
        let applicant = Address::generate(&env);
        let title = String::from_str(&env, "Test");
        let desc = String::from_str(&env, "Test");

        let id = client.apply_for_grant(&applicant, &title, &desc, &1000, &1);
        client.reject_grant(&admin, &id);

        let grant = client.get_grant(&id).unwrap();
        assert_eq!(grant.status, symbol_short!("rejected"));
    }

    #[test]
    fn test_set_milestone() {
        let (env, client, admin, _) = setup();
        let applicant = Address::generate(&env);
        let title = String::from_str(&env, "Test");
        let desc = String::from_str(&env, "Test");

        let grant_id = client.apply_for_grant(&applicant, &title, &desc, &1000, &2);
        client.approve_grant(&admin, &grant_id);

        let milestone_desc = String::from_str(&env, "Phase 1");
        client.set_milestone(&admin, &grant_id, &0, &milestone_desc, &500);

        let milestone = client.get_milestone(&grant_id, &0).unwrap();
        assert_eq!(milestone.amount, 500);
        assert!(!milestone.released);
    }

    #[test]
    fn test_submit_report() {
        let (env, client, admin, _) = setup();
        let applicant = Address::generate(&env);
        let title = String::from_str(&env, "Test");
        let desc = String::from_str(&env, "Test");

        let grant_id = client.apply_for_grant(&applicant, &title, &desc, &1000, &1);
        client.approve_grant(&admin, &grant_id);

        let report = String::from_str(&env, "Progress update");
        client.submit_report(&applicant, &grant_id, &report);

        let reports = client.get_grant_reports(&grant_id);
        assert_eq!(reports.len(), 1);
    }

    #[test]
    fn test_get_applicant_grants() {
        let (env, client, admin, _) = setup();
        let applicant = Address::generate(&env);
        let title = String::from_str(&env, "Test");
        let desc = String::from_str(&env, "Test");

        let id1 = client.apply_for_grant(&applicant, &title, &desc, &1000, &1);
        let id2 = client.apply_for_grant(&applicant, &title, &desc, &2000, &1);

        let grants = client.get_applicant_grants(&applicant);
        assert_eq!(grants.len(), 2);
        assert_eq!(grants.get(0).unwrap(), id1);
        assert_eq!(grants.get(1).unwrap(), id2);
    }
}
