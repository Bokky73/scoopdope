// @ts-nocheck
import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, Min, MinLength, IsUUID } from 'class-validator';
export class CreateBundleDto {
  @IsString()
  @MinLength(3)
  title: string;
  @IsString()
  @MinLength(10)
  description: string;
  @IsNumber()
  @Min(0)
  price: number;
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPrice?: number;
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
  @IsArray()
  @IsUUID('4', {
    each: true
  })
  courseIds: string[];
}