// @ts-nocheck
import { IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Trim } from 'class-sanitizer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class RecordProgressDto {
  @ApiProperty({
    description: 'Course ID'
  })
  @IsUUID()
  @Trim()
  courseId: string;
  @ApiPropertyOptional({
    description: 'Lesson ID (optional)'
  })
  @IsOptional()
  @IsUUID()
  @Trim()
  lessonId?: string;
  @ApiProperty({
    description: 'Progress percentage (0-100)',
    minimum: 0,
    maximum: 100
  })
  @IsInt()
  @Min(0)
  @Max(100)
  progressPct: number;
}