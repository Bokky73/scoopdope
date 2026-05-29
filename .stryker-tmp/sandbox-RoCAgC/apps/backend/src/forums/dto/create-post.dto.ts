// @ts-nocheck
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sanitize, Trim } from 'class-sanitizer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';
export class CreatePostDto {
  @ApiProperty({
    description: 'Forum post title'
  })
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  title: string;
  @ApiProperty({
    description: 'Forum post content'
  })
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  content: string;
  @ApiPropertyOptional({
    description: 'Pin the post (instructors/admins only)',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}