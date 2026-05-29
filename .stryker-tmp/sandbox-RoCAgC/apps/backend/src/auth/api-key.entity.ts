// @ts-nocheck
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  name: string;
  @Column({
    unique: true
  })
  keyHash: string;
  @Column({
    default: true
  })
  isActive: boolean;
  @ManyToOne(() => User)
  user: User;
  @Column()
  userId: string;
  @CreateDateColumn()
  createdAt: Date;
  @Column({
    nullable: true,
    type: 'timestamp'
  })
  lastUsedAt: Date;
}