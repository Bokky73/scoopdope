// @ts-nocheck
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ContentType, ModerationStatus } from './moderation.enums';
@Entity('moderation_items')
export class ModerationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    type: 'enum',
    enum: ContentType
  })
  contentType: ContentType;
  @Column()
  contentId: string;
  @Column()
  reportedByUserId: string;
  @Column({
    type: 'enum',
    enum: ModerationStatus,
    default: ModerationStatus.PENDING
  })
  status: ModerationStatus;
  @Column({
    type: 'text',
    nullable: true
  })
  flagReason: string | null;
  @Column({
    type: 'float',
    nullable: true
  })
  toxicityScore: number | null;
  @Column({
    type: 'jsonb',
    nullable: true
  })
  comprehendResult: Record<string, unknown> | null;
  @Column({
    nullable: true
  })
  reviewedByUserId: string | null;
  @Column({
    type: 'text',
    nullable: true
  })
  reviewNote: string | null;
  @Column({
    type: 'text',
    nullable: true
  })
  appealReason: string | null;
  @Column({
    nullable: true
  })
  appealedByUserId: string | null;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}