import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorApplication } from './instructor-application.entity';
import { InstructorApplicationsService } from './instructor-applications.service';
import { InstructorApplicationsController } from './instructor-applications.controller';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([InstructorApplication]), UsersModule],
  controllers: [InstructorApplicationsController],
  providers: [InstructorApplicationsService],
  exports: [InstructorApplicationsService]
})
export class InstructorApplicationsModule {}