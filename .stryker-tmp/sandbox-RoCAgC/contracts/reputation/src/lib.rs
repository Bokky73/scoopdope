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
    Reputation(Address),                    // user → ReputationRecord
    ReputationHistory(Address, u32),        // (user, index) → ReputationUpdate
    ReputationHistoryCount(Address),        // user → u32
    DecayConfig,                           // DecayConfig
    TotalReputation,                       // i128
}

// =============================================================================
// Types
// =============================================================================

#[contracttype]
#[derive(Clone)]
pub struct ReputationRecord {
    pub user: Address,
    pub score: i128,
    pub level: u8,
    pub last_updated: u32,
    pub total_updates: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct ReputationUpdate {
    pub timestamp: u32,
    pub score_change: i128,
    pub reason: Symbol, // 'course_complete', 'review', 'decay', 'reward'
    pub course_id: Option<u64>,
}

#[contracttype]
#[derive(Clone)]
pub struct DecayConfig {
    pub enabled: bool,
    pub decay_rate: i128, // per ledger (e.g., -1 per 1000 ledgers)
    pub decay_interval: u32, // ledgers between decay applications
}

// =============================================================================
// Events
// =============================================================================

const UPDATE_REPUTATION: Symbol = symbol_short!("rep_update");
const DECAY_REPUTATION: Symbol = symbol_short!("rep_decay");
const REWARD_CLAIMED: Symbol = symbol_short!("reward_claim");

// =============================================================================
// Contract
// =============================================================================

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
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

        // Initialize decay config with default values
        let decay_config = DecayConfig {
            enabled: true,
            decay_rate: -1, // -1 point per decay interval
            decay_interval: 1000, // every 1000 ledgers
        };
        env.storage().instance().set(&DataKey::DecayConfig, &decay_config);
        env.storage().instance().set(&DataKey::TotalReputation, &0_i128);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    // -------------------------------------------------------------------------
    // Reputation Management
    // -------------------------------------------------------------------------

    pub fn update_reputation(
        env: Env,
        admin: Address,
        user: Address,
        score_change: i128,
        reason: Symbol,
        course_id: Option<u64>,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can update reputation");

        let current_ledger = env.ledger().sequence();
        let mut reputation = Self::get_reputation_record(env.clone(), user.clone())
            .unwrap_or(ReputationRecord {
                user: user.clone(),
                score: 0,
                level: 1,
                last_updated: current_ledger,
                total_updates: 0,
            });

        // Apply decay if needed
        Self::apply_decay_if_needed(&env, &mut reputation, current_ledger);

        reputation.score = reputation.score.checked_add(score_change).expect("arithmetic overflow");
        reputation.score = reputation.score.max(0); // reputation can't go negative
        reputation.last_updated = current_ledger;
        reputation.total_updates = reputation.total_updates.checked_add(1).expect("arithmetic overflow");
        reputation.level = Self::calculate_level(reputation.score);

        // Store updated reputation
        env.storage().persistent().set(&DataKey::Reputation(user.clone()), &reputation);

        // Add to history
        let history_count: u32 = env.storage().persistent()
            .get(&DataKey::ReputationHistoryCount(user.clone()))
            .unwrap_or(0);
        let update = ReputationUpdate {
            timestamp: env.ledger().timestamp(),
            score_change,
            reason,
            course_id,
        };
        env.storage().persistent().set(
            &DataKey::ReputationHistory(user.clone(), history_count),
            &update
        );
        env.storage().persistent().set(
            &DataKey::ReputationHistoryCount(user.clone()),
            &(history_count + 1)
        );

        // Update total reputation
        let mut total_rep: i128 = env.storage().instance().get(&DataKey::TotalReputation).unwrap_or(0);
        total_rep = total_rep.checked_add(score_change).expect("arithmetic overflow");
        env.storage().instance().set(&DataKey::TotalReputation, &total_rep);

        env.events()
            .publish((UPDATE_REPUTATION, symbol_short!("user")), (user, score_change, reason));
    }

    pub fn get_reputation(env: Env, user: Address) -> i128 {
        let record = Self::get_reputation_record(env.clone(), user);
        match record {
            Some(rep) => {
                let mut rep_copy = rep.clone();
                Self::apply_decay_if_needed(&env, &mut rep_copy, env.ledger().sequence());
                rep_copy.score
            },
            None => 0,
        }
    }

    pub fn get_reputation_record(env: Env, user: Address) -> Option<ReputationRecord> {
        env.storage().persistent().get(&DataKey::Reputation(user))
    }

    pub fn get_reputation_level(env: Env, user: Address) -> u8 {
        let score = Self::get_reputation(env, user);
        Self::calculate_level(score)
    }

    // -------------------------------------------------------------------------
    // Decay Management
    // -------------------------------------------------------------------------

    pub fn apply_decay(env: Env, admin: Address, user: Address) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can apply decay");

