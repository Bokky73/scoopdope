#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

pub mod staking;
pub mod airdrop;

#[cfg(test)]
mod fuzz_tests;

// =============================================================================
// Storage keys
// =============================================================================

#[contracttype]
pub enum DataKey {
    Admin,
    Balance(Address),
    Allowance(Address, Address), // (owner, spender)
    TotalSupply,
    Vesting(Address),
    Locked, // reentrancy guard
    BurnStats,
    VestingV2(Address, u32),     // (beneficiary, schedule_id)
    VestingScheduleCount(Address), // count of schedules per beneficiary
    VestingAnalytics,
}

// =============================================================================
// Structs
// =============================================================================

#[contracttype]
#[derive(Clone)]
pub struct VestingSchedule {
    pub beneficiary: Address,
    pub total_amount: i128,
    pub start_ledger: u32,
    pub cliff_ledger: u32,
    pub end_ledger: u32,
    pub claimed: i128,
}

#[contracttype]
#[derive(Clone)]
pub struct BurnStats {
    pub total_burned: i128,
    pub burn_count: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct VestingScheduleV2 {
    pub id: u32,
    pub beneficiary: Address,
    pub total_amount: i128,
    pub start_ledger: u32,
    pub cliff_ledger: u32,
    pub end_ledger: u32,
    pub claimed: i128,
    pub vesting_type: u8, // 0 = linear, 1 = step
    pub step_count: u32,  // for step vesting
}

#[contracttype]
#[derive(Clone)]
pub struct VestingAnalytics {
    pub total_vested: i128,
    pub total_claimed: i128,
    pub active_schedules: u32,
}

// =============================================================================
// Events
// =============================================================================

const TRANSFER: Symbol = symbol_short!("transfer");
const APPROVE: Symbol = symbol_short!("approve");
const MINT: Symbol = symbol_short!("mint");
const BURN: Symbol = symbol_short!("burn");
const MAX_SUPPLY: i128 = 10_000_000_000_000_000; // 1 billion BST with 7 decimals

// =============================================================================
// Contract
// =============================================================================

#[contract]
pub struct TokenContract;

// ── Reentrancy guard ─────────────────────────────────────────────────────────

fn acquire_lock(env: &Env) {
    let locked: bool = env
        .storage()
        .instance()
        .get(&DataKey::Locked)
        .unwrap_or(false);
    assert!(!locked, "reentrant call");
    env.storage().instance().set(&DataKey::Locked, &true);
}

fn release_lock(env: &Env) {
    env.storage().instance().set(&DataKey::Locked, &false);
}

// ── Internal helpers ─────────────────────────────────────────────────────────

fn get_balance(env: &Env, addr: &Address) -> i128 {
    env.storage()
        .instance()
        .get(&DataKey::Balance(addr.clone()))
        .unwrap_or(0)
}

fn set_balance(env: &Env, addr: &Address, amount: i128) {
    env.storage()
        .instance()
        .set(&DataKey::Balance(addr.clone()), &amount);
}

fn get_total_supply(env: &Env) -> i128 {
    env.storage()
        .instance()
        .get(&DataKey::TotalSupply)
        .unwrap_or(0)
}

fn set_total_supply(env: &Env, amount: i128) {
    env.storage().instance().set(&DataKey::TotalSupply, &amount);
}

fn get_allowance(env: &Env, owner: &Address, spender: &Address) -> i128 {
    env.storage()
        .instance()
        .get(&DataKey::Allowance(owner.clone(), spender.clone()))
        .unwrap_or(0)
}

fn set_allowance(env: &Env, owner: &Address, spender: &Address, amount: i128) {
    env.storage()
        .instance()
        .set(&DataKey::Allowance(owner.clone(), spender.clone()), &amount);
}

// ── Contract ─────────────────────────────────────────────────────────────────

#[contractimpl]
impl TokenContract {
    // -------------------------------------------------------------------------
    // SEP-0041: Metadata
    // -------------------------------------------------------------------------

    pub fn name(_env: Env) -> String {
        String::from_str(&_env, "Brain-Storm Token")
    }

    pub fn symbol(_env: Env) -> String {
        String::from_str(&_env, "BST")
    }

    pub fn decimals(_env: Env) -> u32 {
        7
    }

    // -------------------------------------------------------------------------
    // SEP-0041: initialize
    // -------------------------------------------------------------------------

