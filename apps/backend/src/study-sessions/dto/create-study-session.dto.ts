import { IsUUID, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudySessionDto {
  @ApiPropertyOptional({ description: 'Course ID being studied' })
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional({ description: 'Lesson ID being studied' })
  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @ApiProperty({
    description: 'Duration in seconds (capped at 3600 per session as anti-fraud measure)',
    minimum: 1,
    maximum: 3600,
  })
  @IsInt()
  @Min(1)
  @Max(3600) // Anti-fraud: no single session can exceed 1 hour
  durationSeconds: number;
}
