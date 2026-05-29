#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec, BytesN,
};

// =============================================================================
// Storage keys
// =============================================================================

#[contracttype]
pub enum DataKey {
    Admin,
    TokenContract,
    OracleContract,
    DexContract,
    BuybackConfig,
    BuybackHistory(u32),                 // index → BuybackRecord
    BuybackHistoryCount,                // u32
    LastBuybackLedger,                  // u32
    TotalBuybackAmount,                 // i128
    BuybackReserve,                     // i128
}

// =============================================================================
// Types
// =============================================================================

#[contracttype]
#[derive(Clone)]
pub struct BuybackConfig {
    pub enabled: bool,
    pub price_threshold: i128,          // BST price threshold for buyback (in stroops)
    pub max_buyback_amount: i128,       // Maximum BST to buyback per transaction
    pub min_reserve_balance: i128,      // Minimum reserve balance to maintain
    pub buyback_interval: u32,          // Minimum ledgers between buybacks
    pub dex_pool_id: BytesN<32>,        // DEX pool ID for BST/XLM pair
}

#[contracttype]
#[derive(Clone)]
pub struct BuybackRecord {
    pub timestamp: u64,
    pub ledger: u32,
    pub bst_price: i128,
    pub amount_bought: i128,
    pub xlm_spent: i128,
    pub trigger_reason: Symbol,         // 'price_threshold', 'manual', 'scheduled'
}

#[contracttype]
#[derive(Clone)]
pub struct BuybackAnalytics {
    pub total_buybacks: u32,
    pub total_bst_bought: i128,
    pub total_xlm_spent: i128,
    pub average_price: i128,
    pub last_buyback_timestamp: u64,
}

// =============================================================================
// Events
// =============================================================================

const BUYBACK_EXECUTED: Symbol = symbol_short!("buyback");
const BUYBACK_TRIGGERED: Symbol = symbol_short!("trigger");
const CONFIG_UPDATED: Symbol = symbol_short!("config_up");

// =============================================================================
// Contract
// =============================================================================

#[contract]
pub struct BuybackContract;

#[contractimpl]
impl BuybackContract {
    // -------------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------------

    pub fn initialize(
        env: Env,
        admin: Address,
        token_contract: Address,
        oracle_contract: Address,
        dex_contract: Address,
        dex_pool_id: BytesN<32>,
    ) {
        assert!(
            !env.storage().instance().has(&DataKey::Admin),
            "Already initialized"
        );
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenContract, &token_contract);
        env.storage().instance().set(&DataKey::OracleContract, &oracle_contract);
        env.storage().instance().set(&DataKey::DexContract, &dex_contract);

        // Initialize buyback config
        let config = BuybackConfig {
            enabled: false,
            price_threshold: 1000, // 0.01 XLM per BST (1000 stroops)
            max_buyback_amount: 100_000_0000000, // 100k BST
            min_reserve_balance: 1_000_0000000, // 10 XLM minimum reserve
            buyback_interval: 1000, // every 1000 ledgers
            dex_pool_id,
        };
        env.storage().instance().set(&DataKey::BuybackConfig, &config);

