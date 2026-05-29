import { IsString, IsInt, IsOptional, IsUrl, Min } from 'class-validator';
import { Trim, Sanitize } from 'class-sanitizer';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';
export class CreateLessonDto {
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  title: string;
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  content: string;
  @IsOptional()
  @IsUrl()
  @Trim()
  videoUrl?: string;
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;
}