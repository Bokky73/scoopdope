import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { Badge } from './badge.entity';
import { UserBadge } from './user-badge.entity';
import { User } from '../users/user.entity';
import { Progress } from '../progress/progress.entity';
import { Reply } from '../forums/reply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, UserBadge, User, Progress, Reply])],
  controllers: [BadgesController],
  providers: [BadgesService],
  exports: [BadgesService],
})
export class BadgesModule {}
