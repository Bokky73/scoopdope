import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyGroup } from './study-group.entity';
import { StudyGroupMember } from './study-group-member.entity';

export interface CreateStudyGroupDto {
  name: string;
  description?: string;
}

@Injectable()
export class StudyGroupsService {
  constructor(
    @InjectRepository(StudyGroup) private groupRepo: Repository<StudyGroup>,
    @InjectRepository(StudyGroupMember) private memberRepo: Repository<StudyGroupMember>,
  ) {}

  /**
   * List all study groups for a given course, including their member count.
   */
  async findByCourse(courseId: string): Promise<StudyGroup[]> {
    const groups = await this.groupRepo
      .createQueryBuilder('g')
      .leftJoin('g.members', 'm')
      .addSelect('COUNT(m.id)', 'memberCount')
      .where('g.courseId = :courseId', { courseId })
      .groupBy('g.id')
      .orderBy('g.createdAt', 'DESC')
      .getRawAndEntities()
      .then(({ raw, entities }) => {
        return entities.map((group, i) => ({
          ...group,
          memberCount: Number(raw[i]?.memberCount ?? 0),
        }));
      });

    return groups;
  }

  /**
   * Get a single study group with its member list.
   */
  async findOne(id: string): Promise<StudyGroup & { memberCount: number }> {
    const group = await this.groupRepo.findOne({
      where: { id },
      relations: ['members'],
    });
    if (!group) throw new NotFoundException(`Study group ${id} not found`);
    return { ...group, memberCount: group.members?.length ?? 0 };
  }

  /**
   * Create a study group. The creator is automatically added as the first member.
   */
  async create(
    courseId: string,
    creatorId: string,
    dto: CreateStudyGroupDto,
  ): Promise<StudyGroup> {
    const group = this.groupRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      courseId,
      creatorId,
    });
    const saved = await this.groupRepo.save(group);

    // Auto-join creator
    const membership = this.memberRepo.create({ studyGroupId: saved.id, userId: creatorId });
    await this.memberRepo.save(membership);

    return { ...saved, memberCount: 1 };
  }

  /**
   * Join a study group. Throws ConflictException if already a member.
   */
  async join(groupId: string, userId: string): Promise<StudyGroupMember> {
    await this.findOne(groupId); // ensure group exists

    const existing = await this.memberRepo.findOne({
      where: { studyGroupId: groupId, userId },
    });
    if (existing) throw new ConflictException('Already a member of this study group');

    const membership = this.memberRepo.create({ studyGroupId: groupId, userId });
    return this.memberRepo.save(membership);
  }

  /**
   * Leave a study group.
   */
  async leave(groupId: string, userId: string): Promise<void> {
    const membership = await this.memberRepo.findOne({
      where: { studyGroupId: groupId, userId },
    });
    if (!membership) throw new NotFoundException('You are not a member of this study group');
    await this.memberRepo.remove(membership);
  }

  /**
   * Delete a study group. Only the creator can delete; group must be empty (creator aside).
   */
  async delete(groupId: string, requesterId: string): Promise<void> {
    const group = await this.findOne(groupId);
    if (group.creatorId !== requesterId) {
      throw new ForbiddenException('Only the creator can delete a study group');
    }

    // "Empty" means at most the creator themselves
    const otherMembers = (group.members ?? []).filter((m) => m.userId !== requesterId);
    if (otherMembers.length > 0) {
      throw new BadRequestException(
        'Cannot delete a study group that still has members. Remove all members first.',
      );
    }

    await this.groupRepo.remove(group as StudyGroup);
  }

  /**
   * Get all members of a study group.
   */
  async getMembers(groupId: string): Promise<StudyGroupMember[]> {
    await this.findOne(groupId);
    return this.memberRepo.find({
      where: { studyGroupId: groupId },
      order: { joinedAt: 'ASC' },
    });
  }
}
