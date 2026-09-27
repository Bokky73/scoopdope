import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { PushSubscription } from './push-subscription.entity';

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(
    private configService: ConfigService,
    @InjectRepository(PushSubscription)
    private pushSubscriptionRepo: Repository<PushSubscription>
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>('VAPID_SUBJECT', 'mailto:admin@scoopdope.com');

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
    } else {
      this.logger.warn('VAPID keys are not configured. Push notifications will not work.');
    }
  }

  async subscribe(userId: string, subscription: any) {
    let sub = await this.pushSubscriptionRepo.findOne({
      where: { userId, endpoint: subscription.endpoint },
    });

    if (!sub) {
      sub = this.pushSubscriptionRepo.create({
        userId,
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: subscription.keys,
      });
    } else {
      sub.expirationTime = subscription.expirationTime;
      sub.keys = subscription.keys;
    }

    return this.pushSubscriptionRepo.save(sub);
  }

  async unsubscribe(userId: string, endpoint: string) {
    return this.pushSubscriptionRepo.delete({ userId, endpoint });
  }

  async sendNotification(userId: string, payload: { title: string; body: string; icon?: string; url?: string }) {
    const subscriptions = await this.pushSubscriptionRepo.find({ where: { userId } });

    const notifications = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify(payload)
        );
      } catch (error) {
        const statusCode = error instanceof Error && 'statusCode' in error ? Number((error as any).statusCode) : undefined;
        if (statusCode === 410 || statusCode === 404) {
          // Subscription has expired or is no longer valid
          this.logger.log(`Removing invalid subscription for user ${userId}: ${sub.endpoint}`);
          await this.pushSubscriptionRepo.remove(sub);
        } else {
          this.logger.error(`Error sending push notification to user ${userId}:`, error instanceof Error ? error : String(error));
        }
      }
    });

    return Promise.all(notifications);
  }
}
