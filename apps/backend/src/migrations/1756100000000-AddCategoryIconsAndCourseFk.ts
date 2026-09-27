import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

/**
 * #868 – Course Category Icons
 *
 * 1. Create the `categories` table with an `icon_name` column.
 * 2. Add `categoryId` (nullable FK) to the `courses` table.
 * 3. Seed the five default categories used on the frontend.
 */
export class AddCategoryIconsAndCourseFk1756100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create categories table
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'name', type: 'varchar', isUnique: true },
          { name: 'slug', type: 'varchar', isUnique: true },
          { name: 'icon_name', type: 'varchar', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // 2. Add categoryId column to courses
    await queryRunner.addColumn(
      'courses',
      new TableColumn({ name: 'categoryId', type: 'uuid', isNullable: true }),
    );

    await queryRunner.createForeignKey(
      'courses',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // 3. Seed default categories (matching the frontend CATEGORIES constant)
    const categories = [
      { name: 'Blockchain', slug: 'blockchain', icon: 'fa-link' },
      { name: 'DeFi', slug: 'defi', icon: 'fa-coins' },
      { name: 'Smart Contracts', slug: 'smart-contracts', icon: 'fa-file-contract' },
      { name: 'Web3', slug: 'web3', icon: 'fa-globe' },
      { name: 'Stellar', slug: 'stellar', icon: 'fa-star' },
    ];

    for (const cat of categories) {
      await queryRunner.query(
        `INSERT INTO categories (name, slug, icon_name) VALUES ($1, $2, $3) ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.icon],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove FK from courses
    const table = await queryRunner.getTable('courses');
    const fk = table?.foreignKeys.find((f) => f.columnNames.includes('categoryId'));
    if (fk) await queryRunner.dropForeignKey('courses', fk);

    await queryRunner.dropColumn('courses', 'categoryId');
    await queryRunner.dropTable('categories');
  }
}
