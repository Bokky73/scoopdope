import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';

@Injectable()
export class CoursesRepository {
  constructor(
    @InjectRepository(Course)
    private readonly repository: Repository<Course>,
  ) {}

  async findAll(search?: string): Promise<Course[]> {
    const query = this.repository.createQueryBuilder('course');

    if (search) {
      query.where('LOWER(course.title) LIKE LOWER(:search)', {
        search: `%${search}%`,
      });
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Course | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(course: Partial<Course>): Promise<Course> {
    const entity = this.repository.create(course);
    return this.repository.save(entity);
  }

  async update(id: string, course: Partial<Course>): Promise<Course | null> {
    await this.repository.update(id, course);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
