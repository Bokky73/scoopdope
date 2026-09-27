import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Lesson } from '../courses/lesson.entity';

@Entity('user_bookmarks')
@Unique(['userId', 'lessonId'])
export class UserBookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  // Why: bookmarks are owned by a user; deleting the user removes their bookmarks (GDPR).
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  lessonId: string;

  // Why: if a lesson is deleted, its bookmarks are removed to prevent orphan records.
  @ManyToOne(() => Lesson, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @CreateDateColumn()
  createdAt: Date;
}
