// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../courses/course.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CurrencyConversionService } from './currency-conversion.service';
@Module({
  imports: [TypeOrmModule.forFeature([Course])],
  providers: [PaymentsService, CurrencyConversionService],
  controllers: [PaymentsController],
  exports: [PaymentsService, CurrencyConversionService]
})
export class PaymentsModule {}