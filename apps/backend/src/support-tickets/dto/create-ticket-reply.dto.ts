import { ApiProperty } from '@nestjs/swagger';
import { Sanitize, Trim } from 'class-sanitizer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';

export class CreateTicketReplyDto {
  @ApiProperty({ description: 'Reply content', maxLength: 10000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  content: string;
}
