import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
  ) {}

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    this.validateVideoUrl(createLessonDto.videoUrl);
    const lesson = this.lessonsRepository.create(createLessonDto);
    return this.lessonsRepository.save(lesson);
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    if (updateLessonDto.videoUrl !== undefined) {
      this.validateVideoUrl(updateLessonDto.videoUrl);
    }
    await this.lessonsRepository.update(id, updateLessonDto);
    return this.findOne(id);
  }

  private validateVideoUrl(videoUrl?: string): void {
    if (videoUrl === undefined || videoUrl === null || videoUrl === '') {
      return;
    }
    let parsed: URL;
    try {
      parsed = new URL(videoUrl);
    } catch {
      throw new BadRequestException('videoUrl must be a valid URL');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestException('videoUrl must be a valid URL');
    }
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonsRepository.find();
  }

  async findOne(id: string): Promise<Lesson> {
    return this.lessonsRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.lessonsRepository.delete(id);
  }
}
