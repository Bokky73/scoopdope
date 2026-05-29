use soroban_sdk::{contracttype, Address, Env, Symbol, symbol_short, i128};

#[contracttype]
#[derive(Clone)]
pub struct StakeRecord {
    pub staker: Address,
    pub amount: i128,
    pub lock_start_ledger: u32,
    pub lock_end_ledger: u32,
    pub rewards_earned: i128,
}

#[contracttype]
pub enum StakingKey {
    Stake(Address),
    TotalStaked,
    RewardRate,
    EarlyWithdrawalPenalty,
    StakingAnalytics(Address),
}

pub const STAKE_CREATED: Symbol = symbol_short!("stake");
pub const STAKE_WITHDRAWN: Symbol = symbol_short!("unstake");
pub const REWARDS_CLAIMED: Symbol = symbol_short!("reward");

pub fn stake(
    env: &Env,
    staker: Address,
    amount: i128,
    lock_periods: u32,
) -> StakeRecord {
    staker.require_auth();
    assert!(amount > 0, "Stake amount must be positive");

    let lock_end = env.ledger().sequence() + (lock_periods * 100); // ~100 ledgers per period

    let mut record = StakeRecord {
        staker: staker.clone(),
        amount,
        lock_start_ledger: env.ledger().sequence(),
        lock_end_ledger: lock_end,
        rewards_earned: 0,
    };

    let total_staked: i128 = env
        .storage()
        .instance()
        .get(&StakingKey::TotalStaked)
        .unwrap_or(0);

    env.storage()
        .instance()
        .set(&StakingKey::Stake(staker.clone()), &record);
    env.storage()
        .instance()
        .set(&StakingKey::TotalStaked, &(total_staked + amount));

    env.events()
        .publish((STAKE_CREATED,), (staker.clone(), amount, lock_periods));

    record
}

pub fn calculate_rewards(env: &Env, staker: &Address) -> i128 {
    let record: Option<StakeRecord> = env
        .storage()
        .instance()
        .get(&StakingKey::Stake(staker.clone()));

    match record {
        Some(stake) => {
            let reward_rate: i128 = env
                .storage()
                .instance()
                .get(&StakingKey::RewardRate)
                .unwrap_or(500); // 5% default

            let elapsed_ledgers = env.ledger().sequence() - stake.lock_start_ledger;
            let reward = (stake.amount * reward_rate * elapsed_ledgers as i128) / 1_000_000;
            reward
        }
        None => 0,
    }
}

pub fn withdraw(env: &Env, staker: Address, early: bool) -> i128 {
    staker.require_auth();

    let mut record: StakeRecord = env
        .storage()
        .instance()
        .get(&StakingKey::Stake(staker.clone()))
        .expect("No stake found");

    let current_ledger = env.ledger().sequence();
    let is_locked = current_ledger < record.lock_end_ledger;

    let mut withdrawal_amount = record.amount;

    if early && is_locked {
        let penalty: i128 = env
            .storage()
            .instance()
            .get(&StakingKey::EarlyWithdrawalPenalty)
            .unwrap_or(100); // 1% default

        let penalty_amount = (record.amount * penalty) / 10_000;
        withdrawal_amount -= penalty_amount;
    }

    let rewards = calculate_rewards(env, &staker);
    withdrawal_amount += rewards;

    let total_staked: i128 = env
        .storage()
        .instance()
        .get(&StakingKey::TotalStaked)
        .unwrap_or(0);

    env.storage()
        .instance()
        .set(&StakingKey::TotalStaked, &(total_staked - record.amount));
    env.storage()
        .instance()
        .remove(&StakingKey::Stake(staker.clone()));

    env.events()
        .publish((STAKE_WITHDRAWN,), (staker.clone(), withdrawal_amount));

    withdrawal_amount
}

pub fn claim_rewards(env: &Env, staker: Address) -> i128 {
    staker.require_auth();

    let mut record: StakeRecord = env
        .storage()
        .instance()
        .get(&StakingKey::Stake(staker.clone()))
        .expect("No stake found");

    let rewards = calculate_rewards(env, &staker);
    record.rewards_earned += rewards;

    env.storage()
        .instance()
        .set(&StakingKey::Stake(staker.clone()), &record);

    env.events()
        .publish((REWARDS_CLAIMED,), (staker.clone(), rewards));

    rewards
}

pub fn get_stake(env: &Env, staker: Address) -> Option<StakeRecord> {
    env.storage()
        .instance()
        .get(&StakingKey::Stake(staker))
}

pub fn get_total_staked(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get(&StakingKey::TotalStaked)
        .unwrap_or(0)
}
