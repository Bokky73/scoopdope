// @ts-nocheck
import { IsString, IsOptional, IsDateString, IsInt, IsUrl, Min } from 'class-validator';
export class CreateLiveSessionDto {
  @IsString()
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsDateString()
  scheduledAt: string;
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;
  @IsOptional()
  @IsUrl()
  meetingUrl?: string;
}
export class UpdateLiveSessionDto {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;
  @IsOptional()
  @IsUrl()
  meetingUrl?: string;
}