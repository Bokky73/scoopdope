import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
@Entity('email_preferences')
export class EmailPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Index({
    unique: true
  })
  @Column()
  userId: string;
  @Column({
    default: true
  })
  enrollment: boolean;
  @Column({
    default: true
  })
  completion: boolean;
  @Column({
    default: true
  })
  credentialIssued: boolean;
  @Column({
    default: true
  })
  marketing: boolean;
  @Column({
    nullable: true,
    unique: true
  })
  unsubscribeToken: string;
  @Column({
    default: false
  })
  unsubscribedAll: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}