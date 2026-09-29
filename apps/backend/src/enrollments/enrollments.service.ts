import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async enroll(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const enrollment = this.enrollmentRepository.create(createEnrollmentDto);
    return this.enrollmentRepository.save(enrollment);
  }

  async findByCourse(courseId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({ where: { courseId } });
  }

  async notifyAllEnrolled(courseId: string, message: string): Promise<void> {
    const enrollments = await this.enrollmentRepository.find({
      where: { courseId },
      select: ['studentId'],
    });

    if (enrollments.length === 0) {
      return;
    }

    const notifications = enrollments.map((enrollment) =>
      this.notificationRepository.create({
        userId: enrollment.studentId,
        message,
      }),
    );

    await this.notificationRepository.insert(notifications);
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id } });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment ${id} not found`);
    }
    await this.enrollmentRepository.remove(enrollment);
  }
}
