import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';
import { PushSubscription } from './push-subscription.entity';
import { NotificationsGateway } from './notifications.gateway';
import { User } from '../users/user.entity';
import { PushNotificationsService } from './push-notifications.service';

const NOTIFICATION_CENTER_LIMIT = 20;

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private repo: Repository<Notification>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(forwardRef(() => NotificationsGateway))
    private gateway: NotificationsGateway,
    private pushNotificationsService: PushNotificationsService,
  ) {}

  async updatePreferences(userId: string, preferences: any) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences,
    };

    return this.userRepo.save(user);
  }

  async create(
    userId: string,
    type: NotificationType,
    message: string,
    title?: string,
  ): Promise<Notification> {
    const notification = this.repo.create({
      userId,
      type,
      message,
      title: title ?? null,
    });
    const saved = await this.repo.save(notification);
    this.gateway.emitToUser(userId, 'notification', saved);

    // Send push notification if enabled
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user && user.notificationPreferences?.pushEnabled) {
      let shouldSendPush = false;
      const prefs = user.notificationPreferences;

      switch (type) {
        case NotificationType.ENROLLMENT:
        case NotificationType.COMPLETION:
        case NotificationType.COURSE_PUBLISHED:
        case NotificationType.ANNOUNCEMENT:
        case NotificationType.UPDATE:
          shouldSendPush = prefs.courseUpdates;
          break;
        case NotificationType.CREDENTIAL_ISSUED:
        case NotificationType.CERTIFICATE:
          shouldSendPush = prefs.tokenRewards;
          break;
        case NotificationType.QA_QUESTION:
        case NotificationType.QA_ANSWER:
          shouldSendPush = true;
          break;
      }

      if (shouldSendPush) {
        await this.pushNotificationsService.sendNotification(userId, {
          title: title ?? 'ScoopDope',
          body: message,
          icon: '/icons/icon-192x192.png',
          url: '/notifications',
        });
      }
    }

    return saved;
  }

  /**
   * Create a system-wide notification for all users or a specific user.
   * Intended to be called by admins via the POST /notifications endpoint.
   */
  async createSystemNotification(
    adminUserId: string,
    payload: {
      userId?: string;
      type: NotificationType;
      title: string;
      message: string;
    },
  ): Promise<Notification | Notification[]> {
    // Validate the requesting user is an admin
    const admin = await this.userRepo.findOne({ where: { id: adminUserId } });
    if (!admin || admin.role !== 'admin') {
      throw new ForbiddenException('Only admins can create system notifications');
    }

    if (payload.userId) {
      // Targeted notification
      return this.create(payload.userId, payload.type, payload.message, payload.title);
    }

    // Broadcast to all non-deleted users in batches
    const batchSize = 200;
    let offset = 0;
    const results: Notification[] = [];

    while (true) {
      const users = await this.userRepo.find({
        where: { isBanned: false },
        select: ['id'],
        skip: offset,
        take: batchSize,
      });

      if (users.length === 0) break;

      const notifications = this.repo.create(
        users.map((u) => ({
          userId: u.id,
          type: payload.type,
          title: payload.title,
          message: payload.message,
        })),
      );
      const saved = await this.repo.save(notifications);
      results.push(...saved);

      // Emit via WebSocket to online users
      for (const n of saved) {
        this.gateway.emitToUser(n.userId, 'notification', n);
      }

      offset += batchSize;
      if (users.length < batchSize) break;
    }

    return results;
  }

  /**
   * Returns paginated notifications for a user.
   * Defaults to the last 20 (notification center view); supports full history via page.
   */
  async findByUser(
    userId: string,
    page = 1,
    limit = NOTIFICATION_CENTER_LIMIT,
  ): Promise<PaginatedNotifications> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);
    const offset = (safePage - 1) * safeLimit;

    const [data, total] = await this.repo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: safeLimit,
    });

    const unreadCount = await this.repo.count({ where: { userId, isRead: false } });

    return { data, total, page: safePage, limit: safeLimit, unreadCount };
  }

  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.repo.count({ where: { userId, isRead: false } });
    return { count };
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.repo.findOne({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    if (notification.userId !== userId) throw new ForbiddenException('Access denied');

    notification.isRead = true;
    return this.repo.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }

  // ── Event-driven helpers ─────────────────────────────────────────────────

  async onEnrollmentCreated(userId: string, courseName: string) {
    return this.create(
      userId,
      NotificationType.ENROLLMENT,
      `You have been enrolled in ${courseName}`,
      'Enrollment Confirmed',
    );
  }

  async onCredentialIssued(userId: string, courseName: string) {
    return this.create(
      userId,
      NotificationType.CREDENTIAL_ISSUED,
      `Your credential for ${courseName} has been issued!`,
      'Credential Issued',
    );
  }

  async onProgressCompleted(userId: string, courseName: string) {
    return this.create(
      userId,
      NotificationType.COMPLETION,
      `Congratulations! You have completed ${courseName}`,
      'Course Completed',
    );
  }
}
