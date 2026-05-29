// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycCustomer } from './kyc-customer.entity';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
@Module({
  imports: [TypeOrmModule.forFeature([KycCustomer])],
  providers: [KycService],
  controllers: [KycController],
  exports: [KycService]
})
export class KycModule {}