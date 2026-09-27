import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { StudyGroup } from './study-group.entity';

@Entity('study_group_members')
@Unique(['studyGroupId', 'userId'])
export class StudyGroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  studyGroupId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => StudyGroup, (g) => g.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studyGroupId' })
  studyGroup: StudyGroup;

  @CreateDateColumn()
  joinedAt: Date;
}
