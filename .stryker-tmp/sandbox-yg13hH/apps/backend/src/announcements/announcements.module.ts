import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Announcement } from './announcement.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { NotificationsModule } from '../notifications/notifications.module';
@Module({
  imports: [TypeOrmModule.forFeature([Announcement, Enrollment]), NotificationsModule],
  providers: [AnnouncementsService],
  controllers: [AnnouncementsController]
})
export class AnnouncementsModule {}