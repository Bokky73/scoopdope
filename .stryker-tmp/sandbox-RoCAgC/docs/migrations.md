# Database Migrations Guide

This document describes how to work with TypeORM migrations in the scoopdope backend.

## Overview

The application uses TypeORM migrations to manage database schema changes in production. The `synchronize` option is automatically disabled when `NODE_ENV=production` to prevent automatic schema changes.

## Prerequisites

Ensure you have the following environment variables configured:

```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=scoopdope
```

## Available Scripts

### Generate a New Migration

Generate a new migration based on entity changes:

```bash
npm run typeorm:generate -- src/migrations/YourMigrationName
```

This command compares your entities with the current database schema and generates a migration file with the necessary SQL changes.

### Run Migrations

Apply all pending migrations:

```bash
npm run typeorm:run
```

This executes all migrations that haven't been applied yet, in the order they were created.

### Revert Last Migration

Revert the most recently applied migration:

```bash
npm run typeorm:revert
```

This rolls back the last migration, useful for testing or fixing issues.

## Migration Workflow

### Development Workflow

1. **Make entity changes**: Modify your TypeORM entities as needed
2. **Generate migration**: Run `npm run typeorm:generate -- src/migrations/DescriptiveName`
3. **Review migration**: Check the generated migration file to ensure it's correct
4. **Test locally**: Run `npm run typeorm:run` to apply the migration
5. **Commit**: Commit both the entity changes and the migration file

### Production Workflow

1. **Backup database**: Always backup before running migrations in production
2. **Deploy code**: Deploy the new code including migration files
3. **Run migrations**: Execute `npm run typeorm:run` on the production server
4. **Verify**: Check application logs and test critical functionality
5. **Monitor**: Monitor for any issues after migration

## Migration File Structure

Migration files are located in `src/migrations/` and follow this naming convention:

```
src/migrations/1234567890123-Description.ts
```

Each migration file exports a class with two methods:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Description1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Apply changes
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert changes
  }
}
```

## Best Practices

1. **One concern per migration**: Each migration should handle a single logical change
2. **Test migrations**: Always test migrations on a staging environment first
3. **Backup before production**: Never run migrations without a backup
4. **Review generated code**: Always review auto-generated migrations before committing
5. **Keep migrations small**: Large migrations can be difficult to rollback
6. **Document complex changes**: Add comments for non-obvious migrations

## Troubleshooting

### Migration fails with "relation already exists"

This usually means the database schema is out of sync with migrations. Options:

1. Check if the table/column already exists manually
2. Create a new migration to handle the existing schema
3. Reset the database (development only)

### Migration fails in production

1. Check database logs for specific error messages
2. Verify database credentials and permissions
3. Ensure database is accessible from the application server
4. Rollback if necessary using `npm run typeorm:revert`

### Generated migration is empty

This happens when TypeORM detects no changes between entities and database. Ensure:

1. Database connection is working
2. Entities are properly loaded
3. You've actually made changes to entities

## Example Migration

Here's an example of adding a new column to the courses table:

```typescript
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCourseCategory1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'courses',
      new TableColumn({
        name: 'category',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('courses', 'category');
  }
}
```

## Additional Resources

- [TypeORM Migrations Documentation](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
