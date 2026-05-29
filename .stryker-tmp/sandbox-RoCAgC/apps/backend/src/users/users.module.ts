// @ts-nocheck
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController, AdminUsersController } from './users.controller';
import { StellarModule } from '../stellar/stellar.module';
@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => StellarModule)],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}