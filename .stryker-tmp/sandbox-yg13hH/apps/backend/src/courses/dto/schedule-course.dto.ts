import { IsDateString, IsOptional, IsTimeZone } from 'class-validator';
export class ScheduleCourseDto {
  /** ISO 8601 datetime string for when the course should go live */
  @IsDateString()
  scheduledAt: string;

  /**
   * IANA timezone name (e.g. "America/New_York").
   * When provided, scheduledAt is interpreted in this timezone.
   * Defaults to UTC.
   */
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}