import { IsOptional, IsString, IsIn } from 'class-validator';
import { Trim, Sanitize } from 'class-sanitizer';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Transform } from 'class-transformer';

export class CourseQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Full-text search on title and description' })
  @IsOptional()
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  search?: string;

  @ApiPropertyOptional({
    enum: ['beginner', 'intermediate', 'advanced'],
    description: 'Filter by course level',
  })
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  level?: string;

  @ApiPropertyOptional({ description: 'Filter by BCP-47 language code (e.g. "en", "es", "fr")' })
  @IsOptional()
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  language?: string;

  @ApiPropertyOptional({
    description:
      'Filter by one or more tags (comma-separated or repeated param). Returns courses that contain ALL specified tags.',
    example: 'defi,nft',
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.flatMap((v: string) => v.split(','));
    if (typeof value === 'string') return value.split(',');
    return value;
  })
  @IsString({ each: true })
  tags?: string[];
}
