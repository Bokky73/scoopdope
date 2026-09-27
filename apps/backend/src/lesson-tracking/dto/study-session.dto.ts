import { IsUUID, IsNotEmpty } from 'class-validator';

export class StartStudySessionDto {
  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @IsUUID()
  @IsNotEmpty()
  courseId: string;
}

export class EndStudySessionDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;
}

export class HeartbeatStudySessionDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;
}