    pub fn initialize(env: Env, admin: Address) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "Already initialized"
        );
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalSupply, &0_i128);
    }

    // -------------------------------------------------------------------------
    // SEP-0041: balance / total_supply
    // -------------------------------------------------------------------------

    pub fn balance(env: Env, addr: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(addr))
            .unwrap_or(0)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    // -------------------------------------------------------------------------
    // SEP-0041: mint (admin only)
    // -------------------------------------------------------------------------

    pub fn mint(env: Env, to: Address, amount: i128) {
        assert!(amount > 0, "Amount must be positive");
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        Self::add_balance(&env, &to, amount);
        Self::add_supply(&env, amount);

        env.events()
            .publish((MINT, symbol_short!("to"), to), amount);
    }

    // -------------------------------------------------------------------------
    // SEP-0041: burn
    // -------------------------------------------------------------------------

    pub fn burn(env: Env, from: Address, amount: i128) {
        assert!(amount > 0, "Amount must be positive");
        from.require_auth();

        let bal = Self::balance(env.clone(), from.clone());
        assert!(bal >= amount, "Insufficient balance");

        Self::sub_balance(&env, &from, amount);
        Self::sub_supply(&env, amount);

        // Update burn stats
        let mut stats: BurnStats = env
            .storage()
            .instance()
            .get(&DataKey::BurnStats)
            .unwrap_or(BurnStats {
                total_burned: 0,
                burn_count: 0,
            });
        stats.total_burned = stats
            .total_burned
            .checked_add(amount)
            .expect("arithmetic overflow");
        stats.burn_count = stats.burn_count.checked_add(1).expect("arithmetic overflow");
        env.storage()
            .instance()
            .set(&DataKey::BurnStats, &stats);

        env.events()
            .publish((BURN, symbol_short!("from"), from), amount);
    }

    pub fn burn_from(env: Env, spender: Address, from: Address, amount: i128) {
        assert!(amount > 0, "Amount must be positive");
        spender.require_auth();

        let allowed = Self::allowance(env.clone(), from.clone(), spender.clone());
        assert!(allowed >= amount, "Insufficient allowance");

        let bal = Self::balance(env.clone(), from.clone());
        assert!(bal >= amount, "Insufficient balance");

        // Deduct allowance
        env.storage().persistent().set(
            &DataKey::Allowance(from.clone(), spender.clone()),
            &(allowed.checked_sub(amount).expect("arithmetic overflow")),
        );

        Self::sub_balance(&env, &from, amount);
        Self::sub_supply(&env, amount);

        // Update burn stats
        let mut stats: BurnStats = env
            .storage()
            .instance()
            .get(&DataKey::BurnStats)
            .unwrap_or(BurnStats {
                total_burned: 0,
                burn_count: 0,
            });
        stats.total_burned = stats
            .total_burned
            .checked_add(amount)
            .expect("arithmetic overflow");
        stats.burn_count = stats.burn_count.checked_add(1).expect("arithmetic overflow");
        env.storage()
            .instance()
            .set(&DataKey::BurnStats, &stats);

        env.events()
            .publish((BURN, symbol_short!("from"), from), amount);
    }

    // -------------------------------------------------------------------------
    // SEP-0041: transfer
    // -------------------------------------------------------------------------

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        assert!(amount > 0, "Amount must be positive");
        from.require_auth();

        let bal = Self::balance(env.clone(), from.clone());
        assert!(bal >= amount, "Insufficient balance");

        Self::sub_balance(&env, &from, amount);
        Self::add_balance(&env, &to, amount);

        env.events().publish(
            (TRANSFER, symbol_short!("from"), from.clone()),
            (to, amount),
        );
    }

    // -------------------------------------------------------------------------
    // SEP-0041: approve / allowance / transfer_from
    // -------------------------------------------------------------------------

    pub fn approve(env: Env, owner: Address, spender: Address, amount: i128) {
        assert!(amount >= 0, "Allowance must be non-negative");
        owner.require_auth();

        env.storage()
            .persistent()
            .set(&DataKey::Allowance(owner.clone(), spender.clone()), &amount);

        env.events()
            .publish((APPROVE, symbol_short!("owner"), owner), (spender, amount));
    }

    pub fn allowance(env: Env, owner: Address, spender: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Allowance(owner, spender))
            .unwrap_or(0)
    }

    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        assert!(amount > 0, "Amount must be positive");
        spender.require_auth();

        let allowed = Self::allowance(env.clone(), from.clone(), spender.clone());
        assert!(allowed >= amount, "Allowance exceeded");

        let bal = Self::balance(env.clone(), from.clone());
        assert!(bal >= amount, "Insufficient balance");

        // Deduct allowance
        env.storage().persistent().set(
            &DataKey::Allowance(from.clone(), spender.clone()),
            &(allowed.checked_sub(amount).expect("arithmetic overflow")),
        );

        Self::sub_balance(&env, &from, amount);
        Self::add_balance(&env, &to, amount);

        env.events()
            .publish((TRANSFER, symbol_short!("from"), from), (to, amount));
    }

    // -------------------------------------------------------------------------
    // Vesting (instructor rewards)
    // -------------------------------------------------------------------------

    /// Create a linear vesting schedule for an instructor (admin only).
    pub fn create_vesting(
        env: Env,
        admin: Address,
        beneficiary: Address,
        total_amount: i128,
        cliff_ledger: u32,
        end_ledger: u32,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can create vesting");
        assert!(total_amount > 0, "Amount must be positive");

        let start_ledger = env.ledger().sequence();
        assert!(cliff_ledger >= start_ledger, "Cliff must be >= start");
        assert!(end_ledger > cliff_ledger, "End must be after cliff");

        env.storage().persistent().set(
            &DataKey::Vesting(beneficiary.clone()),
            &VestingSchedule {
                beneficiary,
                total_amount,
                start_ledger,
                cliff_ledger,
                end_ledger,
                claimed: 0,
            },
        );
    }

    /// Claim vested tokens — mints the claimable amount to the beneficiary.
    pub fn claim_vesting(env: Env, beneficiary: Address) {
        beneficiary.require_auth();

        let key = DataKey::Vesting(beneficiary.clone());
        let mut schedule: VestingSchedule = env
            .storage()
            .persistent()
            .get(&key)
            .expect("No vesting schedule found");

        let claimable = Self::vested_amount(&schedule, env.ledger().sequence())
            .checked_sub(schedule.claimed)
            .expect("arithmetic overflow");
        assert!(claimable > 0, "Nothing to claim yet");

        schedule.claimed = schedule
            .claimed
            .checked_add(claimable)
            .expect("arithmetic overflow");
        env.storage().persistent().set(&key, &schedule);

        Self::add_balance(&env, &beneficiary, claimable);
        Self::add_supply(&env, claimable);

        env.events()
            .publish((MINT, symbol_short!("to"), beneficiary), claimable);
    }

    pub fn get_vesting(env: Env, beneficiary: Address) -> Option<VestingSchedule> {
        env.storage()
            .persistent()
            .get(&DataKey::Vesting(beneficiary))
    }

    pub fn get_burn_stats(env: Env) -> BurnStats {
        env.storage()
            .instance()
            .get(&DataKey::BurnStats)
            .unwrap_or(BurnStats {
                total_burned: 0,
                burn_count: 0,
            })
    }

    // -------------------------------------------------------------------------
    // Vesting V2 (multiple schedules, linear & step)
    // -------------------------------------------------------------------------

    pub fn create_vesting_v2(
        env: Env,
        admin: Address,
        beneficiary: Address,
        total_amount: i128,
        cliff_ledger: u32,
        end_ledger: u32,
        vesting_type: u8, // 0 = linear, 1 = step
        step_count: u32,
    ) -> u32 {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can create vesting");
        assert!(total_amount > 0, "Amount must be positive");
        assert!(vesting_type <= 1, "Invalid vesting type");

        let start_ledger = env.ledger().sequence();
        assert!(cliff_ledger >= start_ledger, "Cliff must be >= start");
        assert!(end_ledger > cliff_ledger, "End must be after cliff");

        let count_key = DataKey::VestingScheduleCount(beneficiary.clone());
        let schedule_id: u32 = env
            .storage()
            .persistent()
            .get(&count_key)
            .unwrap_or(0);

        let schedule = VestingScheduleV2 {
            id: schedule_id,
            beneficiary: beneficiary.clone(),
            total_amount,
            start_ledger,
            cliff_ledger,
            end_ledger,
            claimed: 0,
            vesting_type,
            step_count,
        };

        env.storage().persistent().set(
            &DataKey::VestingV2(beneficiary.clone(), schedule_id),
            &schedule,
        );
        env.storage()
            .persistent()
            .set(&count_key, &(schedule_id + 1));

        schedule_id
    }

    pub fn claim_vesting_v2(env: Env, beneficiary: Address, schedule_id: u32) {
        beneficiary.require_auth();

        let key = DataKey::VestingV2(beneficiary.clone(), schedule_id);
        let mut schedule: VestingScheduleV2 = env
            .storage()
            .persistent()
            .get(&key)
            .expect("No vesting schedule found");

        let claimable = Self::vested_amount_v2(&schedule, env.ledger().sequence())
            .checked_sub(schedule.claimed)
            .expect("arithmetic overflow");
        assert!(claimable > 0, "Nothing to claim yet");

        schedule.claimed = schedule
            .claimed
            .checked_add(claimable)
            .expect("arithmetic overflow");
        env.storage().persistent().set(&key, &schedule);

        Self::add_balance(&env, &beneficiary, claimable);
        Self::add_supply(&env, claimable);

        env.events()
            .publish((MINT, symbol_short!("to"), beneficiary), claimable);
    }

    pub fn get_vesting_v2(env: Env, beneficiary: Address, schedule_id: u32) -> Option<VestingScheduleV2> {
        env.storage()
            .persistent()
            .get(&DataKey::VestingV2(beneficiary, schedule_id))
    }

    pub fn get_vesting_analytics(env: Env) -> VestingAnalytics {
        env.storage()
            .instance()
            .get(&DataKey::VestingAnalytics)
            .unwrap_or(VestingAnalytics {
                total_vested: 0,
                total_claimed: 0,
                active_schedules: 0,
            })
    }

    // -------------------------------------------------------------------------
    // Vesting Schedule Modification (governance)
    // -------------------------------------------------------------------------

    pub fn modify_vesting_v2(
        env: Env,
        admin: Address,
        beneficiary: Address,
        schedule_id: u32,
        new_end_ledger: u32,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can modify vesting");

        let key = DataKey::VestingV2(beneficiary.clone(), schedule_id);
        let mut schedule: VestingScheduleV2 = env
            .storage()
            .persistent()
            .get(&key)
            .expect("No vesting schedule found");

        assert!(
            new_end_ledger > schedule.cliff_ledger,
            "New end must be after cliff"
        );

        schedule.end_ledger = new_end_ledger;
        env.storage().persistent().set(&key, &schedule);
    }

    pub fn get_vesting_schedule_count(env: Env, beneficiary: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::VestingScheduleCount(beneficiary))
            .unwrap_or(0)
    }

    // -------------------------------------------------------------------------
    // Airdrop
    // -------------------------------------------------------------------------

    pub fn create_airdrop(
        env: Env,
        admin: Address,
        total_amount: i128,
        expiry_ledger: u32,
        merkle_root: [u8; 32],
    ) -> u32 {
        airdrop::create_airdrop(&env, &admin, total_amount, expiry_ledger, merkle_root)
    }

    pub fn claim_airdrop(
        env: Env,
        campaign_id: u32,
        recipient: Address,
        amount: i128,
        proof: soroban_sdk::Vec<[u8; 32]>,
    ) -> bool {
        let claimed = airdrop::claim_airdrop(&env, campaign_id, &recipient, amount, proof);
        if claimed {
            Self::add_balance(&env, &recipient, amount);
            Self::add_supply(&env, amount);
        }
        claimed
    }

    pub fn recover_unclaimed_airdrop(env: Env, admin: Address, campaign_id: u32) -> i128 {
        airdrop::recover_unclaimed(&env, &admin, campaign_id)
    }

    pub fn get_airdrop_campaign(env: Env, campaign_id: u32) -> Option<airdrop::AirdropCampaign> {
        airdrop::get_airdrop_campaign(&env, campaign_id)
    }

    pub fn has_claimed_airdrop(env: Env, campaign_id: u32, recipient: Address) -> bool {
        airdrop::has_claimed(&env, campaign_id, &recipient)
    }

    // -------------------------------------------------------------------------
    // Legacy mint_reward (kept for backward compat)
    // -------------------------------------------------------------------------

    pub fn mint_reward(env: Env, caller: Address, recipient: Address, amount: i128) {
        acquire_lock(&env);

        caller.require_auth();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(caller == admin, "Only admin can mint");
        assert!(amount > 0, "Amount must be positive");

        Self::add_balance(&env, &recipient, amount);
        Self::add_supply(&env, amount);

        env.events()
            .publish((MINT, symbol_short!("to"), recipient), amount);
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    fn add_balance(env: &Env, addr: &Address, amount: i128) {
        let current = Self::balance(env.clone(), addr.clone());
        let new_balance = current.checked_add(amount).expect("arithmetic overflow");
        env.storage()
            .persistent()
            .set(&DataKey::Balance(addr.clone()), &new_balance);
    }

    fn sub_balance(env: &Env, addr: &Address, amount: i128) {
        let current = Self::balance(env.clone(), addr.clone());
        let new_balance = current.checked_sub(amount).expect("arithmetic overflow");
        env.storage()
            .persistent()
            .set(&DataKey::Balance(addr.clone()), &new_balance);
    }

    fn add_supply(env: &Env, amount: i128) {
        let current = Self::total_supply(env.clone());
        let new_supply = current.checked_add(amount).expect("arithmetic overflow");
        assert!(new_supply <= MAX_SUPPLY, "Max supply exceeded");
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &new_supply);
    }

    fn sub_supply(env: &Env, amount: i128) {
        let current = Self::total_supply(env.clone());
        let new_supply = current.checked_sub(amount).expect("arithmetic overflow");
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &new_supply);
    }

    fn vested_amount(schedule: &VestingSchedule, current_ledger: u32) -> i128 {
        if current_ledger < schedule.cliff_ledger {
            return 0;
        }
        if current_ledger >= schedule.end_ledger {
            return schedule.total_amount;
        }
        let elapsed = (current_ledger
            .checked_sub(schedule.start_ledger)
            .expect("arithmetic overflow")) as i128;
        let duration = (schedule
            .end_ledger
            .checked_sub(schedule.start_ledger)
            .expect("arithmetic overflow")) as i128;

        schedule
            .total_amount
            .checked_mul(elapsed)
            .expect("arithmetic overflow")
            .checked_div(duration)
            .expect("arithmetic overflow")
    }

    fn vested_amount_v2(schedule: &VestingScheduleV2, current_ledger: u32) -> i128 {
        if current_ledger < schedule.cliff_ledger {
            return 0;
        }
        if current_ledger >= schedule.end_ledger {
            return schedule.total_amount;
        }

        match schedule.vesting_type {
            0 => {
                // Linear vesting
                let elapsed = (current_ledger
                    .checked_sub(schedule.start_ledger)
                    .expect("arithmetic overflow")) as i128;
                let duration = (schedule
                    .end_ledger
                    .checked_sub(schedule.start_ledger)
                    .expect("arithmetic overflow")) as i128;

                schedule
                    .total_amount
                    .checked_mul(elapsed)
                    .expect("arithmetic overflow")
                    .checked_div(duration)
                    .expect("arithmetic overflow")
            }
            1 => {
                // Step vesting
                if schedule.step_count == 0 {
                    return schedule.total_amount;
                }
                let elapsed = (current_ledger
                    .checked_sub(schedule.start_ledger)
                    .expect("arithmetic overflow")) as u32;
                let duration = schedule
                    .end_ledger
                    .checked_sub(schedule.start_ledger)
                    .expect("arithmetic overflow");
                let step_duration = duration.checked_div(schedule.step_count).unwrap_or(1);
                let steps_completed = elapsed.checked_div(step_duration).unwrap_or(0);
                let steps_completed = steps_completed.min(schedule.step_count);

                schedule
                    .total_amount
                    .checked_mul(steps_completed as i128)
                    .expect("arithmetic overflow")
                    .checked_div(schedule.step_count as i128)
                    .expect("arithmetic overflow")
            }
            _ => 0,
        }
    }
}

