/**
 * Shared notification-related types.
 * @module notification.types
 */

/** All notification event types in the platform */
export type NotificationType =
  | 'enrollment.created'
  | 'course.published'
  | 'quiz.passed'
  | 'quiz.failed'
  | 'certificate.issued'
  | 'payout.processed'
  | 'reminder.due'
  | 'forum.reply'
  | 'moderation.action';

/**
 * A notification record.
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

/**
 * Payload for creating a notification.
 */
export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}
