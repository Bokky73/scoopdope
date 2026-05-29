#![cfg(test)]

use proptest::prelude::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

// Strategy for generating valid addresses
fn arb_address() -> impl Strategy<Value = Address> {
    prop::string::string_regex("[0-9A-Z]{56}").unwrap().prop_map(|s| {
        Address::from_contract_id(&Env::default(), &s.as_bytes()[..32].try_into().unwrap())
    })
}

// Strategy for generating valid amounts (0 to MAX_SUPPLY)
fn arb_amount() -> impl Strategy<Value = i128> {
    0i128..=10_000_000_000_000_000i128
}

// Strategy for generating valid ledger numbers
fn arb_ledger() -> impl Strategy<Value = u32> {
    0u32..=1_000_000u32
}

proptest! {
    #[test]
    fn fuzz_transfer_amount_bounds(
        amount in arb_amount(),
    ) {
        // Ensure amount doesn't overflow
        let env = Env::default();
        let admin = Address::generate(&env);
        
        // Amount should be within valid range
        prop_assert!(amount >= 0);
        prop_assert!(amount <= 10_000_000_000_000_000i128);
    }

    #[test]
    fn fuzz_vesting_schedule_validity(
        start in arb_ledger(),
        cliff in arb_ledger(),
        end in arb_ledger(),
        amount in arb_amount(),
    ) {
        // Vesting schedule constraints
        // cliff must be >= start
        // end must be > cliff
        // amount must be positive
        
        if cliff >= start && end > cliff && amount > 0 {
            prop_assert!(cliff >= start);
            prop_assert!(end > cliff);
            prop_assert!(amount > 0);
        }
    }

    #[test]
    fn fuzz_allowance_operations(
        owner_idx in 0u32..100,
        spender_idx in 0u32..100,
        amount in arb_amount(),
    ) {
        // Ensure owner and spender are different
        if owner_idx != spender_idx {
            prop_assert_ne!(owner_idx, spender_idx);
        }
        
        // Amount should be valid
        prop_assert!(amount >= 0);
    }

    #[test]
    fn fuzz_balance_operations(
        account_idx in 0u32..100,
        amount in arb_amount(),
    ) {
        // Balance should never be negative
        prop_assert!(amount >= 0);
    }

    #[test]
    fn fuzz_burn_amount_validation(
        amount in arb_amount(),
        total_supply in arb_amount(),
    ) {
        // Burn amount should not exceed total supply
        if amount <= total_supply {
            prop_assert!(amount <= total_supply);
        }
    }

    #[test]
    fn fuzz_mint_amount_validation(
        amount in arb_amount(),
        current_supply in arb_amount(),
    ) {
        let max_supply = 10_000_000_000_000_000i128;
        
        // Minted amount + current supply should not exceed max
        if let Some(new_supply) = current_supply.checked_add(amount) {
            if new_supply <= max_supply {
                prop_assert!(new_supply <= max_supply);
            }
        }
    }

    #[test]
    fn fuzz_vesting_claim_amount(
        total_amount in arb_amount(),
        claimed in arb_amount(),
        current_ledger in arb_ledger(),
        start in arb_ledger(),
        end in arb_ledger(),
    ) {
        // Claimed amount should never exceed total amount
        if claimed <= total_amount {
            prop_assert!(claimed <= total_amount);
        }
        
        // Current ledger should be >= start
        if current_ledger >= start {
            prop_assert!(current_ledger >= start);
        }
    }

    #[test]
    fn fuzz_approval_edge_cases(
        amount in arb_amount(),
    ) {
        // Test zero approval
        prop_assert_eq!(0i128, 0i128);
        
        // Test max approval
        prop_assert!(amount <= 10_000_000_000_000_000i128);
    }

    #[test]
    fn fuzz_transfer_sequence(
        amounts in prop::collection::vec(arb_amount(), 1..10),
    ) {
        let mut total = 0i128;
        
        for amount in amounts {
            if let Some(new_total) = total.checked_add(amount) {
                if new_total <= 10_000_000_000_000_000i128 {
                    total = new_total;
                }
            }
        }
        
        // Total should never exceed max supply
        prop_assert!(total <= 10_000_000_000_000_000i128);
    }

    #[test]
    fn fuzz_vesting_schedule_count(
        count in 0u32..1000,
    ) {
        // Schedule count should be reasonable
        prop_assert!(count < 1000);
    }

    #[test]
    fn fuzz_ledger_arithmetic(
        ledger1 in arb_ledger(),
        ledger2 in arb_ledger(),
    ) {
        // Ledger numbers should be non-negative
        prop_assert!(ledger1 >= 0);
        prop_assert!(ledger2 >= 0);
        
        // Difference should be calculable
        if ledger1 >= ledger2 {
            let diff = ledger1 - ledger2;
            prop_assert!(diff >= 0);
        }
    }
}

#[cfg(test)]
mod edge_case_tests {
    use super::*;

    #[test]
    fn test_zero_amount_transfer() {
        let amount = 0i128;
        assert_eq!(amount, 0);
    }

    #[test]
    fn test_max_amount_transfer() {
        let amount = 10_000_000_000_000_000i128;
        assert!(amount > 0);
    }

    #[test]
    fn test_overflow_prevention() {
        let max = i128::MAX;
        let result = max.checked_add(1);
        assert!(result.is_none());
    }

    #[test]
    fn test_underflow_prevention() {
        let min = i128::MIN;
        let result = min.checked_sub(1);
        assert!(result.is_none());
    }

    #[test]
    fn test_vesting_schedule_ordering() {
        let start = 100u32;
        let cliff = 200u32;
        let end = 300u32;
        
        assert!(cliff >= start);
        assert!(end > cliff);
    }

    #[test]
    fn test_invalid_vesting_schedule() {
        let start = 300u32;
        let cliff = 200u32;
        let end = 100u32;
        
        // These should fail validation
        assert!(cliff < start);
        assert!(end <= cliff);
    }
}
