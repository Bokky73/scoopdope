// @ts-nocheck
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsUrl, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateInstructorApplicationDto {
  @ApiProperty({
    description: 'Short professional bio'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  bio: string;
  @ApiProperty({
    description: 'Areas of expertise'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  expertise: string;
  @ApiProperty({
    description: 'Why you want to teach on scoopdope'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(50)
  motivation: string;
  @ApiPropertyOptional({
    description: 'LinkedIn profile URL'
  })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;
  @ApiPropertyOptional({
    description: 'Portfolio or personal website URL'
  })
  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;
  @ApiProperty({
    description: 'Must be true — confirms agreement acceptance'
  })
  @IsBoolean()
  agreementAccepted: boolean;
}
export class ReviewApplicationDto {
  @ApiProperty({
    enum: ['approved', 'rejected']
  })
  @IsString()
  @IsNotEmpty()
  status: 'approved' | 'rejected';
  @ApiPropertyOptional({
    description: 'Optional note to the applicant'
  })
  @IsOptional()
  @IsString()
  adminNote?: string;
}