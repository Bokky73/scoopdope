import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseInstructor } from './course-instructor.entity';
import { Course } from './course.entity';
import { User } from '../users/user.entity';

@Injectable()
export class InstructorAssignmentService {
  constructor(
    @InjectRepository(CourseInstructor)
    private readonly assignmentRepo: Repository<CourseInstructor>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Assign an instructor to a course.
   *
   * @throws NotFoundException  – course or instructor not found
   * @throws BadRequestException – target user does not have the 'instructor' role
   * @throws ConflictException  – instructor already assigned to this course
   */
  async assign(courseId: string, instructorId: string): Promise<CourseInstructor> {
    // Validate course exists
    const course = await this.courseRepo.findOne({ where: { id: courseId, isDeleted: false } });
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    // Validate instructor user exists and has instructor role
    const user = await this.userRepo.findOne({ where: { id: instructorId } });
    if (!user) {
      throw new NotFoundException(`User ${instructorId} not found`);
    }
    if (user.role !== 'instructor') {
      throw new BadRequestException(
        `User ${instructorId} does not have the 'instructor' role`,
      );
    }

    // Check for duplicate assignment
    const existing = await this.assignmentRepo.findOne({
      where: { courseId, instructorId },
    });
    if (existing) {
      throw new ConflictException(
        `Instructor ${instructorId} is already assigned to course ${courseId}`,
      );
    }

    const assignment = this.assignmentRepo.create({ courseId, instructorId });
    return this.assignmentRepo.save(assignment);
  }

  /**
   * Remove an instructor from a course.
   *
   * @throws NotFoundException – assignment not found
   */
  async unassign(courseId: string, instructorId: string): Promise<void> {
    const assignment = await this.assignmentRepo.findOne({
      where: { courseId, instructorId },
    });
    if (!assignment) {
      throw new NotFoundException(
        `Instructor ${instructorId} is not assigned to course ${courseId}`,
      );
    }
    await this.assignmentRepo.remove(assignment);
  }

  /**
   * List all instructors assigned to a course.
   *
   * @throws NotFoundException – course not found
   */
  async listByCourse(courseId: string): Promise<CourseInstructor[]> {
    const course = await this.courseRepo.findOne({ where: { id: courseId, isDeleted: false } });
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    return this.assignmentRepo.find({
      where: { courseId },
      relations: ['instructor'],
      order: { assignedAt: 'ASC' },
    });
  }

  /**
   * List all courses assigned to a specific instructor.
   *
   * @throws NotFoundException – instructor not found
   */
  async listByInstructor(instructorId: string): Promise<CourseInstructor[]> {
    const user = await this.userRepo.findOne({ where: { id: instructorId } });
    if (!user) {
      throw new NotFoundException(`Instructor ${instructorId} not found`);
    }

    return this.assignmentRepo.find({
      where: { instructorId },
      relations: ['course'],
      order: { assignedAt: 'DESC' },
    });
  }
}
