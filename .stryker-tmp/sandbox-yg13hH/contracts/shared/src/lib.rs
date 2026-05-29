#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, Symbol, Vec};

pub mod pausable;

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum Role {
    Admin,
    Instructor,
    Student,
}

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum Permission {
    CreateCourse,
    EnrollStudent,
    IssueCredential,
    MintToken,
    ManageUsers,
    Upgrade,
}

#[contracttype]
#[derive(Clone)]
pub struct CrossContractCallRecord {
    pub id: u64,
    pub caller: Address,
    pub target_contract: Address,
    pub method: Symbol,
    pub status: Symbol,                  // "pending", "success", "failed"
    pub created_at: u64,
    pub executed_at: u64,
}

#[contracttype]
pub enum DataKey {
    Role(Address),
    Admin,
    Governance,                          // Address of the governance contract
    CrossContractCall(u64),              // id → CrossContractCallRecord
    NextCallId,                          // u64 counter
    AuthorizedCallers(Address),          // contract → Vec<Address> (authorized callers)
    WasmHistory,                         // Vec<BytesN<32>>
    CurrentVersion,                      // u32
    MigratedVersion,                     // u32
}

#[contract]
pub struct SharedContract;

/// Returns true if `role` grants `permission`.
fn role_has_permission(role: &Role, permission: &Permission) -> bool {
    match role {
        Role::Admin => true, // Admin has all permissions
        Role::Instructor => matches!(
            permission,
            Permission::CreateCourse | Permission::EnrollStudent
        ),
        Role::Student => false,
    }
}

