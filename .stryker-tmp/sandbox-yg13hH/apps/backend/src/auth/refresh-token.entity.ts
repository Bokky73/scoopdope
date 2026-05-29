import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  tokenHash: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'userId'
  })
  user: User;
  @Column()
  userId: string;
  @Column()
  expiresAt: Date;
  @Column({
    default: false
  })
  revoked: boolean;
  @CreateDateColumn()
  createdAt: Date;
}