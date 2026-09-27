import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleCompletion } from './module-completion.entity';
import { ModuleCompletionService } from './module-completion.service';
import { ModuleCompletionController } from './module-completion.controller';
import { Progress } from './progress.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { CourseModule } from '../courses/course-module.entity';
import { Lesson } from '../courses/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ModuleCompletion,
      Progress,
      Enrollment,
      CourseModule,
      Lesson,
    ]),
  ],
  providers: [ModuleCompletionService],
  controllers: [ModuleCompletionController],
  exports: [ModuleCompletionService],
})
export class ModuleCompletionModule {}
