// @ts-nocheck
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sanitize, Trim } from 'class-sanitizer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';
export class CreateReplyDto {
  @ApiProperty({
    description: 'Reply content'
  })
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  content: string;
  @ApiPropertyOptional({
    description: 'Mark the reply as the answer (instructors/admins only)',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  isAnswer?: boolean;
}