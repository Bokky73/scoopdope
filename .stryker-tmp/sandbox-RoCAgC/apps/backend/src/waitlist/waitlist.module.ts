// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaitlistEntry } from './waitlist-entry.entity';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { Course } from '../courses/course.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { User } from '../users/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([WaitlistEntry, Course, Enrollment, User])],
  providers: [WaitlistService],
  controllers: [WaitlistController],
  exports: [WaitlistService]
})
export class WaitlistModule {}