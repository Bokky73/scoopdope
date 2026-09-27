import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AddMemberDto {
  @ApiProperty({ description: 'User ID to add to the cohort' })
  @IsString()
  @IsUUID()
  userId: string;
}