        let current_ledger = env.ledger().sequence();
        let mut reputation = Self::get_reputation_record(env.clone(), user.clone())
            .expect("User has no reputation record");

        let old_score = reputation.score;
        Self::apply_decay_if_needed(&env, &mut reputation, current_ledger);

        if old_score != reputation.score {
            env.storage().persistent().set(&DataKey::Reputation(user.clone()), &reputation);

            // Add decay to history
            let history_count: u32 = env.storage().persistent()
                .get(&DataKey::ReputationHistoryCount(user.clone()))
                .unwrap_or(0);
            let decay_amount = reputation.score - old_score;
            let update = ReputationUpdate {
                timestamp: env.ledger().timestamp(),
                score_change: decay_amount,
                reason: symbol_short!("decay"),
                course_id: None,
            };
            env.storage().persistent().set(
                &DataKey::ReputationHistory(user.clone(), history_count),
                &update
            );
            env.storage().persistent().set(
                &DataKey::ReputationHistoryCount(user.clone()),
                &(history_count + 1)
            );

            // Update total reputation
            let mut total_rep: i128 = env.storage().instance().get(&DataKey::TotalReputation).unwrap_or(0);
            total_rep = total_rep.checked_add(decay_amount).expect("arithmetic overflow");
            env.storage().instance().set(&DataKey::TotalReputation, &total_rep);

            env.events()
                .publish((DECAY_REPUTATION, symbol_short!("user")), (user, decay_amount));
        }
    }

    pub fn set_decay_config(
        env: Env,
        admin: Address,
        enabled: bool,
        decay_rate: i128,
        decay_interval: u32,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can set decay config");

        let config = DecayConfig {
            enabled,
            decay_rate,
            decay_interval,
        };
        env.storage().instance().set(&DataKey::DecayConfig, &config);
    }

    pub fn get_decay_config(env: Env) -> DecayConfig {
        env.storage().instance().get(&DataKey::DecayConfig).unwrap_or(DecayConfig {
            enabled: false,
            decay_rate: 0,
            decay_interval: 1000,
        })
    }

    // -------------------------------------------------------------------------
    // Reputation-based Rewards
    // -------------------------------------------------------------------------

    pub fn claim_reputation_reward(env: Env, user: Address) {
        user.require_auth();

        let reputation = Self::get_reputation(env.clone(), user.clone());
        let level = Self::calculate_level(reputation);

        // Reward based on level (example: level * 10 BST tokens)
        let reward_amount = (level as i128) * 10;

        // Here we would typically mint tokens to the user
        // For now, just emit the event
        env.events()
            .publish((REWARD_CLAIMED, symbol_short!("user")), (user, reward_amount));
    }

    // -------------------------------------------------------------------------
    // Verification
    // -------------------------------------------------------------------------

    pub fn verify_reputation_threshold(env: Env, user: Address, min_score: i128) -> bool {
        Self::get_reputation(env, user) >= min_score
    }

    pub fn verify_reputation_level(env: Env, user: Address, min_level: u8) -> bool {
        Self::get_reputation_level(env, user) >= min_level
    }

    // -------------------------------------------------------------------------
    // History
    // -------------------------------------------------------------------------

    pub fn get_reputation_history(env: Env, user: Address, start_index: u32, limit: u32) -> Vec<ReputationUpdate> {
        let history_count: u32 = env.storage().persistent()
            .get(&DataKey::ReputationHistoryCount(user.clone()))
            .unwrap_or(0);

        let mut history = Vec::new(&env);
        let end_index = (start_index + limit).min(history_count);

        for i in start_index..end_index {
            if let Some(update) = env.storage().persistent()
                .get(&DataKey::ReputationHistory(user.clone(), i)) {
                history.push_back(update);
            }
        }

        history
    }

    pub fn get_total_reputation(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalReputation).unwrap_or(0)
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    fn calculate_level(score: i128) -> u8 {
        // Level calculation: level = floor(sqrt(score / 100)) + 1
        // This gives levels: 1 (0-99), 2 (100-399), 3 (400-899), etc.
        if score <= 0 {
            1
        } else {
            let normalized = score / 100;
            let sqrt = (normalized as f64).sqrt() as u8;
            sqrt + 1
        }
    }

    fn apply_decay_if_needed(env: &Env, reputation: &mut ReputationRecord, current_ledger: u32) {
        let config = Self::get_decay_config(env.clone());
        if !config.enabled {
            return;
        }

        let ledgers_since_update = current_ledger.saturating_sub(reputation.last_updated);
        if ledgers_since_update >= config.decay_interval {
            let decay_periods = ledgers_since_update / config.decay_interval;
            let decay_amount = config.decay_rate * (decay_periods as i128);
            reputation.score = reputation.score.saturating_add(decay_amount);
            reputation.score = reputation.score.max(0); // can't go negative
            reputation.last_updated = current_ledger;
        }
    }
}