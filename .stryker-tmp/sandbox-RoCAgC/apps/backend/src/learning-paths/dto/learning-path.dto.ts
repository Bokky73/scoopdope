// @ts-nocheck
import { IsString, IsOptional, IsBoolean, IsArray, MinLength, IsUUID } from 'class-validator';
export class CreateLearningPathDto {
  @IsString()
  @MinLength(3)
  title: string;
  @IsString()
  @MinLength(10)
  description: string;
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

  /** Ordered list of course IDs defining the curriculum sequence */
  @IsOptional()
  @IsArray()
  @IsUUID('4', {
    each: true
  })
  courseOrder?: string[];
}
export class UpdateLearningPathDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;
  @IsOptional()
  @IsArray()
  @IsUUID('4', {
    each: true
  })
  courseIds?: string[];
  @IsOptional()
  @IsArray()
  @IsUUID('4', {
    each: true
  })
  courseOrder?: string[];
}