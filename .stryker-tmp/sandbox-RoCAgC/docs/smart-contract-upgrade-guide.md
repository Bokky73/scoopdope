# Smart Contract Upgrade Guide

This guide describes the upgrade mechanism implemented for the ScoopDope Soroban contracts.

## Overview

The upgrade mechanism allows the platform to evolve its smart contract logic while preserving state and maintaining decentralization through governance-gated upgrades.

### Key Features

1. **Governance-Gated**: Upgrades can only be triggered by the Governance contract after a successful community vote.
2. **Proxy Pattern (Transparent)**: Uses Soroban's built-in `update_current_contract_wasm` for efficient upgrades.
3. **State Migration**: Provides a structured way to migrate state between versions.
4. **Rollback Capability**: Maintains a history of WASM hashes to allow quick rollbacks if an upgrade is found to be faulty.

## Upgrade Process

1. **Develop New WASM**: Create the updated contract code.
2. **Propose Upgrade**: An authorized proposer submits an `UpgradeProposal` to the Governance contract with the new WASM hash.
3. **Community Vote**: Token holders vote on the proposal.
4. **Execution**: If approved, the proposal can be executed, which calls the `upgrade` method on the target contract.

## Implementation Details

### SharedContract Upgrade Logic

The `SharedContract` provides the base upgrade logic that other contracts should follow:

```rust
pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) {
    let governance: Address = env.storage().instance().get(&DataKey::Governance).expect("Governance not set");
    governance.require_auth();

    // Store history for rollback
    // ...
    
    // Perform the upgrade
    env.deployer().update_current_contract_wasm(new_wasm_hash);
}
```

### State Migration

If an upgrade requires changing data structures or initializing new storage keys, use the `migrate` function:

```rust
pub fn migrate(env: Env, admin: Address) {
    admin.require_auth();
    // ... migration logic ...
    env.storage().instance().set(&DataKey::MigratedVersion, &current_version);
}
```

## Rollback

In case of an emergency, the Governance contract can call `rollback()` on any contract that implements the `SharedContract` upgrade pattern. This will restore the previous WASM code and increment the version number to indicate a state change.

## Security Considerations

- **Governance Authority**: Ensure the Governance contract is the only entity with the `Upgrade` permission on sensitive contracts.
- **Timelocks**: Upgrades should have a timelock period between approval and execution to allow users to exit if they disagree with the changes.
- **Testing**: Always run the upgrade test suite against new WASM hashes before proposing them on-chain.
