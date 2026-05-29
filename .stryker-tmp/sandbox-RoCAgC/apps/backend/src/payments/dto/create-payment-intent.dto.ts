// @ts-nocheck
import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SUPPORTED_CURRENCIES, SupportedCurrency } from '../currency-conversion.service';
export class CreatePaymentIntentDto {
  @ApiProperty({
    example: 'uuid-of-course'
  })
  @IsUUID()
  courseId: string;
  @ApiProperty({
    enum: SUPPORTED_CURRENCIES,
    example: 'USD'
  })
  @IsEnum(SUPPORTED_CURRENCIES)
  currency: SupportedCurrency;
}