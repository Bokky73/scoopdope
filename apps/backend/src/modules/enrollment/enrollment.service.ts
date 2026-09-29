import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Course } from '../course/entities/course.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const course = await this.courseRepository.findOne({
      where: { id: createEnrollmentDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.expiryDate && new Date(course.expiryDate) < new Date()) {
      throw new BadRequestException('Course has expired and is no longer accepting enrollments');
    }

    const enrollment = this.enrollmentRepository.create(createEnrollmentDto);
    return this.enrollmentRepository.save(enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find();
  }

  async findByUser(userId: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({ where: { userId } });
  }

  async findOne(id: string): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id } });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }
    return enrollment;
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.enrollmentRepository.remove(enrollment);
  }
}
