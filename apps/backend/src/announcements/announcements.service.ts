import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './announcement.entity';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { AnnouncementQueryDto, AnnouncementSortBy } from './dto/announcement-query.dto';

interface InstructorDto {
  id: string;
  email: string;
  username: string;
  avatar: string | null;
}

type AnnouncementWithInstructor = Announcement & {
  instructor?: InstructorDto;
};

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement) private repo: Repository<Announcement>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Enrollment) private enrollmentRepo: Repository<Enrollment>,
    private notifications: NotificationsService
  ) {}

  /**
   * Create an announcement for a course (instructor only)
   */
  async create(
    instructorId: string,
    courseId: string,
    dto: CreateAnnouncementDto
  ): Promise<AnnouncementWithInstructor> {
    // Verify course exists
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Verify user is the course instructor or admin
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('Only course instructors can post announcements');
    }

    const announcement = this.repo.create({
      courseId,
      instructorId,
      title: dto.title,
      content: dto.content,
    });

    const saved = await this.repo.save(announcement);

    // Fetch instructor details for response
    const instructor = await this.userRepo.findOne({
      where: { id: instructorId },
      select: ['id', 'email', 'username', 'avatar'],
    });

    const result: AnnouncementWithInstructor = {
      ...saved,
      instructor,
    };

    // Notify all enrolled students asynchronously
    this.notifyEnrolledStudents(courseId, dto.title);

    return result;
  }

  /**
   * Get all announcements for a course with pagination and sorting
   */
  async findByCourse(
    courseId: string,
    query: AnnouncementQueryDto
  ): Promise<{
    data: AnnouncementWithInstructor[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Verify course exists
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Determine sort order
    const order = query.sortBy === AnnouncementSortBy.OLDEST ? 'ASC' : 'DESC';

    const [announcements, total] = await this.repo.findAndCount({
      where: { courseId },
      relations: ['instructor'],
      select: {
        id: true,
        courseId: true,
        instructorId: true,
        title: true,
        content: true,
        createdAt: true,
        instructor: {
          id: true,
          email: true,
          username: true,
          avatar: true,
        },
      },
      order: { createdAt: order },
      take: limit,
      skip,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: announcements,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get latest announcements for a course (limited to 5)
   */
  async findLatest(courseId: string, limit: number = 5): Promise<AnnouncementWithInstructor[]> {
    // Verify course exists
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.repo.find({
      where: { courseId },
      relations: ['instructor'],
      select: {
        id: true,
        courseId: true,
        instructorId: true,
        title: true,
        content: true,
        createdAt: true,
        instructor: {
          id: true,
          email: true,
          username: true,
          avatar: true,
        },
      },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get a single announcement by ID
   */
  async findOne(id: string): Promise<AnnouncementWithInstructor> {
    const announcement = await this.repo.findOne({
      where: { id },
      relations: ['instructor'],
      select: {
        id: true,
        courseId: true,
        instructorId: true,
        title: true,
        content: true,
        createdAt: true,
        instructor: {
          id: true,
          email: true,
          username: true,
          avatar: true,
        },
      },
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  /**
   * Delete an announcement (instructor only)
   */
  async remove(id: string, instructorId: string): Promise<void> {
    const announcement = await this.repo.findOne({ where: { id } });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.instructorId !== instructorId) {
      throw new ForbiddenException('You can only delete your own announcements');
    }

    await this.repo.remove(announcement);
  }

  /**
   * Notify all enrolled students about a new announcement
   * Runs asynchronously without blocking the main request
   */
  private async notifyEnrolledStudents(courseId: string, announcementTitle: string): Promise<void> {
    try {
      const enrollments = await this.enrollmentRepo.find({
        where: { courseId },
        select: { userId: true },
      });

      if (enrollments.length === 0) {
        return;
      }

      await Promise.all(
        enrollments.map((e) =>
          this.notifications
            .create(
              e.userId,
              NotificationType.ANNOUNCEMENT,
              `New announcement in your course: "${announcementTitle}"`
            )
            .catch((err) => console.error('Failed to notify student:', err))
        )
      );
    } catch (err) {
      console.error('Failed to notify enrolled students:', err);
    }
  }
}
