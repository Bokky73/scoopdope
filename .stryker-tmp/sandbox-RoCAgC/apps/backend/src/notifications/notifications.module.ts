// @ts-nocheck
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Notification } from './notification.entity';
import { PushSubscription } from './push-subscription.entity';
import { User } from '../users/user.entity';
import { NotificationsService } from './notifications.service';
import { PushNotificationsService } from './push-notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsEvents } from './notifications.events';
import { NotificationsGateway } from './notifications.gateway';
@Module({
  imports: [TypeOrmModule.forFeature([Notification, PushSubscription, User]), JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: (config: ConfigService) => ({
      secret: config.get<string>('jwt.secret')
    }),
    inject: [ConfigService]
  })],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushNotificationsService, NotificationsEvents, NotificationsGateway],
  exports: [NotificationsService, PushNotificationsService]
})
export class NotificationsModule {}