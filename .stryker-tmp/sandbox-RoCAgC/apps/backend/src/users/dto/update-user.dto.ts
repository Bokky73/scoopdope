// @ts-nocheck
import { IsString, IsOptional, IsUrl, MaxLength, MinLength } from 'class-validator';
import { Trim, Sanitize } from 'class-sanitizer';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Trim()
  username?: string;
  @IsOptional()
  @IsUrl()
  avatar?: string;
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  bio?: string;
}