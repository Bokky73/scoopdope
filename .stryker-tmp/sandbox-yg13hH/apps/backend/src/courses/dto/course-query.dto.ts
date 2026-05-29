import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Trim, Sanitize } from 'class-sanitizer';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
export class CourseQueryDto {
  @ApiPropertyOptional({
    description: 'Full-text search on title and description'
  })
  @IsOptional()
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  search?: string;
  @ApiPropertyOptional({
    enum: ['beginner', 'intermediate', 'advanced'],
    description: 'Filter by course level'
  })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  level?: string;
  @ApiPropertyOptional({
    description: 'Filter by BCP-47 language code (e.g. "en", "es", "fr")'
  })
  @IsOptional()
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  language?: string;
  @ApiPropertyOptional({
    default: 1,
    description: 'Page number (1-based)'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
  @ApiPropertyOptional({
    default: 20,
    description: 'Number of results per page'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}