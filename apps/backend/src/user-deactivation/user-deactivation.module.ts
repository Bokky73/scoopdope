import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UserDeactivationService } from './user-deactivation.service';
import { AuditModule } from '../audit/audit.module';
import { MailModule } from '../mail/mail.module';
import { DistributedLockModule } from '../common/distributed-lock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuditModule,
    MailModule,
    DistributedLockModule,
  ],
  providers: [UserDeactivationService],
  exports: [UserDeactivationService],
})
export class UserDeactivationModule {}
