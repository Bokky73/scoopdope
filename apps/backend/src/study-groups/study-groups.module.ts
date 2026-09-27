import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyGroup } from './study-group.entity';
import { StudyGroupMember } from './study-group-member.entity';
import { StudyGroupsService } from './study-groups.service';
import { StudyGroupsController } from './study-groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StudyGroup, StudyGroupMember])],
  providers: [StudyGroupsService],
  controllers: [StudyGroupsController],
  exports: [StudyGroupsService],
})
export class StudyGroupsModule {}
