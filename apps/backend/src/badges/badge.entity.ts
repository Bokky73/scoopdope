import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserBadge } from './user-badge.entity';

export type BadgeCriteriaType = 'courses_completed' | 'streak_days' | 'students_helped';

export interface BadgeCriteria {
  type: BadgeCriteriaType;
  threshold: number;
}

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  icon: string;

  @Column({ type: 'varchar', length: 10 })
  tier: 'bronze' | 'silver' | 'gold';

  @Column({ type: 'jsonb' })
  criteria: BadgeCriteria;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => UserBadge, (userBadge) => userBadge.badge)
  userBadges: UserBadge[];
}
