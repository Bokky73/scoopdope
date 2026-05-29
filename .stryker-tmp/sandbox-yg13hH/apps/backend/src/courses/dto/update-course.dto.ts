import { IsString, IsOptional, IsInt, IsIn, IsBoolean, Min, MinLength } from 'class-validator';
import { Trim, Sanitize } from 'class-sanitizer';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';
export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  title?: string;
  @IsOptional()
  @IsString()
  @MinLength(10)
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  description?: string;
  @IsOptional()
  @IsIn(['beginner', 'intermediate', 'advanced'])
  @Trim()
  level?: string;
  @IsOptional()
  @IsInt()
  @Min(0)
  durationHours?: number;
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}