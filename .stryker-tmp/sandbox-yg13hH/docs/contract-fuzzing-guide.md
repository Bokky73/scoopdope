# Smart Contract Fuzzing Tests

This document describes the fuzzing test strategy for scoopdope smart contracts.

## Overview

Fuzzing tests use property-based testing with `proptest` to discover edge cases and potential vulnerabilities in smart contract functions. These tests generate random inputs and verify that contract invariants hold.

## Test Coverage

### Token Contract (`contracts/token/src/fuzz_tests.rs`)

#### Amount Validation
- **fuzz_transfer_amount_bounds**: Validates transfer amounts stay within valid range (0 to MAX_SUPPLY)
- **fuzz_burn_amount_validation**: Ensures burn amount doesn't exceed total supply
- **fuzz_mint_amount_validation**: Prevents minting beyond max supply cap
- **fuzz_transfer_sequence**: Tests multiple sequential transfers without overflow

#### Vesting Schedule Validation
- **fuzz_vesting_schedule_validity**: Validates schedule constraints (cliff >= start, end > cliff)
- **fuzz_vesting_claim_amount**: Ensures claimed amount never exceeds total vested amount
- **fuzz_vesting_schedule_count**: Validates reasonable schedule count limits

#### Allowance Operations
- **fuzz_allowance_operations**: Tests allowance operations with different owners/spenders
- **fuzz_approval_edge_cases**: Tests zero and max approvals

#### Ledger Arithmetic
- **fuzz_ledger_arithmetic**: Validates ledger number calculations and ordering

#### Edge Cases
- **test_zero_amount_transfer**: Validates zero amount handling
- **test_max_amount_transfer**: Tests maximum amount handling
- **test_overflow_prevention**: Ensures overflow is caught
- **test_underflow_prevention**: Ensures underflow is caught
- **test_vesting_schedule_ordering**: Validates schedule time ordering
- **test_invalid_vesting_schedule**: Confirms invalid schedules are rejected

## Running Fuzzing Tests

### Locally

```bash
# Run all fuzzing tests
cargo test --lib fuzz

# Run with verbose output
cargo test --lib fuzz -- --nocapture

# Run specific fuzzing test
cargo test --lib fuzz_transfer_amount_bounds

# Run with custom seed for reproducibility
PROPTEST_REGRESSIONS=proptest-regressions.txt cargo test --lib fuzz
```

### With Timeout

```bash
# Run fuzzing with 60 second timeout
timeout 60 cargo test --lib fuzz -- --test-threads=1

# Run fuzzing with 120 second timeout
timeout 120 cargo test --lib fuzz -- --test-threads=1 --nocapture
```

## CI/CD Integration

Fuzzing tests run automatically in the GitHub Actions CI pipeline:

1. **Standard fuzzing** (60s timeout): Runs on every push and PR
2. **Extended fuzzing** (120s timeout): Runs on main branch pushes
3. **Regression testing**: Failed cases are saved and re-run to prevent regressions

## Interpreting Results

### Successful Run
```
test fuzz_transfer_amount_bounds ... ok
test fuzz_vesting_schedule_validity ... ok
```

### Failed Run
If a test fails, proptest will:
1. Print the failing input
2. Save the regression case to `proptest-regressions.txt`
3. Re-run the same case on subsequent runs

### Regression Prevention

Failed test cases are automatically saved and re-run to ensure fixes don't regress:

```bash
# View saved regressions
cat proptest-regressions.txt

# Clear regressions (after fixing)
rm proptest-regressions.txt
```

## Adding New Fuzzing Tests

1. Define a strategy for generating test inputs:
```rust
fn arb_custom_input() -> impl Strategy<Value = CustomType> {
    // Define how to generate random CustomType values
}
```

2. Create a proptest test:
```rust
proptest! {
    #[test]
    fn fuzz_my_function(input in arb_custom_input()) {
        // Test invariants
        prop_assert!(some_condition);
    }
}
```

3. Run and verify:
```bash
cargo test --lib fuzz_my_function
```

## Known Issues and Findings

### Issue #1: Vesting Schedule Validation
- **Status**: Fixed
- **Description**: Vesting schedules with cliff > end were not rejected
- **Fix**: Added validation to ensure cliff <= end

### Issue #2: Overflow in Transfer Sequences
- **Status**: Fixed
- **Description**: Multiple transfers could overflow without proper checks
- **Fix**: Added checked_add with overflow prevention

## Performance Considerations

- Fuzzing tests run with `--test-threads=1` to avoid race conditions
- Default timeout is 60 seconds per test
- Extended timeout (120s) available for comprehensive testing
- Results are uploaded as artifacts for analysis

## References

- [proptest Documentation](https://docs.rs/proptest/)
- [Property-Based Testing](https://hypothesis.works/articles/what-is-property-based-testing/)
- [Soroban Testing Guide](https://soroban.stellar.org/docs/learn/testing)
