import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Badge, BadgeCriteriaType } from './badge.entity';
import { UserBadge } from './user-badge.entity';
import { User } from '../users/user.entity';
import { Progress } from '../progress/progress.entity';
import { Reply } from '../forums/reply.entity';
import { Post } from '../forums/post.entity';
import { BADGE_SEEDS } from './badge-seed';

export interface BadgeProgress {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  tier: Badge['tier'];
  threshold: number;
  progress: number;
  earned: boolean;
  earnedAt: Date | null;
}

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(
    @InjectRepository(Badge) private readonly badgeRepo: Repository<Badge>,
    @InjectRepository(UserBadge) private readonly userBadgeRepo: Repository<UserBadge>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Progress) private readonly progressRepo: Repository<Progress>,
    @InjectRepository(Reply) private readonly replyRepo: Repository<Reply>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const seed of BADGE_SEEDS) {
      const existing = await this.badgeRepo.findOne({ where: { slug: seed.slug } });
      if (!existing) {
        await this.badgeRepo.save(this.badgeRepo.create({
          slug: seed.slug,
          name: seed.name,
          description: seed.description,
          icon: seed.icon,
          tier: seed.tier,
          criteria: { type: seed.type, threshold: seed.threshold },
        }));
      }
    }
  }

  async getMyBadges(userId: string): Promise<BadgeProgress[]> {
    const [badges, earned] = await Promise.all([
      this.badgeRepo.find({ where: { isActive: true }, order: { createdAt: 'ASC' } }),
      this.userBadgeRepo.find({ where: { userId }, relations: ['badge'] }),
    ]);
    const progress = await this.getProgress(userId);
    const earnedByBadge = new Map(earned.map((item) => [item.badgeId, item]));

    return badges.map((badge) => {
      const award = earnedByBadge.get(badge.id);
      return {
        id: badge.id,
        slug: badge.slug,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        tier: badge.tier,
        threshold: badge.criteria.threshold,
        progress: Math.min(progress[badge.criteria.type], badge.criteria.threshold),
        earned: Boolean(award),
        earnedAt: award?.earnedAt ?? null,
      };
    });
  }

  @OnEvent('course.completed')
  async handleCourseCompleted(payload: { userId: string }): Promise<void> {
    await this.evaluateAndAward(payload.userId);
  }

  @OnEvent('streak.updated')
  async handleStreakUpdated(payload: { userId: string }): Promise<void> {
    await this.evaluateAndAward(payload.userId);
  }

  @OnEvent('peer.helped')
  async handlePeerHelped(payload: { userId: string }): Promise<void> {
    await this.evaluateAndAward(payload.userId);
  }

  async evaluateAndAward(userId: string): Promise<void> {
    try {
      const [badges, progress] = await Promise.all([
        this.badgeRepo.find({ where: { isActive: true } }),
        this.getProgress(userId),
      ]);

      for (const badge of badges) {
        if (progress[badge.criteria.type] < badge.criteria.threshold) continue;
        const existing = await this.userBadgeRepo.findOne({ where: { userId, badgeId: badge.id } });
        if (!existing) {
          await this.userBadgeRepo.save(this.userBadgeRepo.create({ userId, badgeId: badge.id }));
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Badge evaluation failed for user=${userId}: ${message}`);
    }
  }

  private async getProgress(userId: string): Promise<Record<BadgeCriteriaType, number>> {
    const [completedCourses, user, helpedStudents] = await Promise.all([
      this.progressRepo.count({ where: { userId, completedAt: Not(IsNull()) } }),
      this.userRepo.findOne({ where: { id: userId } }),
      this.replyRepo
        .createQueryBuilder('reply')
        .innerJoin(Post, 'post', 'post.id = reply.postId')
        .select('COUNT(DISTINCT post.userId)', 'count')
        .where('reply.userId = :userId', { userId })
        .andWhere('post.userId != :userId', { userId })
        .getRawOne<{ count: string }>(),
    ]);

    return {
      courses_completed: completedCourses,
      streak_days: user?.longestStreak ?? 0,
      students_helped: Number(helpedStudents?.count ?? 0),
    };
  }
}
