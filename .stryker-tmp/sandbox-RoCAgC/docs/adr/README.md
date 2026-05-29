# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) documenting significant technical decisions made in the scoopdope project.

## What is an ADR?

An ADR is a document that captures an important architectural decision along with its context and consequences. ADRs help teams understand why certain choices were made and provide historical context for future developers.

## Format

We use the [MADR (Markdown Any Decision Records)](https://adr.github.io/madr/) template format with the following sections:

- **Status**: Accepted, Proposed, Deprecated, or Superseded
- **Context**: The problem or situation requiring a decision
- **Decision**: The choice that was made
- **Rationale**: Why this decision was made (pros/cons analysis)
- **Consequences**: Positive, negative, and neutral outcomes
- **References**: Links to relevant documentation or resources

## Index

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](./ADR-001-stellar-soroban-over-ethereum.md) | Use Stellar/Soroban over Ethereum | Accepted |
| [ADR-002](./ADR-002-nestjs-over-express.md) | Use NestJS over Express | Accepted |
| [ADR-003](./ADR-003-nextjs-app-router.md) | Use Next.js App Router | Accepted |
| [ADR-004](./ADR-004-soroban-persistent-storage-credentials.md) | Use Soroban Persistent Storage for Credentials | Accepted |
| [ADR-005](./ADR-005-token-economics.md) | scoopdope Token (BST) Economics | Accepted |

## Creating New ADRs

When making significant architectural decisions:

1. Copy the MADR template
2. Number sequentially (ADR-005, ADR-006, etc.)
3. Use descriptive kebab-case filenames
4. Fill in all sections with context and reasoning
5. Update this README index
6. Get team review before marking as "Accepted"

## Resources

- [MADR Template](https://adr.github.io/madr/)
- [ADR GitHub Organization](https://adr.github.io/)
