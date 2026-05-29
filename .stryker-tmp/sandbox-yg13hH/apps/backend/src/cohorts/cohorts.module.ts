import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cohort } from './cohort.entity';
import { CohortMember } from './cohort-member.entity';
import { CohortsService } from './cohorts.service';
import { CohortsController } from './cohorts.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Cohort, CohortMember])],
  providers: [CohortsService],
  controllers: [CohortsController],
  exports: [CohortsService]
})
export class CohortsModule {}