#[contractimpl]
impl SharedContract {
    /// Initialize the contract with an admin address
    pub fn initialize(env: Env, admin: Address, governance: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Governance, &governance);
        env.storage()
            .instance()
            .set(&DataKey::Role(admin.clone()), &Role::Admin);
        env.storage().instance().set(&DataKey::CurrentVersion, &1_u32);
        env.storage().instance().set(&DataKey::MigratedVersion, &1_u32);
    }

    /// Set the governance address (admin only)
    pub fn set_governance(env: Env, caller: Address, governance: Address) {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(caller == admin, "Only admin can set governance");
        env.storage().instance().set(&DataKey::Governance, &governance);
    }

    /// Upgrade the contract WASM code. Only callable by governance.
    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
        let governance: Address = env.storage().instance().get(&DataKey::Governance).expect("Governance not set");
        governance.require_auth();

        // Update WASM history for rollbacks
        let mut history: Vec<BytesN<32>> = env.storage().persistent().get(&DataKey::WasmHistory).unwrap_or(Vec::new(&env));
        let current_wasm: BytesN<32> = env.deployer().current_contract_wasm_hash();
        history.push_back(current_wasm);
        env.storage().persistent().set(&DataKey::WasmHistory, &history);

        // Update version
        let version: u32 = env.storage().instance().get(&DataKey::CurrentVersion).unwrap_or(1);
        env.storage().instance().set(&DataKey::CurrentVersion, &(version + 1));

        // Perform the upgrade
        env.deployer().update_current_contract_wasm(new_wasm_hash);
    }

    /// Rollback to the previous WASM version. Only callable by governance.
    pub fn rollback(env: Env) {
        let governance: Address = env.storage().instance().get(&DataKey::Governance).expect("Governance not set");
        governance.require_auth();

        let mut history: Vec<BytesN<32>> = env.storage().persistent().get(&DataKey::WasmHistory).expect("No history");
        assert!(history.len() > 0, "Nothing to rollback to");

        let prev_wasm = history.pop_back().unwrap();
        env.storage().persistent().set(&DataKey::WasmHistory, &history);

        // Version stays the same or we could decrement it, but usually upgrades increment version.
        // We'll keep the version incrementing even on rollbacks to indicate a state change.
        let version: u32 = env.storage().instance().get(&DataKey::CurrentVersion).unwrap_or(1);
        env.storage().instance().set(&DataKey::CurrentVersion, &(version + 1));

        // Perform the rollback
        env.deployer().update_current_contract_wasm(prev_wasm);
    }

    /// Perform state migration after an upgrade.
    /// This should be called once per version.
    pub fn migrate(env: Env, admin: Address) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can migrate");

        let current_version: u32 = env.storage().instance().get(&DataKey::CurrentVersion).unwrap_or(1);
        let migrated_version: u32 = env.storage().instance().get(&DataKey::MigratedVersion).unwrap_or(0);
        
        assert!(current_version > migrated_version, "Already migrated to this version");

        // Migration logic for specific versions can be added here
        // Example:
        // if current_version == 2 {
        //     // migration code...
        // }

        env.storage().instance().set(&DataKey::MigratedVersion, &current_version);
    }

    /// Get current version
    pub fn get_version(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::CurrentVersion).unwrap_or(1)
    }

    /// Assign a role to an address (admin only). Emits ("rbac", "role_assigned").
    pub fn assign_role(env: Env, caller: Address, target: Address, role: Role) {
        caller.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(caller == admin, "Only admin can assign roles");
        env.storage()
            .instance()
            .set(&DataKey::Role(target.clone()), &role);

        env.events().publish(
            (symbol_short!("rbac"), symbol_short!("role_asgn")),
            (target, role),
        );
    }

    /// Check if an address has a specific role
    pub fn has_role(env: Env, addr: Address, role: Role) -> bool {
        let stored: Option<Role> = env.storage().instance().get(&DataKey::Role(addr));
        match (stored, role) {
            (Some(Role::Admin), Role::Admin) => true,
            (Some(Role::Instructor), Role::Instructor) => true,
            (Some(Role::Student), Role::Student) => true,
            _ => false,
        }
    }

    /// Check if an address has a specific permission based on its assigned role
    pub fn has_permission(env: Env, addr: Address, permission: Permission) -> bool {
        let stored: Option<Role> = env.storage().instance().get(&DataKey::Role(addr));
        match stored {
            Some(role) => role_has_permission(&role, &permission),
            None => false,
        }
    }

    /// Upgrade the contract wasm (admin only). Emits ("shared", "upgraded").
    pub fn upgrade(env: Env, admin: Address, new_wasm_hash: BytesN<32>) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can upgrade");

        env.events().publish(
            (symbol_short!("shared"), symbol_short!("upgraded")),
            new_wasm_hash.clone(),
        );

        env.deployer()
            .update_current_contract_wasm(new_wasm_hash);
    }

    // -------------------------------------------------------------------------
    // Cross-Contract Communication
    // -------------------------------------------------------------------------

    pub fn authorize_caller(
        env: Env,
        admin: Address,
        target_contract: Address,
        caller: Address,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can authorize");

        let key = DataKey::AuthorizedCallers(target_contract.clone());
        let mut callers: soroban_sdk::Vec<Address> = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or_else(|| soroban_sdk::vec![&env]);

        if !callers.contains(&caller) {
            callers.push_back(caller.clone());
            env.storage().instance().set(&key, &callers);
        }

        env.events().publish(
            (symbol_short!("shared"), symbol_short!("auth_call")),
            (target_contract, caller),
        );
    }

    pub fn is_caller_authorized(
        env: Env,
        target_contract: Address,
        caller: Address,
    ) -> bool {
        let key = DataKey::AuthorizedCallers(target_contract);
        let callers: Option<soroban_sdk::Vec<Address>> = env.storage().instance().get(&key);
        match callers {
            Some(c) => c.contains(&caller),
            None => false,
        }
    }

    pub fn call_contract(
        env: Env,
        caller: Address,
        target_contract: Address,
        method: Symbol,
    ) -> u64 {
        caller.require_auth();

        // Check authorization
        assert!(
            Self::is_caller_authorized(env.clone(), target_contract.clone(), caller.clone()),
            "Caller not authorized"
        );

        let id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextCallId)
            .unwrap_or(1);

        let call_record = CrossContractCallRecord {
            id,
            caller: caller.clone(),
            target_contract: target_contract.clone(),
            method: method.clone(),
            status: symbol_short!("pending"),
            created_at: env.ledger().timestamp(),
            executed_at: 0,
        };

        env.storage()
            .instance()
            .set(&DataKey::CrossContractCall(id), &call_record);
        env.storage()
            .instance()
            .set(&DataKey::NextCallId, &(id + 1));

        env.events().publish(
            (symbol_short!("shared"), symbol_short!("call_init")),
            (id, target_contract, method),
        );

        id
    }

    pub fn get_call_record(env: Env, call_id: u64) -> Option<CrossContractCallRecord> {
        env.storage()
            .instance()
            .get(&DataKey::CrossContractCall(call_id))
    }

    pub fn relay_event(
        env: Env,
        caller: Address,
        source_contract: Address,
        event_topic: Symbol,
    ) {
        caller.require_auth();

        // Check authorization
        assert!(
            Self::is_caller_authorized(env.clone(), source_contract.clone(), caller.clone()),
            "Caller not authorized"
        );

        env.events().publish(
            (symbol_short!("shared"), symbol_short!("relay")),
            (source_contract, event_topic),
        );
    }

    // -------------------------------------------------------------------------
    // Emergency Pause
    // -------------------------------------------------------------------------

    pub fn pause_contract(env: Env, admin: Address, auto_unpause_ledgers: u32) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can pause");
        pausable::pause(&env, &admin, auto_unpause_ledgers);
    }

    pub fn unpause_contract(env: Env, admin: Address) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can unpause");
        pausable::unpause(&env, &admin);
    }

    pub fn is_contract_paused(env: Env) -> bool {
        pausable::is_paused(&env)
    }

    pub fn get_pause_state(env: Env) -> pausable::PauseState {
        pausable::get_pause_state(&env)
    }
}

pub mod multisig;

mod tests;
