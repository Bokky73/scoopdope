import { ApiProperty } from '@nestjs/swagger';
import { Sanitize, Trim } from 'class-sanitizer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';

export class CreateTicketDto {
  @ApiProperty({ description: 'Ticket subject', maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  subject: string;

  @ApiProperty({ description: 'Detailed description of the issue', maxLength: 10000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  description: string;
}
