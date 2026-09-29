import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  /**
   * Timestamp for the notification. Must be an ISO 8601 string with
   * timezone information (e.g. "2024-01-15T10:30:00.000Z"). Stored as UTC.
   */
  @IsDateString()
  @IsOptional()
  timestamp?: string;
}
