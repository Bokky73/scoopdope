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
    TokenA,                               // BST token contract
    TokenB,                               // XLM (native asset)
    ReserveA,                             // BST reserve
    ReserveB,                             // XLM reserve
    TotalLiquidity,                       // Total LP tokens minted
    Liquidity(Address),                   // user → liquidity balance
    FeeCollector,                         // Address to collect fees
    PoolConfig,                          // PoolConfig
    SwapHistory(u32),                    // index → SwapRecord
    SwapHistoryCount,                    // u32
    MiningRewards(Address),              // user → accumulated rewards
    MiningConfig,                        // MiningConfig
}

// =============================================================================
// Types
// =============================================================================

#[contracttype]
#[derive(Clone)]
pub struct PoolConfig {
    pub fee_numerator: u32,               // Fee as fraction (e.g., 3 for 0.3%)
    pub fee_denominator: u32,             // Fee denominator (e.g., 1000)
    pub swap_enabled: bool,
    pub add_liquidity_enabled: bool,
    pub remove_liquidity_enabled: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct SwapRecord {
    pub timestamp: u64,
    pub user: Address,
    pub token_in: Symbol,                 // 'bst' or 'xlm'
    pub amount_in: i128,
    pub token_out: Symbol,
    pub amount_out: i128,
    pub fee: i128,
}

#[contracttype]
#[derive(Clone)]
pub struct MiningConfig {
    pub enabled: bool,
    pub reward_rate: i128,                // BST tokens per ledger per liquidity unit
    pub reward_token: Address,            // BST token contract
}

#[contracttype]
#[derive(Clone)]
pub struct PoolStats {
    pub reserve_a: i128,
    pub reserve_b: i128,
    pub total_liquidity: i128,
    pub volume_24h: i128,
    pub fees_24h: i128,
    pub price_bst_xlm: i128,             // BST price in XLM (scaled)
}

// =============================================================================
// Events
// =============================================================================

const ADD_LIQUIDITY: Symbol = symbol_short!("add_liq");
const REMOVE_LIQUIDITY: Symbol = symbol_short!("rem_liq");
const SWAP: Symbol = symbol_short!("swap");
const REWARDS_CLAIMED: Symbol = symbol_short!("claim_rew");

// =============================================================================
// Constants
// =============================================================================

const MINIMUM_LIQUIDITY: i128 = 1000;

// =============================================================================
// Contract
// =============================================================================

#[contract]
pub struct LiquidityPoolContract;

#[contractimpl]
impl LiquidityPoolContract {
    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    pub fn initialize(
        env: Env,
        admin: Address,
        bst_token: Address,
        fee_collector: Address,
    ) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "Already initialized"
        );
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenA, &bst_token);
        env.storage().instance().set(&DataKey::FeeCollector, &fee_collector);

        // Initialize reserves
        env.storage().instance().set(&DataKey::ReserveA, &0_i128);
        env.storage().instance().set(&DataKey::ReserveB, &0_i128);
        env.storage().instance().set(&DataKey::TotalLiquidity, &0_i128);

        // Initialize pool config
        let config = PoolConfig {
            fee_numerator: 3,     // 0.3% fee
            fee_denominator: 1000,
            swap_enabled: true,
            add_liquidity_enabled: true,
            remove_liquidity_enabled: true,
        };
        env.storage().instance().set(&DataKey::PoolConfig, &config);

        // Initialize mining config
        let mining_config = MiningConfig {
            enabled: true,
            reward_rate: 100,     // 100 BST per ledger per liquidity unit (scaled)
            reward_token: bst_token,
        };
        env.storage().instance().set(&DataKey::MiningConfig, &mining_config);

        // Initialize history
        env.storage().instance().set(&DataKey::SwapHistoryCount, &0_u32);
    }

    // -------------------------------------------------------------------------
    // Liquidity Management
    // -------------------------------------------------------------------------

    pub fn add_liquidity(
        env: Env,
        provider: Address,
        amount_a_desired: i128,
        amount_b_desired: i128,
        amount_a_min: i128,
        amount_b_min: i128,
    ) -> i128 {
        provider.require_auth();

        let config: PoolConfig = env.storage().instance().get(&DataKey::PoolConfig).unwrap();
        assert!(config.add_liquidity_enabled, "Adding liquidity is disabled");

        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let total_liquidity: i128 = env.storage().instance().get(&DataKey::TotalLiquidity).unwrap_or(0);

        let (amount_a, amount_b) = if total_liquidity == 0 {
            // First liquidity provision
            (amount_a_desired, amount_b_desired)
        } else {
            // Subsequent liquidity provision - maintain ratio
            let amount_b_optimal = Self::quote(amount_a_desired, reserve_a, reserve_b);
            if amount_b_optimal <= amount_b_desired {
                assert!(amount_b_optimal >= amount_b_min, "Insufficient B amount");
                (amount_a_desired, amount_b_optimal)
            } else {
                let amount_a_optimal = Self::quote(amount_b_desired, reserve_b, reserve_a);
                assert!(amount_a_optimal <= amount_a_desired, "Insufficient A amount");
                assert!(amount_a_optimal >= amount_a_min, "Insufficient A amount");
                (amount_a_optimal, amount_b_desired)
            }
        };

        assert!(amount_a >= amount_a_min, "Insufficient A amount");
        assert!(amount_b >= amount_b_min, "Insufficient B amount");

        // Transfer tokens to pool (this would require implementing token transfer logic)

        // Mint liquidity tokens
        let liquidity_minted = if total_liquidity == 0 {
            // First liquidity provision
            let initial_liquidity = Self::sqrt(amount_a * amount_b).checked_sub(MINIMUM_LIQUIDITY).unwrap_or(0);
            // Mint MINIMUM_LIQUIDITY to the pool itself to avoid division by zero
            env.storage().instance().set(&DataKey::Liquidity(env.current_contract_address()), &MINIMUM_LIQUIDITY);
            initial_liquidity
        } else {
            let liquidity_minted_a = (amount_a * total_liquidity) / reserve_a;
            let liquidity_minted_b = (amount_b * total_liquidity) / reserve_b;
            liquidity_minted_a.min(liquidity_minted_b)
        };

        assert!(liquidity_minted > 0, "Insufficient liquidity minted");

        // Update reserves
        env.storage().instance().set(&DataKey::ReserveA, &(reserve_a + amount_a));
        env.storage().instance().set(&DataKey::ReserveB, &(reserve_b + amount_b));

        // Update total liquidity
        let new_total_liquidity = total_liquidity + liquidity_minted;
        env.storage().instance().set(&DataKey::TotalLiquidity, &new_total_liquidity);

        // Update user liquidity
        let user_liquidity: i128 = env.storage().persistent().get(&DataKey::Liquidity(provider.clone())).unwrap_or(0);
        env.storage().persistent().set(&DataKey::Liquidity(provider.clone()), &(user_liquidity + liquidity_minted));

        env.events()
            .publish((ADD_LIQUIDITY, symbol_short!("provider")), (provider, amount_a, amount_b, liquidity_minted));

        liquidity_minted
    }

    pub fn remove_liquidity(
        env: Env,
        provider: Address,
        liquidity: i128,
    ) -> (i128, i128) {
        provider.require_auth();

        let config: PoolConfig = env.storage().instance().get(&DataKey::PoolConfig).unwrap();
        assert!(config.remove_liquidity_enabled, "Removing liquidity is disabled");

        let user_liquidity: i128 = env.storage().persistent().get(&DataKey::Liquidity(provider.clone())).unwrap_or(0);
        assert!(user_liquidity >= liquidity, "Insufficient liquidity");

        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let total_liquidity: i128 = env.storage().instance().get(&DataKey::TotalLiquidity).unwrap_or(0);

        let amount_a = (liquidity * reserve_a) / total_liquidity;
        let amount_b = (liquidity * reserve_b) / total_liquidity;

        assert!(amount_a > 0 && amount_b > 0, "Insufficient amounts");

        // Update user liquidity
        env.storage().persistent().set(&DataKey::Liquidity(provider.clone()), &(user_liquidity - liquidity));

        // Update total liquidity
        let new_total_liquidity = total_liquidity - liquidity;
        env.storage().instance().set(&DataKey::TotalLiquidity, &new_total_liquidity);

        // Update reserves
        env.storage().instance().set(&DataKey::ReserveA, &(reserve_a - amount_a));
        env.storage().instance().set(&DataKey::ReserveB, &(reserve_b - amount_b));

        // Transfer tokens back to user (this would require implementing token transfer logic)

        env.events()
            .publish((REMOVE_LIQUIDITY, symbol_short!("provider")), (provider, amount_a, amount_b, liquidity));

        (amount_a, amount_b)
    }

    // -------------------------------------------------------------------------
    // Swapping
    // -------------------------------------------------------------------------

    pub fn swap(
        env: Env,
        user: Address,
        token_in: Symbol,
        amount_in: i128,
        amount_out_min: i128,
    ) -> i128 {
        user.require_auth();

        let config: PoolConfig = env.storage().instance().get(&DataKey::PoolConfig).unwrap();
        assert!(config.swap_enabled, "Swapping is disabled");
        assert!(amount_in > 0, "Amount in must be positive");

        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);

        let (reserve_in, reserve_out) = match token_in {
            symbol_short!("bst") => (reserve_a, reserve_b),
            symbol_short!("xlm") => (reserve_b, reserve_a),
            _ => panic!("Invalid token"),
        };

        // Calculate output amount with fee
        let amount_in_with_fee = amount_in * (config.fee_denominator - config.fee_numerator);
        let numerator = amount_in_with_fee * reserve_out;
        let denominator = (reserve_in * config.fee_denominator) + amount_in_with_fee;
        let amount_out = numerator / denominator;

        assert!(amount_out >= amount_out_min, "Insufficient output amount");
        assert!(amount_out <= reserve_out, "Insufficient liquidity");

        // Update reserves
        match token_in {
            symbol_short!("bst") => {
                env.storage().instance().set(&DataKey::ReserveA, &(reserve_a + amount_in));
                env.storage().instance().set(&DataKey::ReserveB, &(reserve_b - amount_out));
            },
            symbol_short!("xlm") => {
                env.storage().instance().set(&DataKey::ReserveB, &(reserve_b + amount_in));
                env.storage().instance().set(&DataKey::ReserveA, &(reserve_a - amount_out));
            },
            _ => {},
        }

        // Calculate fee
        let fee = (amount_in * config.fee_numerator) / config.fee_denominator;

        // Record swap history
        let history_count: u32 = env.storage().instance().get(&DataKey::SwapHistoryCount).unwrap_or(0);
        let record = SwapRecord {
            timestamp: env.ledger().timestamp(),
            user: user.clone(),
            token_in,
            amount_in,
            token_out: if token_in == symbol_short!("bst") { symbol_short!("xlm") } else { symbol_short!("bst") },
            amount_out,
            fee,
        };
        env.storage().instance().set(&DataKey::SwapHistory(history_count), &record);
        env.storage().instance().set(&DataKey::SwapHistoryCount, &(history_count + 1));

        // Transfer tokens (this would require implementing token transfer logic)

        env.events()
            .publish((SWAP, symbol_short!("user")), (user, amount_in, amount_out));

        amount_out
    }

    // -------------------------------------------------------------------------
    // Liquidity Mining Rewards
    // -------------------------------------------------------------------------

    pub fn claim_mining_rewards(env: Env, user: Address) -> i128 {
        user.require_auth();

        let mining_config: MiningConfig = env.storage().instance().get(&DataKey::MiningConfig).unwrap();
        assert!(mining_config.enabled, "Mining rewards are disabled");

        let user_liquidity: i128 = env.storage().persistent().get(&DataKey::Liquidity(user.clone())).unwrap_or(0);
        if user_liquidity == 0 {
            return 0;
        }

        // Calculate rewards (simplified - would need more complex logic for time-based rewards)
        let rewards = (user_liquidity * mining_config.reward_rate) / 1_000_000; // Scale down

        // Reset accumulated rewards
        env.storage().persistent().set(&DataKey::MiningRewards(user.clone()), &0_i128);

        // Mint reward tokens to user (this would require calling the token contract)

        env.events()
            .publish((REWARDS_CLAIMED, symbol_short!("user")), (user, rewards));

        rewards
    }

    // -------------------------------------------------------------------------
    // Analytics and Queries
    // -------------------------------------------------------------------------

    pub fn get_pool_stats(env: Env) -> PoolStats {
        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let total_liquidity: i128 = env.storage().instance().get(&DataKey::TotalLiquidity).unwrap_or(0);

        // Calculate BST price in XLM (reserve_b / reserve_a, scaled)
        let price_bst_xlm = if reserve_a > 0 {
            (reserve_b * 1_000_000) / reserve_a
        } else {
            0
        };

        PoolStats {
            reserve_a,
            reserve_b,
            total_liquidity,
            volume_24h: 0, // Would need to calculate from swap history
            fees_24h: 0,   // Would need to calculate from swap history
            price_bst_xlm,
        }
    }

    pub fn get_user_liquidity(env: Env, user: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Liquidity(user)).unwrap_or(0)
    }

    pub fn get_swap_history(env: Env, start_index: u32, limit: u32) -> Vec<SwapRecord> {
        let history_count: u32 = env.storage().instance().get(&DataKey::SwapHistoryCount).unwrap_or(0);
        let mut history = Vec::new(&env);
        let end_index = (start_index + limit).min(history_count);

        for i in start_index..end_index {
            if let Some(record) = env.storage().instance().get(&DataKey::SwapHistory(i)) {
                history.push_back(record);
            }
        }

        history
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    fn quote(amount_a: i128, reserve_a: i128, reserve_b: i128) -> i128 {
        assert!(reserve_a > 0 && reserve_b > 0, "Insufficient reserves");
        (amount_a * reserve_b) / reserve_a
    }

    fn sqrt(x: i128) -> i128 {
        if x == 0 || x == 1 {
            return x;
        }
        let mut z = (x + 1) / 2;
        let mut y = x;
        while z < y {
            y = z;
            z = (x / z + z) / 2;
        }
        y
    }
}