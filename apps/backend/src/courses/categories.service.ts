import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

export interface CreateCategoryDto {
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  iconName?: string;
  description?: string;
}

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  findAll(): Promise<Category[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Category> {
    const cat = await this.repo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException(`Category ${id} not found`);
    return cat;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.repo.findOne({ where: [{ name: dto.name }, { slug: dto.slug }] });
    if (existing) throw new ConflictException('Category name or slug already exists');
    const category = this.repo.create({
      name: dto.name,
      slug: dto.slug,
      iconName: dto.iconName ?? null,
      description: dto.description ?? null,
    });
    return this.repo.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.iconName !== undefined && { iconName: dto.iconName }),
      ...(dto.description !== undefined && { description: dto.description }),
    });
    return this.repo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.repo.remove(category);
  }
}
