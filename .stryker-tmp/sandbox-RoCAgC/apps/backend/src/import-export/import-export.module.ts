// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { Course } from '../courses/course.entity';
import { CourseModule } from '../courses/course-module.entity';
import { Lesson } from '../courses/lesson.entity';
import { ImportJob } from './import-job.entity';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseModule, Lesson, ImportJob]), MulterModule.register({
    storage: undefined
  }) // use memory storage (buffer)
  ],
  providers: [ImportExportService],
  controllers: [ImportExportController]
})
export class ImportExportModule {}