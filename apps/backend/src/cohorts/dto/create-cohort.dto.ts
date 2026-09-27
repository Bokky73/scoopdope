import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateCohortDto {
  @ApiProperty({ description: 'Course ID this cohort belongs to' })
  @IsString()
  @IsUUID()
  courseId: string;

  @ApiProperty({ description: 'Cohort name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Optional cohort description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Cohort start date (ISO string)' })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({ description: 'Cohort end date (ISO string)' })
  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @ApiPropertyOptional({ description: 'Maximum number of members (0 = unlimited)', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxMembers?: number;
}
