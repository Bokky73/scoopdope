import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';
@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;
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
  courseId: string;
  @ManyToOne(() => Course, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({
    name: 'courseId'
  })
  course: Course;
  @Column()
  certificateHash: string;
  @Column({
    nullable: true
  })
  ipfsHash: string;
  @Column({
    nullable: true
  })
  stellarTransactionId: string;
  @Column({
    default: 'pending'
  })
  status: 'pending' | 'minted' | 'verified';
  @Column({
    nullable: true
  })
  pdfUrl: string;
  @CreateDateColumn()
  issuedAt: Date;
}