// =============================================================================
// Tests
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Events, Ledger, LedgerInfo};
    use soroban_sdk::Env;

    fn setup() -> (Env, TokenContractClient<'static>, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let id = env.register_contract(None, TokenContract);
        let client = TokenContractClient::new(&env, &id);
        let admin = Address::generate(&env);
        client.initialize(&admin);
        (env, client, admin)
    }

    fn set_ledger(env: &Env, sequence: u32) {
        env.ledger().set(LedgerInfo {
            sequence_number: sequence,
            timestamp: sequence as u64 * 5,
            protocol_version: 21,
            network_id: Default::default(),
            base_reserve: 10,
            min_temp_entry_ttl: 1000,
            min_persistent_entry_ttl: 1000,
            max_entry_ttl: 100_000,
        });
    }

    // ---- Metadata -----------------------------------------------------------

    #[test]
    fn test_metadata() {
        let (env, client, _) = setup();
        assert_eq!(client.name(), String::from_str(&env, "Brain-Storm Token"));
        assert_eq!(client.symbol(), String::from_str(&env, "BST"));
        assert_eq!(client.decimals(), 7);
    }

    // ---- Mint ---------------------------------------------------------------

    #[test]
    fn test_mint_increases_balance_and_supply() {
        let (_, client, _) = setup();
        let user = Address::generate(&client.env);
        client.mint(&user, &1_000_0000000_i128);
        assert_eq!(client.balance(&user), 1_000_0000000);
        assert_eq!(client.total_supply(), 1_000_0000000);
    }

    #[test]
    #[should_panic(expected = "Amount must be positive")]
    fn test_mint_zero_panics() {
        let (_, client, _) = setup();
        let user = Address::generate(&client.env);
        client.mint(&user, &0);
    }

    #[test]
    fn test_mint_emits_event() {
        let (env, client, _) = setup();
        let user = Address::generate(&env);
        client.mint(&user, &500);
        let events = env.events().all();
        assert!(!events.is_empty());
    }

    // ---- Burn ---------------------------------------------------------------

    #[test]
    fn test_burn_reduces_balance_and_supply() {
        let (_, client, _) = setup();
        let user = Address::generate(&client.env);
        client.mint(&user, &1000);
        client.burn(&user, &400);
        assert_eq!(client.balance(&user), 600);
        assert_eq!(client.total_supply(), 600);
    }

    #[test]
    #[should_panic(expected = "Insufficient balance")]
    fn test_burn_overdraft_panics() {
        let (_, client, _) = setup();
        let user = Address::generate(&client.env);
        client.mint(&user, &100);
        client.burn(&user, &200);
    }

    // ---- Transfer -----------------------------------------------------------

    #[test]
    fn test_transfer() {
        let (_, client, _) = setup();
        let alice = Address::generate(&client.env);
        let bob = Address::generate(&client.env);
        client.mint(&alice, &1000);
        client.transfer(&alice, &bob, &300);
        assert_eq!(client.balance(&alice), 700);
        assert_eq!(client.balance(&bob), 300);
        assert_eq!(client.total_supply(), 1000); // unchanged
    }

    #[test]
    #[should_panic(expected = "Insufficient balance")]
    fn test_transfer_overdraft_panics() {
        let (_, client, _) = setup();
        let alice = Address::generate(&client.env);
        let bob = Address::generate(&client.env);
        client.mint(&alice, &100);
        client.transfer(&alice, &bob, &200);
    }

    // ---- Approve / Allowance / transfer_from --------------------------------

    #[test]
    fn test_approve_and_allowance() {
        let (_, client, _) = setup();
        let alice = Address::generate(&client.env);
        let spender = Address::generate(&client.env);
        client.mint(&alice, &1000);
        client.approve(&alice, &spender, &500);
        assert_eq!(client.allowance(&alice, &spender), 500);
    }

    #[test]
    fn test_transfer_from_deducts_allowance() {
        let (_, client, _) = setup();
        let alice = Address::generate(&client.env);
        let bob = Address::generate(&client.env);
        let spender = Address::generate(&client.env);
        client.mint(&alice, &1000);
        client.approve(&alice, &spender, &600);
        client.transfer_from(&spender, &alice, &bob, &400);
        assert_eq!(client.balance(&alice), 600);
        assert_eq!(client.balance(&bob), 400);
        assert_eq!(client.allowance(&alice, &spender), 200);
    }

    #[test]
    #[should_panic(expected = "Allowance exceeded")]
    fn test_transfer_from_exceeds_allowance_panics() {
        let (_, client, _) = setup();
        let alice = Address::generate(&client.env);
        let bob = Address::generate(&client.env);
        let spender = Address::generate(&client.env);
        client.mint(&alice, &1000);
        client.approve(&alice, &spender, &100);
        client.transfer_from(&spender, &alice, &bob, &200);
    }

    #[test]
    fn test_approve_emits_event() {
        let (env, client, _) = setup();
        let alice = Address::generate(&env);
        let spender = Address::generate(&env);
        client.mint(&alice, &1000);
        client.approve(&alice, &spender, &500);
        let events = env.events().all();
        assert!(!events.is_empty());
    }

    // ---- Vesting (cliff / partial / full) -----------------------------------

    #[test]
    #[should_panic(expected = "Nothing to claim yet")]
    fn test_cliff_not_reached() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        client.create_vesting(&admin, &instructor, &1000, &20, &30);
        set_ledger(&env, 15);
        client.claim_vesting(&instructor);
    }

    #[test]
    fn test_partial_vest() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        client.create_vesting(&admin, &instructor, &1000, &10, &30);
        set_ledger(&env, 20);
        client.claim_vesting(&instructor);
        assert_eq!(client.balance(&instructor), 500);
        assert_eq!(client.get_vesting(&instructor).unwrap().claimed, 500);
    }

    #[test]
    fn test_full_vest() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        client.create_vesting(&admin, &instructor, &1000, &10, &30);
        set_ledger(&env, 30);
        client.claim_vesting(&instructor);
        assert_eq!(client.balance(&instructor), 1000);
        assert_eq!(client.total_supply(), 1000);
    }

    #[test]
    fn test_incremental_claims() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 0);
        client.create_vesting(&admin, &instructor, &1000, &0, &100);
        set_ledger(&env, 50);
        client.claim_vesting(&instructor);
        assert_eq!(client.balance(&instructor), 500);
        set_ledger(&env, 100);
        client.claim_vesting(&instructor);
        assert_eq!(client.balance(&instructor), 1000);
    }

    #[test]
    #[should_panic(expected = "Only admin can create vesting")]
    fn test_only_admin_can_create_vesting() {
        let (env, client, _) = setup();
        let instructor = Address::generate(&env);
        let rando = Address::generate(&env);
        set_ledger(&env, 10);
        client.create_vesting(&rando, &instructor, &1000, &20, &30);
    }

    #[test]
    #[should_panic(expected = "Max supply exceeded")]
    fn test_mint_exceeds_max_supply_panics() {
        let (_, client, _) = setup();
        let user = Address::generate(&client.env);
        client.mint(&user, &MAX_SUPPLY);
        client.mint(&user, &1);
    }

    #[test]
    #[should_panic(expected = "arithmetic overflow")]
    fn test_overflow_protection() {
        let (env, client, admin) = setup();
        let user = Address::generate(&env);
        // Test that checked_sub in sub_balance panics with "arithmetic overflow"
        // when trying to subtract more than balance
        // We need to bypass the balance check by directly calling sub_balance
        // Since we can't call private functions directly, we'll test a different scenario
        // where overflow would occur in vesting calculations
        set_ledger(&env, 10);
        // Create a vesting with very large numbers that could overflow in calculation
        client.create_vesting(&admin, &user, &i128::MAX, &10, &20);
        set_ledger(&env, 15);
        // This should trigger overflow in vested_amount calculation
        client.claim_vesting(&user);
    }

    // ---- Double-init guard --------------------------------------------------

    #[test]
    #[should_panic(expected = "Already initialized")]
    fn test_double_initialize_panics() {
        let (_, client, admin) = setup();
        client.initialize(&admin);
    }

    // ---- Overflow Protection Tests -------------------------------------------

    #[test]
    fn test_mint_exactly_max_supply() {
        let (_, client, _) = setup();
        let user = Address::generate(&client.env);
        client.mint(&user, &MAX_SUPPLY);
        assert_eq!(client.balance(&user), MAX_SUPPLY);
        assert_eq!(client.total_supply(), MAX_SUPPLY);
    }

    #[test]
    #[should_panic(expected = "Max supply exceeded")]
    fn test_mint_one_above_max_supply_panics() {
        let (_, client, _) = setup();
        let user = Address::generate(&client.env);
        client.mint(&user, &MAX_SUPPLY);
        client.mint(&user, &1);
    }

    #[test]
    #[should_panic(expected = "Max supply exceeded")]
    fn test_mint_large_amount_exceeds_max_supply_panics() {
        let (_, client, _) = setup();
        let user = Address::generate(&client.env);
        let large_amount = MAX_SUPPLY.checked_div(2).unwrap().checked_add(1).unwrap();
        client.mint(&user, &large_amount);
        client.mint(&user, &large_amount);
    }

    #[test]
    fn test_transfer_does_not_overflow() {
        let (_, client, _) = setup();
        let alice = Address::generate(&client.env);
        let bob = Address::generate(&client.env);
        client.mint(&alice, &1000);
        client.mint(&bob, &1000);
        client.transfer(&alice, &bob, &500);
        assert_eq!(client.balance(&alice), 500);
        assert_eq!(client.balance(&bob), 1500);
    }

    #[test]
    #[should_panic(expected = "Insufficient balance")]
    fn test_transfer_more_than_balance_panics() {
        let (_, client, _) = setup();
        let alice = Address::generate(&client.env);
        let bob = Address::generate(&client.env);
        client.mint(&alice, &100);
        client.transfer(&alice, &bob, &200);
    }

    #[test]
    fn test_burn_from_with_allowance() {
        let (_, client, _) = setup();
        let owner = Address::generate(&client.env);
        let spender = Address::generate(&client.env);
        client.mint(&owner, &200);
        client.approve(&owner, &spender, &150);
        client.burn_from(&spender, &owner, &100);
        assert_eq!(client.balance(&owner), 100);
        assert_eq!(client.allowance(&owner, &spender), 50);
        assert_eq!(client.total_supply(), 100);
    }

    #[test]
    #[should_panic(expected = "Insufficient allowance")]
    fn test_burn_from_exceeds_allowance_panics() {
        let (_, client, _) = setup();
        let owner = Address::generate(&client.env);
        let spender = Address::generate(&client.env);
        client.mint(&owner, &200);
        client.approve(&owner, &spender, &50);
        client.burn_from(&spender, &owner, &100);
    }

    #[test]
    #[should_panic(expected = "Insufficient balance")]
    fn test_burn_from_exceeds_balance_panics() {
        let (_, client, _) = setup();
        let owner = Address::generate(&client.env);
        let spender = Address::generate(&client.env);
        client.mint(&owner, &50);
        client.approve(&owner, &spender, &100);
        client.burn_from(&spender, &owner, &100);
    }

    #[test]
    fn test_burn_stats_tracking() {
        let (_, client, _) = setup();
        let user = Address::generate(&client.env);
        client.mint(&user, &1000);
        client.burn(&user, &300);
        client.burn(&user, &200);
        let stats = client.get_burn_stats();
        assert_eq!(stats.total_burned, 500);
        assert_eq!(stats.burn_count, 2);
    }

    #[test]
    fn test_burn_stats_with_burn_from() {
        let (_, client, _) = setup();
        let owner = Address::generate(&client.env);
        let spender = Address::generate(&client.env);
        client.mint(&owner, &500);
        client.approve(&owner, &spender, &500);
        client.burn(&owner, &100);
        client.burn_from(&spender, &owner, &150);
        let stats = client.get_burn_stats();
        assert_eq!(stats.total_burned, 250);
        assert_eq!(stats.burn_count, 2);
    }

    // ---- Vesting V2 (multiple schedules, linear & step) ---

    #[test]
    fn test_create_vesting_v2_linear() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        let schedule_id = client.create_vesting_v2(&admin, &instructor, &1000, &10, &30, &0, &0);
        assert_eq!(schedule_id, 0);
        let schedule = client.get_vesting_v2(&instructor, &schedule_id).unwrap();
        assert_eq!(schedule.vesting_type, 0);
    }

    #[test]
    fn test_create_vesting_v2_step() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        let schedule_id = client.create_vesting_v2(&admin, &instructor, &1000, &10, &30, &1, &4);
        assert_eq!(schedule_id, 0);
        let schedule = client.get_vesting_v2(&instructor, &schedule_id).unwrap();
        assert_eq!(schedule.vesting_type, 1);
        assert_eq!(schedule.step_count, 4);
    }

    #[test]
    fn test_multiple_vesting_schedules() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        let id1 = client.create_vesting_v2(&admin, &instructor, &500, &10, &30, &0, &0);
        let id2 = client.create_vesting_v2(&admin, &instructor, &500, &10, &30, &0, &0);
        assert_eq!(id1, 0);
        assert_eq!(id2, 1);
    }

    #[test]
    fn test_claim_vesting_v2_linear() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        let schedule_id = client.create_vesting_v2(&admin, &instructor, &1000, &10, &30, &0, &0);
        set_ledger(&env, 20);
        client.claim_vesting_v2(&instructor, &schedule_id);
        assert_eq!(client.balance(&instructor), 500);
    }

    #[test]
    fn test_claim_vesting_v2_step() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        let schedule_id = client.create_vesting_v2(&admin, &instructor, &1000, &10, &30, &1, &4);
        set_ledger(&env, 15);
        client.claim_vesting_v2(&instructor, &schedule_id);
        // After 5 ledgers out of 20, should be 1 step out of 4
        assert_eq!(client.balance(&instructor), 250);
    }

    #[test]
    #[should_panic(expected = "Invalid vesting type")]
    fn test_invalid_vesting_type_panics() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        client.create_vesting_v2(&admin, &instructor, &1000, &10, &30, &2, &0);
    }

    #[test]
    fn test_transfer_from_does_not_overflow() {
        let (_, client, _) = setup();
        let alice = Address::generate(&client.env);
        let bob = Address::generate(&client.env);
        let spender = Address::generate(&client.env);
        client.mint(&alice, &1000);
        client.approve(&alice, &spender, &500);
        client.transfer_from(&spender, &alice, &bob, &300);
        assert_eq!(client.balance(&alice), 700);
        assert_eq!(client.balance(&bob), 300);
        assert_eq!(client.allowance(&alice, &spender), 200);
    }

    #[test]
    #[should_panic(expected = "Insufficient balance")]
    fn test_transfer_from_exceeds_balance_panics() {
        let (_, client, _) = setup();
        let alice = Address::generate(&client.env);
        let bob = Address::generate(&client.env);
        let spender = Address::generate(&client.env);
        client.mint(&alice, &100);
        client.approve(&alice, &spender, &200);
        client.transfer_from(&spender, &alice, &bob, &200);
    }

    // ---- Vesting Modification Tests ------------------------------------------

    #[test]
    fn test_modify_vesting_v2_extend_end_ledger() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        let schedule_id = client.create_vesting_v2(&admin, &instructor, &1000, &10, &30, &0, &0);
        
        // Modify to extend end ledger
        client.modify_vesting_v2(&admin, &instructor, &schedule_id, &50);
        
        let schedule = client.get_vesting_v2(&instructor, &schedule_id).unwrap();
        assert_eq!(schedule.end_ledger, 50);
    }

    #[test]
    #[should_panic(expected = "Only admin can modify vesting")]
    fn test_non_admin_cannot_modify_vesting() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        let rando = Address::generate(&env);
        set_ledger(&env, 10);
        let schedule_id = client.create_vesting_v2(&admin, &instructor, &1000, &10, &30, &0, &0);
        
        client.modify_vesting_v2(&rando, &instructor, &schedule_id, &50);
    }

    #[test]
    #[should_panic(expected = "New end must be after cliff")]
    fn test_modify_vesting_invalid_end_ledger_panics() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        let schedule_id = client.create_vesting_v2(&admin, &instructor, &1000, &10, &30, &0, &0);
        
        client.modify_vesting_v2(&admin, &instructor, &schedule_id, &5);
    }

    #[test]
    fn test_get_vesting_schedule_count() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        
        assert_eq!(client.get_vesting_schedule_count(&instructor), 0);
        
        client.create_vesting_v2(&admin, &instructor, &500, &10, &30, &0, &0);
        assert_eq!(client.get_vesting_schedule_count(&instructor), 1);
        
        client.create_vesting_v2(&admin, &instructor, &500, &10, &30, &0, &0);
        assert_eq!(client.get_vesting_schedule_count(&instructor), 2);
    }

    // ---- Vesting Overflow Tests ----------------------------------------------

    #[test]
    fn test_vesting_claim_does_not_overflow() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        client.create_vesting(&admin, &instructor, &1000, &10, &30);
        set_ledger(&env, 20);
        client.claim_vesting(&instructor);
        assert_eq!(client.balance(&instructor), 500);
        assert_eq!(client.total_supply(), 500);
    }

    #[test]
    fn test_vesting_full_claim_does_not_overflow() {
        let (env, client, admin) = setup();
        let instructor = Address::generate(&env);
        set_ledger(&env, 10);
        client.create_vesting(&admin, &instructor, &1000, &10, &30);
        set_ledger(&env, 30);
        client.claim_vesting(&instructor);
        assert_eq!(client.balance(&instructor), 1000);
        assert_eq!(client.total_supply(), 1000);
    }

    #[test]
    fn test_multiple_vesting_claims_within_max_supply() {
        let (env, client, admin) = setup();
        let instructor1 = Address::generate(&env);
        let instructor2 = Address::generate(&env);
        set_ledger(&env, 10);

        // Create two vesting schedules that together stay within MAX_SUPPLY
        let half_supply = MAX_SUPPLY.checked_div(2).unwrap();
        client.create_vesting(&admin, &instructor1, &half_supply, &10, &30);
        client.create_vesting(&admin, &instructor2, &half_supply, &10, &30);

        set_ledger(&env, 30);
        client.claim_vesting(&instructor1);
        client.claim_vesting(&instructor2);

        assert_eq!(client.balance(&instructor1), half_supply);
        assert_eq!(client.balance(&instructor2), half_supply);
        assert_eq!(client.total_supply(), MAX_SUPPLY);
    }

    #[test]
    #[should_panic(expected = "Max supply exceeded")]
    fn test_multiple_vesting_claims_exceed_max_supply_panics() {
        let (env, client, admin) = setup();
        let instructor1 = Address::generate(&env);
        let instructor2 = Address::generate(&env);
        set_ledger(&env, 10);

        // Create two vesting schedules that together exceed MAX_SUPPLY
        let half_supply = MAX_SUPPLY.checked_div(2).unwrap();
        let excess = half_supply.checked_add(1).unwrap();
        client.create_vesting(&admin, &instructor1, &half_supply, &10, &30);
        client.create_vesting(&admin, &instructor2, &excess, &10, &30);

        set_ledger(&env, 30);
        client.claim_vesting(&instructor1);
        client.claim_vesting(&instructor2);
    }
}
