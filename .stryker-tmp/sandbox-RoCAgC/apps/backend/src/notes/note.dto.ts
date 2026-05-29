// @ts-nocheck
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
export class CreateNoteDto {
  @IsString()
  content: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  timestamp?: number;
}
export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  content?: string;
  @IsOptional()
  @IsNumber()
  @Min(0)
  timestamp?: number;
}