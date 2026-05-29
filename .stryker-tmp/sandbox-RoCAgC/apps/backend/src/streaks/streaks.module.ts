// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { StreaksService } from './streaks.service';
import { StellarModule } from '../stellar/stellar.module';
import { StreaksController } from './streaks.controller';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), StellarModule, UsersModule],
  providers: [StreaksService],
  controllers: [StreaksController],
  exports: [StreaksService]
})
export class StreaksModule {}