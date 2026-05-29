# ADR-005: scoopdope Token (BST) Economics

## Status

Accepted

## Context

scoopdope rewards learners and instructors with a native utility token (BST) issued on the Stellar network via a Soroban smart contract. Before deploying to mainnet we needed to formalise the economic model, covering:

- How many tokens exist and who controls issuance
- How rewards are calculated and distributed per learning activity
- How instructor allocations vest over time
- Whether BST should carry governance rights
- What safeguards prevent supply inflation or contract abuse

Without a documented model, reward amounts, supply caps, and vesting parameters would be set ad-hoc, making the system hard to audit and impossible to reason about at scale.

## Decision

We adopt the following token economics for BST:

### Token Parameters

| Parameter | Value |
|---|---|
| Name | scoopdope Token |
| Symbol | BST |
| Decimals | 7 |
| Max supply | 1,000,000,000 BST (1 billion) |
| On-chain representation | `10_000_000_000_000_000` (raw i128 with 7 decimal places) |
| Standard | SEP-0041 (Stellar token interface) |

### Token Distribution Model

| Allocation | Share | Purpose |
|---|---|---|
| Student rewards | 40% | Minted on-demand as learners complete modules and courses |
| Instructor vesting | 30% | Released linearly over time to incentivise content quality |
| Platform reserve | 20% | Held by the admin account for partnerships, grants, and liquidity |
| Ecosystem / treasury | 10% | Community initiatives, bug bounties, and future governance |

Student reward and instructor vesting tokens are minted lazily (only when earned or claimed), so circulating supply grows gradually rather than being pre-minted in full.

### Reward Calculation Logic

Rewards are minted by the backend (`STELLAR_SECRET_KEY` admin account) after the Analytics contract confirms a verified progress event.

| Activity | Reward |
|---|---|
| Module completion (< 100%) | `progress_delta × module_weight × base_rate` |
| Course completion (100%) | `course_completion_bonus` (flat amount, set per course) |
| First-time course enrolment | 0 (no reward for enrolment alone) |

`base_rate` and `course_completion_bonus` are off-chain configuration values stored in the backend. They are not encoded in the contract, allowing adjustment without a contract upgrade.

Reward minting calls `TokenContract::mint(to, amount)`, which:
1. Requires admin authorisation (`admin.require_auth()`).
2. Checks `new_supply <= MAX_SUPPLY` before writing.
3. Uses `checked_add` / `checked_sub` throughout to prevent arithmetic overflow.

### Minting Rules

- Only the designated admin address may call `mint` or `create_vesting`.
- The contract enforces `MAX_SUPPLY = 10_000_000_000_000_000` (1 billion BST). Any mint that would breach this cap panics with `"Max supply exceeded"`.
- There is no batch-mint or delegated-mint mechanism; all minting goes through the single admin key.
- The admin key is the backend service account. Key rotation requires redeploying the contract with a new admin or adding an admin-transfer function in a future upgrade.

### Vesting Schedule Rationale

Instructor allocations use on-chain linear vesting to align incentives with long-term content quality.

```
vested(t) = total_amount × (t − start_ledger) / (end_ledger − start_ledger)
```

- **Cliff**: No tokens are claimable before `cliff_ledger`. This prevents instructors from withdrawing immediately after publishing a course.
- **Linear release**: After the cliff, tokens vest proportionally to ledger progress until `end_ledger`.
- **Incremental claims**: Instructors may call `claim_vesting` multiple times; each call mints only the newly vested amount (`vested(t) − claimed`).
- **Typical parameters**: cliff = 6 months of ledgers (~3,110,400 ledgers at ~5 s/ledger), end = 24 months (~12,441,600 ledgers). Exact values are set per instructor by the admin at schedule creation time.
- Vesting schedules are stored in Soroban persistent storage under `DataKey::Vesting(beneficiary)`, surviving ledger TTL expiry as long as the entry is renewed.

Rationale for on-chain vesting over off-chain: the contract is the single source of truth; no backend database inconsistency can cause over- or under-payment.

### Governance Token Considerations

BST is currently a **utility token only** — it grants no on-chain voting rights. The decision to defer governance was made for the following reasons:

1. **Complexity**: On-chain governance (proposal creation, quorum, time-locks) adds significant contract surface area and audit scope before the platform has proven product-market fit.
2. **Regulatory uncertainty**: Governance tokens may attract additional regulatory scrutiny in some jurisdictions. Deferring this feature reduces legal risk at launch.
3. **Premature decentralisation**: With a small initial user base, token-weighted voting would be dominated by early adopters and the platform reserve, providing little meaningful decentralisation.

**Future path**: If governance is introduced, it will be implemented as a separate Governance contract that reads BST balances as voting weight (snapshot-based), rather than modifying the token contract itself. This keeps the token contract minimal and auditable.

## Rationale

**Why a hard supply cap?**
A fixed cap of 1 billion BST creates predictable scarcity. Unlimited minting would devalue rewards over time and undermine the incentive model.

**Why lazy minting instead of pre-minting?**
Pre-minting the full supply and distributing from a treasury requires trust in the admin to not dump tokens. Lazy minting means tokens only exist when earned, reducing the attack surface and aligning supply with actual platform usage.

**Why on-chain vesting for instructors?**
Off-chain vesting schedules depend on the backend database being correct and the admin acting honestly. On-chain vesting is self-enforcing: the contract releases exactly what was agreed, with no admin intervention required after schedule creation.

**Why SEP-0041?**
SEP-0041 is the Stellar standard for fungible tokens, equivalent to ERC-20 on Ethereum. Compliance ensures BST works with Stellar wallets (Freighter), DEXes, and tooling without custom integration.

**Why 7 decimals?**
Stellar's native XLM uses 7 decimal places (stroops). Matching this convention simplifies mental arithmetic and tooling integration.

## Consequences

**Positive:**
- Hard supply cap prevents runaway inflation and makes reward value predictable.
- Lazy minting minimises admin trust requirements.
- On-chain vesting is tamper-proof and auditable by anyone.
- SEP-0041 compliance gives immediate wallet and tooling support.
- Deferring governance keeps the contract small and auditable.

**Negative:**
- Admin key is a single point of failure for minting; compromise allows minting up to the cap. Mitigated by keeping the key in a secrets manager and rotating it on any suspected exposure.
- Reward rates (`base_rate`, `course_completion_bonus`) are off-chain config — a misconfigured backend could over-reward. Mitigated by backend validation and supply cap enforcement in the contract.
- No governance means platform decisions are centralised. Accepted as a deliberate trade-off for launch.
- Vesting schedule parameters (cliff, end ledger) cannot be modified after creation. Instructors must be informed of terms before a schedule is created.

**Neutral:**
- Circulating supply will be well below 1 billion for the foreseeable future; the cap is a ceiling, not a target.
- Token price discovery is out of scope for this ADR; BST has no initial exchange listing.

## References

- [SEP-0041: Soroban Token Interface](https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0041.md)
- [Soroban SDK — contracttype](https://docs.rs/soroban-sdk/latest/soroban_sdk/attr.contracttype.html)
- [contracts/token/src/lib.rs](../../contracts/token/src/lib.rs)
- [contracts/token/src/tests.rs](../../contracts/token/src/tests.rs)
- [ADR-001: Use Stellar/Soroban over Ethereum](./ADR-001-stellar-soroban-over-ethereum.md)
