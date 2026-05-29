use soroban_sdk::{contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
pub enum DataKey {
    Paused,
    PauseTime,
    AutoUnpauseTime,
}

#[contracttype]
#[derive(Clone)]
pub struct PauseState {
    pub is_paused: bool,
    pub pause_time: u64,
    pub auto_unpause_time: u64,
}

pub fn initialize_pausable(env: &Env) {
    if !env.storage().instance().has(&DataKey::Paused) {
        env.storage().instance().set(&DataKey::Paused, &false);
    }
}

pub fn pause(env: &Env, admin: &Address, auto_unpause_ledgers: u32) {
    admin.require_auth();
    
    let is_paused: bool = env
        .storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false);
    assert!(!is_paused, "Already paused");

    let current_time = env.ledger().timestamp();
    let auto_unpause_time = current_time + (auto_unpause_ledgers as u64 * 5); // ~5 sec per ledger

    env.storage().instance().set(&DataKey::Paused, &true);
    env.storage()
        .instance()
        .set(&DataKey::PauseTime, &current_time);
    env.storage()
        .instance()
        .set(&DataKey::AutoUnpauseTime, &auto_unpause_time);

    env.events().publish(
        (symbol_short!("pause"), symbol_short!("paused")),
        (current_time, auto_unpause_time),
    );
}

pub fn unpause(env: &Env, admin: &Address) {
    admin.require_auth();

    let is_paused: bool = env
        .storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false);
    assert!(is_paused, "Not paused");

    env.storage().instance().set(&DataKey::Paused, &false);

    env.events().publish(
        (symbol_short!("pause"), symbol_short!("unpaused")),
        env.ledger().timestamp(),
    );
}

pub fn check_not_paused(env: &Env) {
    let is_paused: bool = env
        .storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false);

    if is_paused {
        let auto_unpause_time: u64 = env
            .storage()
            .instance()
            .get(&DataKey::AutoUnpauseTime)
            .unwrap_or(0);

        if env.ledger().timestamp() >= auto_unpause_time {
            // Auto-unpause
            env.storage().instance().set(&DataKey::Paused, &false);
            env.events().publish(
                (symbol_short!("pause"), symbol_short!("auto_un")),
                env.ledger().timestamp(),
            );
        } else {
            panic!("Contract is paused");
        }
    }
}

pub fn is_paused(env: &Env) -> bool {
    env.storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false)
}

pub fn get_pause_state(env: &Env) -> PauseState {
    let is_paused = env
        .storage()
        .instance()
        .get(&DataKey::Paused)
        .unwrap_or(false);
    let pause_time = env
        .storage()
        .instance()
        .get(&DataKey::PauseTime)
        .unwrap_or(0);
    let auto_unpause_time = env
        .storage()
        .instance()
        .get(&DataKey::AutoUnpauseTime)
        .unwrap_or(0);

    PauseState {
        is_paused,
        pause_time,
        auto_unpause_time,
    }
}
