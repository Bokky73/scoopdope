import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim, Sanitize } from 'class-sanitizer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { StripHtmlSanitizer } from '../../common/sanitizers/strip-html.sanitizer';
export class CreateReviewDto {
  @ApiProperty({
    description: 'Course rating from 1 to 5',
    minimum: 1,
    maximum: 5
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
  @ApiPropertyOptional({
    description: 'Optional review comment'
  })
  @IsOptional()
  @IsString()
  @Trim()
  @Sanitize(StripHtmlSanitizer)
  comment?: string;
}