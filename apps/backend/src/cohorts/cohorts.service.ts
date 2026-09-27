import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cohort } from './cohort.entity';
import { CohortMember } from './cohort-member.entity';
import { CreateCohortDto } from './dto/create-cohort.dto';

@Injectable()
export class CohortsService {
  constructor(
    @InjectRepository(Cohort) private cohortRepo: Repository<Cohort>,
    @InjectRepository(CohortMember) private memberRepo: Repository<CohortMember>,
  ) {}

  async createCohort(instructorId: string, data: CreateCohortDto) {
    const cohort = this.cohortRepo.create({
      courseId: data.courseId,
      instructorId,
      name: data.name,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      maxMembers: data.maxMembers ?? 0,
    });
    return this.cohortRepo.save(cohort);
  }

  async findAll() {
    return this.cohortRepo.find({
      relations: ['members', 'course', 'instructor'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCohort(id: string) {
    const cohort = await this.cohortRepo.findOne({
      where: { id },
      relations: ['members', 'members.user', 'course', 'instructor'],
    });
    if (!cohort) throw new NotFoundException('Cohort not found');
    return cohort;
  }

  async getStudentCohorts(userId: string) {
    const memberships = await this.memberRepo.find({
      where: { userId },
      relations: ['cohort', 'cohort.course', 'cohort.instructor'],
    });
    return memberships.map((m) => ({
      ...m.cohort,
      progressPercentage: m.progressPercentage,
      enrolledAt: m.enrolledAt,
    }));
  }

  async addMember(cohortId: string, userId: string) {
    const cohort = await this.cohortRepo.findOne({ where: { id: cohortId } });
    if (!cohort) {
      throw new Error('Cohort not found');
    }

    if (cohort.maxMembers > 0) {
      const memberCount = await this.memberRepo.count({ where: { cohortId } });
      if (memberCount >= cohort.maxMembers) {
        throw new BadRequestException('Cohort is full');
      }
    }

    // Prevent duplicate membership
    const existing = await this.memberRepo.findOne({ where: { cohortId, userId } });
    if (existing) return existing;

    const member = this.memberRepo.create({ cohortId, userId });
    return this.memberRepo.save(member);
  }

  async removeMember(cohortId: string, userId: string) {
    const member = await this.memberRepo.findOne({ where: { cohortId, userId } });
    if (!member) throw new NotFoundException('Member not found in cohort');
    return this.memberRepo.remove(member);
  }

  async updateMemberProgress(cohortId: string, userId: string, progressPercentage: number) {
    return this.memberRepo.update({ cohortId, userId }, { progressPercentage });
  }

  async getCohortProgress(cohortId: string) {
    const members = await this.memberRepo.find({
      where: { cohortId },
      relations: ['user'],
    });

    const avgProgress =
      members.length > 0
        ? members.reduce((sum, m) => sum + m.progressPercentage, 0) / members.length
        : 0;

    return {
      totalMembers: members.length,
      averageProgress: avgProgress,
      members,
    };
  }

  async getCohortsByCourse(courseId: string) {
    return this.cohortRepo.find({
      where: { courseId },
      relations: ['members'],
      order: { createdAt: 'DESC' },
    });
  }

  async exportAnalyticsAsCsv(cohortId: string): Promise<string> {
    const cohort = await this.cohortRepo.findOne({
      where: { id: cohortId },
      relations: ['members', 'members.user'],
    });
    if (!cohort) throw new NotFoundException('Cohort not found');

    const header = 'userId,username,email,progressPercentage,enrolledAt\n';
    const rows = cohort.members.map((m) => {
      const user = m.user as { username?: string; email?: string } | null;
      return [
        m.userId,
        user?.username ?? '',
        user?.email ?? '',
        m.progressPercentage.toFixed(2),
        new Date(m.enrolledAt).toISOString(),
      ].join(',');
    });
    return header + rows.join('\n');
  }
}
