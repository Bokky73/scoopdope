import { Controller, Post, Body, Param, Get, NotFoundException, BadRequestException } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CoursesService } from '../../courses/courses.service';

@Controller('enrollment')
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly coursesService: CoursesService,
  ) {}

  @Post(':courseId')
  async enroll(@Param('courseId') courseId: string, @Body() body: any) {
    const course = await this.coursesService.findById(courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.expiresAt && new Date(course.expiresAt).getTime() < Date.now()) {
      throw new BadRequestException('Course has expired and is no longer accepting enrollments');
    }

    return this.enrollmentService.enroll(courseId, body);
  }

  @Get(':courseId')
  async list(@Param('courseId') courseId: string) {
    return this.enrollmentService.findByCourse(courseId);
  }
}