        // Initialize counters
        env.storage().instance().set(&DataKey::BuybackHistoryCount, &0_u32);
        env.storage().instance().set(&DataKey::TotalBuybackAmount, &0_i128);
        env.storage().instance().set(&DataKey::BuybackReserve, &0_i128);
        env.storage().instance().set(&DataKey::LastBuybackLedger, &0_u32);
    }

    // -------------------------------------------------------------------------
    // Configuration
    // -------------------------------------------------------------------------

    pub fn update_config(
        env: Env,
        admin: Address,
        enabled: Option<bool>,
        price_threshold: Option<i128>,
        max_buyback_amount: Option<i128>,
        min_reserve_balance: Option<i128>,
        buyback_interval: Option<u32>,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can update config");

        let mut config: BuybackConfig = env.storage().instance().get(&DataKey::BuybackConfig).unwrap();

        if let Some(enabled_val) = enabled {
            config.enabled = enabled_val;
        }
        if let Some(threshold) = price_threshold {
            config.price_threshold = threshold;
        }
        if let Some(max_amount) = max_buyback_amount {
            config.max_buyback_amount = max_amount;
        }
        if let Some(min_reserve) = min_reserve_balance {
            config.min_reserve_balance = min_reserve;
        }
        if let Some(interval) = buyback_interval {
            config.buyback_interval = interval;
        }

        env.storage().instance().set(&DataKey::BuybackConfig, &config);

        env.events()
            .publish((CONFIG_UPDATED, symbol_short!("admin")), admin);
    }

    pub fn get_config(env: Env) -> BuybackConfig {
        env.storage().instance().get(&DataKey::BuybackConfig).unwrap()
    }

    // -------------------------------------------------------------------------
    // Buyback Logic
    // -------------------------------------------------------------------------

    pub fn check_and_execute_buyback(env: Env) {
        let config: BuybackConfig = Self::get_config(env.clone());
        if !config.enabled {
            return;
        }

        let current_ledger = env.ledger().sequence();
        let last_buyback: u32 = env.storage().instance().get(&DataKey::LastBuybackLedger).unwrap_or(0);

        // Check interval
        if current_ledger - last_buyback < config.buyback_interval {
            return;
        }

        // Get current BST price from oracle
        let bst_price = Self::get_bst_price(env.clone());
        if bst_price <= config.price_threshold {
            return; // Price not low enough for buyback
        }

        // Check reserve balance
        let reserve_balance: i128 = env.storage().instance().get(&DataKey::BuybackReserve).unwrap_or(0);
        if reserve_balance <= config.min_reserve_balance {
            return; // Insufficient reserve
        }

        // Calculate buyback amount
        let available_for_buyback = reserve_balance - config.min_reserve_balance;
        let max_buyback_xlm = available_for_buyback.min(config.max_buyback_amount * bst_price / 1_000_000); // Estimate XLM needed

        if max_buyback_xlm <= 0 {
            return;
        }

        // Execute buyback via DEX
        Self::execute_buyback_via_dex(env, max_buyback_xlm, bst_price, symbol_short!("price_thresh"));
    }

    pub fn manual_buyback(
        env: Env,
        admin: Address,
        max_xlm_amount: i128,
    ) {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        assert!(admin == stored_admin, "Only admin can execute manual buyback");

        let config: BuybackConfig = Self::get_config(env.clone());
        assert!(config.enabled, "Buyback is disabled");

        let reserve_balance: i128 = env.storage().instance().get(&DataKey::BuybackReserve).unwrap_or(0);
        assert!(reserve_balance >= max_xlm_amount + config.min_reserve_balance, "Insufficient reserve for buyback");

        let bst_price = Self::get_bst_price(env.clone());

        Self::execute_buyback_via_dex(env, max_xlm_amount, bst_price, symbol_short!("manual"));
    }

    // -------------------------------------------------------------------------
    // Reserve Management
    // -------------------------------------------------------------------------

    pub fn add_to_reserve(env: Env, from: Address, amount: i128) {
        from.require_auth();
        assert!(amount > 0, "Amount must be positive");

        let mut reserve_balance: i128 = env.storage().instance().get(&DataKey::BuybackReserve).unwrap_or(0);
        reserve_balance = reserve_balance.checked_add(amount).expect("arithmetic overflow");
        env.storage().instance().set(&DataKey::BuybackReserve, &reserve_balance);

        // Transfer XLM to contract (assuming XLM is the native asset)
        // In Soroban, this would require implementing the transfer logic
    }

    pub fn get_reserve_balance(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::BuybackReserve).unwrap_or(0)
    }

    // -------------------------------------------------------------------------
    // Analytics
    // -------------------------------------------------------------------------

    pub fn get_buyback_analytics(env: Env) -> BuybackAnalytics {
        let history_count: u32 = env.storage().instance().get(&DataKey::BuybackHistoryCount).unwrap_or(0);
        let total_bst_bought: i128 = env.storage().instance().get(&DataKey::TotalBuybackAmount).unwrap_or(0);

        if history_count == 0 {
            return BuybackAnalytics {
                total_buybacks: 0,
                total_bst_bought: 0,
                total_xlm_spent: 0,
                average_price: 0,
                last_buyback_timestamp: 0,
            };
        }

        // Calculate analytics from history
        let mut total_xlm_spent = 0_i128;
        let mut last_timestamp = 0_u64;

        for i in 0..history_count {
            if let Some(record) = env.storage().instance().get(&DataKey::BuybackHistory(i)) {
                total_xlm_spent = total_xlm_spent.checked_add(record.xlm_spent).unwrap_or(total_xlm_spent);
                last_timestamp = last_timestamp.max(record.timestamp);
            }
        }

        let average_price = if total_bst_bought > 0 {
            (total_xlm_spent * 1_000_000) / total_bst_bought // Scaled price
        } else {
            0
        };

        BuybackAnalytics {
            total_buybacks: history_count,
            total_bst_bought,
            total_xlm_spent,
            average_price,
            last_buyback_timestamp: last_timestamp,
        }
    }

    pub fn get_buyback_history(env: Env, start_index: u32, limit: u32) -> Vec<BuybackRecord> {
        let history_count: u32 = env.storage().instance().get(&DataKey::BuybackHistoryCount).unwrap_or(0);
        let mut history = Vec::new(&env);
        let end_index = (start_index + limit).min(history_count);

        for i in start_index..end_index {
            if let Some(record) = env.storage().instance().get(&DataKey::BuybackHistory(i)) {
                history.push_back(record);
            }
        }

        history
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    fn get_bst_price(env: &Env) -> i128 {
        let oracle_contract: Address = env.storage().instance().get(&DataKey::OracleContract).unwrap();
        // This would call the oracle contract to get BST price
        // For now, return a mock price
        2000 // Mock price: 0.02 XLM per BST
    }

    fn execute_buyback_via_dex(
        env: Env,
        xlm_amount: i128,
        bst_price: i128,
        trigger_reason: Symbol,
    ) {
        let config: BuybackConfig = Self::get_config(env.clone());
        let dex_contract: Address = env.storage().instance().get(&DataKey::DexContract).unwrap();

        // Estimate BST amount based on price
        let estimated_bst_amount = (xlm_amount * 1_000_000) / bst_price; // Assuming price is in stroops per BST

        // Cap at max buyback amount
        let bst_to_buy = estimated_bst_amount.min(config.max_buyback_amount);

        // Execute DEX swap (this would call the DEX contract)
        // For now, simulate the swap

        // Update reserve balance
        let mut reserve_balance: i128 = env.storage().instance().get(&DataKey::BuybackReserve).unwrap_or(0);
        reserve_balance = reserve_balance.checked_sub(xlm_amount).expect("arithmetic overflow");
        env.storage().instance().set(&DataKey::BuybackReserve, &reserve_balance);

        // Update total buyback amount
        let mut total_bought: i128 = env.storage().instance().get(&DataKey::TotalBuybackAmount).unwrap_or(0);
        total_bought = total_bought.checked_add(bst_to_buy).expect("arithmetic overflow");
        env.storage().instance().set(&DataKey::TotalBuybackAmount, &total_bought);

        // Record buyback history
        let history_count: u32 = env.storage().instance().get(&DataKey::BuybackHistoryCount).unwrap_or(0);
        let record = BuybackRecord {
            timestamp: env.ledger().timestamp(),
            ledger: env.ledger().sequence(),
            bst_price,
            amount_bought: bst_to_buy,
            xlm_spent: xlm_amount,
            trigger_reason,
        };
        env.storage().instance().set(&DataKey::BuybackHistory(history_count), &record);
        env.storage().instance().set(&DataKey::BuybackHistoryCount, &(history_count + 1));
        env.storage().instance().set(&DataKey::LastBuybackLedger, &env.ledger().sequence());

        env.events()
            .publish((BUYBACK_EXECUTED, symbol_short!("amount")), (bst_to_buy, xlm_amount));
    }
}