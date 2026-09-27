import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Display name shown to users (e.g. "Blockchain", "DeFi"). */
  @Column({ unique: true })
  name: string;

  /** Slug for URL usage (e.g. "blockchain", "defi"). */
  @Column({ unique: true })
  slug: string;

  /**
   * FontAwesome / icon-library class name or identifier
   * (e.g. "fa-link" for blockchain, "fa-coins" for DeFi).
   * Null means no icon has been assigned yet.
   */
  @Column({ nullable: true, name: 'icon_name' })
  iconName: string | null;

  /** Optional human-readable description for admin UI. */
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
