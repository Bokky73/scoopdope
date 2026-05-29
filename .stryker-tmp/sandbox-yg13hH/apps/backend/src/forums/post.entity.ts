import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';
import { Reply } from './reply.entity';
@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  courseId: string;
  @ManyToOne(() => Course, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'courseId'
  })
  course: Course;
  @Column()
  userId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'userId'
  })
  user: User;
  @Column()
  title: string;
  @Column({
    type: 'text'
  })
  content: string;
  @Column({
    default: false
  })
  isPinned: boolean;
  @Column({
    nullable: true
  })
  answerReplyId: string | null;
  @OneToMany(() => Reply, reply => reply.post)
  replies: Reply[];
  @CreateDateColumn()
  createdAt: Date;
}