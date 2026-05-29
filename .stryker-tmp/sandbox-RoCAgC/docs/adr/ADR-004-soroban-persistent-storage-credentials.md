# ADR-004: Use Soroban Persistent Storage for Credentials

## Status

Accepted

## Context

We needed to decide how to store educational credentials on the Stellar blockchain. Options included:

1. Stellar transactions with memo fields (off-chain data reference)
2. Claimable balances with metadata
3. Soroban contract persistent storage
4. IPFS with on-chain hash references
5. Hybrid: PostgreSQL + blockchain hash

Key requirements:
- Tamper-proof credential records
- Queryable by student public key
- Include course ID, completion date, and grade
- Verifiable by third parties
- Cost-effective storage
- Long-term data availability

## Decision

We use Soroban smart contract persistent storage to store credential records directly on-chain.

## Rationale

**Data Integrity:**
- Persistent storage: Immutable records stored in contract state
- Transaction memos: Limited to 28 bytes, requires off-chain database
- Soroban storage provides cryptographic guarantees without external dependencies

**Queryability:**
- Persistent storage: Direct contract queries by student address
- Transaction memos: Requires indexing service or full ledger scan
- Contract storage enables efficient credential verification

**Data Structure:**
- Persistent storage: Structured data with typed fields (course_id, timestamp, grade)
- Transaction memos: Unstructured text or hash reference
- Rich data model supports future extensions (skills, prerequisites)

**Cost Analysis:**
- Persistent storage: ~10KB per credential at ~$0.0001 storage cost
- Transaction + IPFS: Transaction fee + IPFS pinning service costs
- Soroban storage is cost-effective for credential-sized data

**Verification:**
- Persistent storage: Anyone can query contract to verify credentials
- Off-chain storage: Requires trusting external database or IPFS gateway
- On-chain verification is trustless and censorship-resistant

**Longevity:**
- Persistent storage: Lives as long as the Stellar network
- IPFS: Requires ongoing pinning service payments
- PostgreSQL: Requires server maintenance and backups
- Blockchain storage provides maximum durability

**Access Control:**
- Soroban contracts can enforce who can issue credentials (RBAC)
- Transaction-based approaches lack programmable access control
- Smart contract logic prevents unauthorized credential issuance

## Consequences

**Positive:**
- True decentralization with no off-chain dependencies
- Credentials remain verifiable even if our backend goes offline
- Tamper-proof records with cryptographic guarantees
- Efficient queries by student public key
- Access control enforced at the contract level
- Future-proof: data persists as long as Stellar exists

**Negative:**
- Storage costs scale with number of credentials (though minimal)
- Contract upgrades require migration strategy for existing data
- Query performance limited by RPC node capabilities
- Cannot store large files (transcripts, certificates) directly
- Requires Stellar RPC access for credential verification

**Neutral:**
- Need to implement contract query endpoints in backend API
- Credential metadata (images, detailed descriptions) still stored off-chain
- Archival nodes required for historical credential lookups

## Implementation Notes

The Analytics contract stores credentials using a composite key:
```rust
// Key: (student_address, course_id)
// Value: { completion_date, grade, issuer }
storage.persistent().set(&(student, course_id), &credential);
```

For large attachments (certificate PDFs, transcripts), we store IPFS hashes in the contract and pin files separately.

## References

- [Soroban Storage Documentation](https://soroban.stellar.org/docs/learn/persisting-data)
- [Stellar Storage Fees](https://developers.stellar.org/docs/learn/fundamentals/fees-resource-limits-metering)
- [Verifiable Credentials on Blockchain](https://www.w3.org/TR/vc-data-model/)
