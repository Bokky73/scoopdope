// @ts-nocheck
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ContentType, ModerationAction } from './moderation.enums';
@Entity('moderation_logs')
export class ModerationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  moderationItemId: string;
  @Column({
    type: 'enum',
    enum: ContentType
  })
  contentType: ContentType;
  @Column()
  contentId: string;
  @Column({
    type: 'enum',
    enum: ModerationAction
  })
  action: ModerationAction;
  @Column({
    nullable: true
  })
  performedByUserId: string | null;
  @Column({
    type: 'text',
    nullable: true
  })
  note: string | null;
  @CreateDateColumn()
  createdAt: Date;
}