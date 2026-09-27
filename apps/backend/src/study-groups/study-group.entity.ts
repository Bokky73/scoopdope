import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudyGroupMember } from './study-group-member.entity';

@Entity('study_groups')
export class StudyGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** The course this study group belongs to. */
  @Column({ type: 'uuid' })
  courseId: string;

  /** The user who created (and owns) the group. */
  @Column({ type: 'uuid' })
  creatorId: string;

  @OneToMany(() => StudyGroupMember, (m) => m.studyGroup, { cascade: true })
  members: StudyGroupMember[];

  /** Virtual field populated by the service — not stored in DB. */
  memberCount?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
