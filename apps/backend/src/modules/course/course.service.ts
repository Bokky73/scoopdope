import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async enroll(courseId: string, userId: string): Promise<Enrollment> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.status !== 'active') {
      throw new BadRequestException(
        `Cannot enroll in a course that is ${course.status}`,
      );
    }

    const existing = await this.enrollmentRepository.findOne({
      where: { courseId, userId },
    });

    if (existing) {
      throw new BadRequestException('Already enrolled in this course');
    }

    const enrollment = this.enrollmentRepository.create({ courseId, userId });
    return this.enrollmentRepository.save(enrollment);
  }
}
