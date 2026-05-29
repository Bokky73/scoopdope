// @ts-nocheck
import { Module, forwardRef } from '@nestjs/common';
import { StellarService } from './stellar.service';
import { StellarController, CredentialsController } from './stellar.controller';
import { NetworkMonitorService } from './network-monitor.service';
import { StellarIndexerService } from './stellar-indexer.service';
import { CredentialsModule } from '../credentials/credentials.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [forwardRef(() => CredentialsModule), NotificationsModule, forwardRef(() => UsersModule)],
  providers: [StellarService, NetworkMonitorService, StellarIndexerService],
  controllers: [StellarController, CredentialsController],
  exports: [StellarService, NetworkMonitorService]
})
export class StellarModule {}