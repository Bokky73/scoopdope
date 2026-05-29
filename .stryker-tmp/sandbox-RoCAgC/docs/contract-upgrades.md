# Contract Upgrade Process

Soroban contracts on Stellar can be upgraded in-place via `env.deployer().update_current_contract_wasm()`. The `SharedContract` exposes an `upgrade` function gated behind admin authentication.

## How it works

1. Build the new contract WASM and get its hash (uploaded to the network via `soroban contract upload`).
2. Call `SharedContract::upgrade(admin, new_wasm_hash)` — the admin address must sign the transaction.
3. The contract emits a `("shared", "upgraded")` event containing the new WASM hash for auditability.
4. The contract code is replaced atomically; storage is preserved.

## CLI example

```bash
# 1. Upload new WASM and capture the hash
NEW_HASH=$(soroban contract upload \
  --wasm target/wasm32-unknown-unknown/release/brain_storm_shared.wasm \
  --source admin_key \
  --network testnet)

# 2. Invoke upgrade
soroban contract invoke \
  --id $CONTRACT_ID \
  --source admin_key \
  --network testnet \
  -- upgrade \
  --admin $ADMIN_ADDRESS \
  --new_wasm_hash $NEW_HASH
```

## Security notes

- Only the address stored as `Admin` during `initialize` can call `upgrade`.
- The `admin.require_auth()` call ensures the transaction must be signed by the admin key — no impersonation is possible.
- Always verify the new WASM hash matches your audited build before broadcasting.
- Consider a timelock or multisig admin for production deployments.

## Testing

The upgrade path is tested in `contracts/shared/src/tests.rs`. Because `update_current_contract_wasm` requires a real WASM hash on-chain, the unit test covers the auth guard (non-admin panics). Full upgrade integration tests should be run against a local Soroban sandbox using `soroban-cli`.
