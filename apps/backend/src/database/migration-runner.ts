import { AppDataSource } from '../data-source';

const command = process.argv[2];

async function main() {
  if (!command || !['run', 'revert', 'show'].includes(command)) {
    console.error('Usage: node dist/database/migration-runner.js <run|revert|show>');
    process.exit(1);
  }

  try {
    await AppDataSource.initialize();

    switch (command) {
      case 'run': {
        const migrations = await AppDataSource.runMigrations();
        if (migrations.length === 0) {
          process.stdout.write('No pending migrations to run.\n');
        } else {
          process.stdout.write(`Ran ${migrations.length} migration(s):\n`);
          migrations.forEach((m) => process.stdout.write(`  ✅ ${m.name}\n`));
        }
        break;
      }
      case 'revert': {
        await AppDataSource.undoLastMigration();
        process.stdout.write('Reverted last migration.\n');
        break;
      }
      case 'show': {
        const executedMigrations = await AppDataSource.query(
          `SELECT name, "timestamp", "executedAt" FROM "${AppDataSource.options.migrationsTableName || 'migrations'}" ORDER BY "timestamp" ASC`,
        );
        const pendingMigrations = AppDataSource.migrations.filter(
          (m) => !executedMigrations.some((em: any) => em.name === m.name),
        );

        process.stdout.write('\nExecuted migrations:\n');
        if (executedMigrations.length === 0) {
          process.stdout.write('  (none)\n');
        } else {
          executedMigrations.forEach((em: any) =>
            process.stdout.write(`  ✅ ${em.name} (${em.executedAt})\n`),
          );
        }

        process.stdout.write('\nPending migrations:\n');
        if (pendingMigrations.length === 0) {
          process.stdout.write('  (none)\n');
        } else {
          pendingMigrations.forEach((pm) => process.stdout.write(`  ⏳ ${pm.name}\n`));
        }
        break;
      }
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Migration command failed:', error);
    process.exit(1);
  }
}

main();
