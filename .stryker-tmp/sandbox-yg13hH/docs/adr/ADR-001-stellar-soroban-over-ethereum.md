# ADR-001: Use Stellar/Soroban over Ethereum

## Status

Accepted

## Context

We needed to select a blockchain platform for issuing verifiable educational credentials and managing token-based learning incentives. The primary candidates were Ethereum (with its mature ecosystem) and Stellar (with Soroban smart contracts).

Key requirements:
- Low transaction costs for credential issuance
- Fast transaction finality (seconds, not minutes)
- Simple account model for educational users
- Built-in asset issuance without complex token standards
- Predictable gas fees
- Developer-friendly smart contract language

## Decision

We chose Stellar with Soroban smart contracts as our blockchain platform.

## Rationale

**Transaction Costs:**
- Stellar: ~$0.00001 per transaction (100 stroops base fee)
- Ethereum: $1-50+ depending on network congestion
- For an education platform issuing credentials to thousands of students, Ethereum's gas fees would be prohibitively expensive

**Transaction Speed:**
- Stellar: 3-5 second finality
- Ethereum: 12+ seconds per block, multiple confirmations needed
- Students expect immediate credential issuance upon course completion

**Account Model:**
- Stellar: Built-in account system with native multi-asset support
- Ethereum: Requires ERC-20/ERC-721 contracts for tokens and NFTs
- Stellar's native asset issuance simplifies our token reward system

**Smart Contract Language:**
- Soroban: Rust with WebAssembly compilation
- Ethereum: Solidity
- Rust provides memory safety, better tooling, and is more familiar to systems programmers

**Predictability:**
- Stellar: Fixed base fee with predictable resource costs
- Ethereum: Variable gas prices create budgeting uncertainty
- Educational institutions need predictable operational costs

**Developer Experience:**
- Soroban SDK provides excellent testing utilities and local development
- Stellar CLI simplifies deployment and contract interaction
- Strong documentation and growing ecosystem

## Consequences

**Positive:**
- Minimal transaction costs enable sustainable credential issuance at scale
- Fast finality improves user experience
- Native asset support simplifies token reward implementation
- Rust's safety guarantees reduce smart contract vulnerabilities
- Predictable costs simplify financial planning

**Negative:**
- Smaller ecosystem compared to Ethereum (fewer libraries, tools, examples)
- Soroban is relatively new (launched 2024) with evolving best practices
- Fewer wallet options for end users (though Freighter is excellent)
- Limited DeFi integration opportunities compared to Ethereum
- Smaller developer community for troubleshooting

**Neutral:**
- Team needs to learn Stellar-specific concepts (stroops, trustlines, claimable balances)
- Migration to another blockchain would require significant rearchitecture

## References

- [Stellar Documentation](https://developers.stellar.org)
- [Soroban Smart Contracts](https://soroban.stellar.org)
- [Ethereum Gas Tracker](https://etherscan.io/gastracker)
- [Stellar Fee Stats](https://developers.stellar.org/docs/encyclopedia/fees-resource-limits-metering)
