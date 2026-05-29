import { IsString, IsInt, IsOptional, Min, IsDateString } from 'class-validator';
import { Trim, Sanitize } from 'class-sanitizer';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';
export class CreateModuleDto {
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  title: string;
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
  @IsOptional()
  @IsDateString()
  releaseDate?: string;
}