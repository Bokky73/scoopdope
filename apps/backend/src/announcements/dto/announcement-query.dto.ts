import { IsOptional, IsPositive, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum AnnouncementSortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class AnnouncementQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: AnnouncementSortBy,
    example: AnnouncementSortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(AnnouncementSortBy)
  sortBy?: AnnouncementSortBy = AnnouncementSortBy.NEWEST;
}
