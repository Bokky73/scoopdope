import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum RewardType {
  MODULE = 'module',
  COURSE = 'course',
}

@Entity('reward_history')
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.rewards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: RewardType })
  type: RewardType;

  @Column()
  referenceId: string;

  @Column({ type: 'int' })
  amount: number;

  @Column()
  reason: string;

  @Column({ nullable: true })
  txHash: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  claimedAt: Date;
}
