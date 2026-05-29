import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveSession } from './live-session.entity';
import { LiveSessionsService } from './live-sessions.service';
import { LiveSessionsController } from './live-sessions.controller';
import { CohortMember } from '../cohorts/cohort-member.entity';
import { User } from '../users/user.entity';
import { EmailModule } from '../email/email.module';
@Module({
  imports: [TypeOrmModule.forFeature([LiveSession, CohortMember, User]), EmailModule],
  providers: [LiveSessionsService],
  controllers: [LiveSessionsController]
})
export class LiveSessionsModule {}