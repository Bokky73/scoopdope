# Catastrophic Failure Recovery Guide

## Backup strategies for database and Redis

A strong backup strategy is critical for restoring service after catastrophic failures.

### Database backups

- **Regular snapshots**: take daily or hourly backups of PostgreSQL data.
- **Point-in-time recovery (PITR)**: retain WAL archives long enough to recover to a precise moment.
- **Offsite storage**: copy backups to a separate region or provider to avoid a single-cloud failure.
- **Retention policy**: keep recent backups for fast recovery while retaining longer-term archives for compliance.
- **Backup verification**: regularly restore backups to test environments to confirm they are valid.

### Redis backups

- **RDB snapshots**: use Redis snapshots (`SAVE`/`BGSAVE`) for periodic persistent copies.
- **AOF persistence**: enable append-only file mode for more granular recovery and lower data loss.
- **Replication**: run Redis replicas in separate failure domains to support failover.
- **Export and archive**: periodically export critical Redis state to durable storage for longer-term recovery.

## Data restoration procedures

When restoring data, follow a documented and repeatable process.

### Database restoration

1. Identify the latest valid backup that meets the recovery point objective.
2. Restore the PostgreSQL data directory or import the backup file to a recovery instance.
3. Restore WAL archives as needed to reach the target recovery time.
4. Validate schema compatibility and migrate if necessary.
5. Run sanity checks on core data: user accounts, transaction history, contract references.
6. Promote the recovery instance only after the restored data is verified.

### Redis restoration

1. Stop writes to the affected Redis cluster to avoid data corruption.
2. Restore from the most recent RDB snapshot or AOF file.
3. Verify that critical keys, counters, and session data are present.
4. Restart Redis with persistence enabled and allow replicas to resynchronize.
5. Rebuild any transient state that cannot be recovered from persistence (for example, ephemeral cache entries).

## Contract state recovery process

Smart contracts and on-chain state require a separate recovery approach.

- **Verify chain state**: check the on-chain ledger to confirm the deployed contract version and current stored values.
- **Rehydrate off-chain state**: restore any application-side contract metadata from backups or event logs.
- **Reconcile with on-chain state**: compare on-chain contract state against cached state and database records.
- **Redeploy if needed**: if a contract deployment is corrupted or invalid, follow upgrade/change procedures carefully and notify stakeholders.

In environments with both on-chain and off-chain state, prioritize consistency and avoid forcing mismatched data back into the system.

## RTO and RPO definitions

Understanding recovery objectives guides planning and decision-making.

- **Recovery Time Objective (RTO)**: the maximum acceptable time for bringing the system back online after a failure.
- **Recovery Point Objective (RPO)**: the maximum acceptable data loss window measured in time.

Example targets:

- **Critical production**: RTO <= 1 hour, RPO <= 15 minutes
- **Standard production**: RTO <= 4 hours, RPO <= 1 hour
- **Non-critical environments**: RTO <= 24 hours, RPO <= 6 hours

Choose RTO and RPO values based on business impact, customer expectations, and operational ability.

## Incident response workflow

A calm, repeatable incident workflow reduces risk and speeds recovery.

1. **Detect**: monitor alerts, logs, and customer reports.
2. **Triage**: determine the impact, scope, and severity.
3. **Communicate**: announce the incident internally and externally with clear status updates.
4. **Contain**: stop the damage and prevent compounding failures.
5. **Recover**: restore backups, failover systems, or roll back changes.
6. **Validate**: confirm the system is healthy and core functionality is working.
7. **Review**: conduct a post-incident analysis, document findings, and update processes.

Document the responsible teams, escalation paths, and communication channels so everyone can act quickly when a catastrophic event occurs.
