import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './notification.entity';
import { Enrollment } from '../enrollments/enrollment.entity';

@Injectable()
export class NotificationsRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepository.update({ id, userId }, { read: true });
  }

  async create(notification: Partial<Notification>): Promise<Notification> {
    const entity = this.notificationRepository.create(notification);
    return this.notificationRepository.save(entity);
  }

  async createForCourseStudents(
    courseId: string,
    payload: Partial<Notification>,
  ): Promise<Notification[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: { courseId },
      select: ['userId'],
    });

    if (enrollments.length === 0) {
      return [];
    }

    const notifications = enrollments.map((enrollment) =>
      this.notificationRepository.create({
        ...payload,
        userId: enrollment.userId,
      }),
    );

    return this.notificationRepository.save(notifications);
  }
}
