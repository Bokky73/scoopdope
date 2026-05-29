import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseAccessControl } from './course-access-control.entity';
import { AccessLog } from './access-log.entity';
import { AccessControlService } from './access-control.service';
import { AccessControlController } from './access-control.controller';
@Module({
  imports: [TypeOrmModule.forFeature([CourseAccessControl, AccessLog])],
  providers: [AccessControlService],
  controllers: [AccessControlController],
  exports: [AccessControlService]
})
export class AccessControlModule {}