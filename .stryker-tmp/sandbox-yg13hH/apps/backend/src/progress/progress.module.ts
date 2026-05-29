import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './progress.entity';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { StellarModule } from '../stellar/stellar.module';
import { CredentialsModule } from '../credentials/credentials.module';
import { UsersModule } from '../users/users.module';
import { StreaksModule } from '../streaks/streaks.module';
import { BundlesModule } from '../bundles/bundles.module';
@Module({
  imports: [TypeOrmModule.forFeature([Progress]), StellarModule, CredentialsModule, UsersModule, StreaksModule, BundlesModule],
  providers: [ProgressService],
  controllers: [ProgressController]
})
export class ProgressModule {}