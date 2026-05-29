import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
export enum NotificationType {
  ENROLLMENT = 'enrollment',
  COMPLETION = 'completion',
  CREDENTIAL_ISSUED = 'credential_issued',
  COURSE_PUBLISHED = 'course_published',
  QA_QUESTION = 'qa_question',
  QA_ANSWER = 'qa_answer',
  ANNOUNCEMENT = 'announcement',
  WAITLIST_JOINED = 'waitlist_joined',
  WAITLIST_ENROLLED = 'waitlist_enrolled',
}
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  userId: string;
  @Column({
    type: 'enum',
    enum: NotificationType
  })
  type: NotificationType;
  @Column()
  message: string;
  @Column({
    default: false
  })
  isRead: boolean;
  @CreateDateColumn()
  createdAt: Date;
}