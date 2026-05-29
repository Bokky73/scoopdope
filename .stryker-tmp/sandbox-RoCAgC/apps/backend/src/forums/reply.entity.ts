// @ts-nocheck
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from './post.entity';
@Entity('replies')
export class Reply {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  postId: string;
  @ManyToOne(() => Post, post => post.replies, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'postId'
  })
  post: Post;
  @Column()
  userId: string;
  @ManyToOne(() => User, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'userId'
  })
  user: User;
  @Column({
    type: 'text'
  })
  content: string;
  @Column({
    default: false
  })
  isAnswer: boolean;
  @CreateDateColumn()
  createdAt: Date;
}