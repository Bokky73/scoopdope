import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudySession } from './study-session.entity';
import { StudySessionsService } from './study-sessions.service';
import { StudySessionsController } from './study-sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudySession])],
  providers: [StudySessionsService],
  controllers: [StudySessionsController],
  exports: [StudySessionsService],
})
export class StudySessionsModule {}
