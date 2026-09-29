import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  create(@Body() createLessonDto: CreateLessonDto) {
    const { videoUrl } = createLessonDto;

    if (videoUrl !== undefined && videoUrl !== null && videoUrl !== '') {
      if (typeof videoUrl !== 'string' || !this.isValidUrl(videoUrl)) {
        throw new BadRequestException('videoUrl must be a valid URL');
      }
    }

    return this.lessonsService.create(createLessonDto);
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
