import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from '../courses/course.entity';
import { Progress } from '../progress/progress.entity';
import { Review } from '../courses/review.entity';
import { MetricsService } from '../metrics/metrics.service';

export interface ScoredCourse extends Course {
  score: number;
  matchReasons: string[];
  skillOverlap: number;
  levelMatch: string;
  collaborativeScore: number;
  averageRating: number | null;
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly CACHE_TTL = 3600;

  private readonly WEIGHTS = {
    skill: 0.40,
    level: 0.25,
    collaborative: 0.20,
    rating: 0.15,
  };

  constructor(
    @InjectRepository(Enrollment) private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(Progress) private progressRepo: Repository<Progress>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private metrics: MetricsService,
  ) {}

  async getRecommendations(userId: string, limit = 10): Promise<ScoredCourse[]> {
    const cacheKey = `recommendations:v2:${userId}`;
    const cached = await this.cache.get<ScoredCourse[]>(cacheKey);
    if (cached) return cached.slice(0, limit);

    const userEnrollments = await this.enrollmentRepo.find({
      where: { userId },
      relations: ['course'],
    });
    const enrolledIds = userEnrollments.map((e) => e.courseId);
    const completedIds = userEnrollments
      .filter((e) => e.completedAt)
      .map((e) => e.courseId);

    const [userSkillProfile, userLevelProfile, userProgress] = await Promise.all([
      this.buildUserSkillProfile(userEnrollments),
      this.buildUserLevelProfile(userEnrollments),
      this.getUserProgressMap(userId),
    ]);

    const candidateCourses = await this.courseRepo.find({
      where: {
        isDeleted: false,
        status: In(['published', 'scheduled'] as any),
      },
    });

    const courseRatings = await this.getCourseRatingMap(
      candidateCourses.map((c) => c.id),
    );

    const similarUsers = await this.findSimilarUsers(userId, enrolledIds);
    const collaborativeRecs = await this.getCollaborativeScores(
      similarUsers,
      enrolledIds,
    );

    const scored = candidateCourses
      .filter((c) => !enrolledIds.includes(c.id))
      .map((course) => this.scoreCourse(
        course,
        userSkillProfile,
        userLevelProfile,
        collaborativeRecs,
        courseRatings,
        userProgress,
        completedIds,
      ))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);

    const results = scored.slice(0, Math.max(limit, 50));

    this.metrics.incrementRecommendationsServed(results.length);

    await this.cache.set(cacheKey, results, this.CACHE_TTL);
    return results.slice(0, limit);
  }

  private async buildUserSkillProfile(
    enrollments: Enrollment[],
  ): Promise<Map<string, number>> {
    const skillCount = new Map<string, number>();
    for (const e of enrollments) {
      const skills = e.course?.skills || [];
      for (const skill of skills) {
        skillCount.set(skill, (skillCount.get(skill) || 0) + 1);
      }
    }
    return skillCount;
  }

  private async buildUserLevelProfile(
    enrollments: Enrollment[],
  ): Promise<Map<string, number>> {
    const levelCount = new Map<string, number>();
    for (const e of enrollments) {
      const level = e.course?.level;
      if (level) {
        levelCount.set(level, (levelCount.get(level) || 0) + 1);
      }
    }
    return levelCount;
  }

  private async getUserProgressMap(
    userId: string,
  ): Promise<Map<string, number>> {
    const records = await this.progressRepo.find({ where: { userId } });
    const map = new Map<string, number>();
    for (const r of records) {
      const existing = map.get(r.courseId) || 0;
      if (r.progressPct > existing) {
        map.set(r.courseId, r.progressPct);
      }
    }
    return map;
  }

  private async getCourseRatingMap(
    courseIds: string[],
  ): Promise<Map<string, number>> {
    if (!courseIds.length) return new Map();

    const ratings = await this.reviewRepo
      .createQueryBuilder('r')
      .select('r.courseId', 'courseId')
      .addSelect('AVG(r.rating)', 'avgRating')
      .where('r.courseId IN (:...ids)', { ids: courseIds })
      .groupBy('r.courseId')
      .getRawMany<{ courseId: string; avgRating: string }>();

    const map = new Map<string, number>();
    for (const r of ratings) {
      map.set(r.courseId, parseFloat(r.avgRating));
    }
    return map;
  }

  private async findSimilarUsers(
    userId: string,
    enrolledIds: string[],
  ): Promise<Array<{ userId: string; overlap: number }>> {
    if (!enrolledIds.length) return [];

    const similar = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('e.userId', 'userId')
      .addSelect('COUNT(*)', 'overlap')
      .where('e.courseId IN (:...ids)', { ids: enrolledIds })
      .andWhere('e.userId != :userId', { userId })
      .groupBy('e.userId')
      .having('COUNT(*) >= 2')
      .orderBy('overlap', 'DESC')
      .limit(20)
      .getRawMany<{ userId: string; overlap: string }>();

    return similar.map((s) => ({
      userId: s.userId,
      overlap: parseInt(s.overlap, 10),
    }));
  }

  private async getCollaborativeScores(
    similarUsers: Array<{ userId: string; overlap: number }>,
    enrolledIds: string[],
  ): Promise<Map<string, number>> {
    const scores = new Map<string, number>();
    if (!similarUsers.length) return scores;

    const ids = similarUsers.map((u) => u.userId);
    const recs = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('e.courseId', 'courseId')
      .addSelect('COUNT(*)', 'count')
      .where('e.userId IN (:...ids)', { ids })
      .andWhere(enrolledIds.length ? 'e.courseId NOT IN (:...enrolled)' : '1=1', {
        enrolled: enrolledIds,
      })
      .groupBy('e.courseId')
      .orderBy('count', 'DESC')
      .limit(50)
      .getRawMany<{ courseId: string; count: string }>();

    const maxCount = recs.length ? parseInt(recs[0].count, 10) : 1;
    for (const r of recs) {
      scores.set(r.courseId, parseInt(r.count, 10) / maxCount);
    }
    return scores;
  }

  private jaccardSimilarity(
    a: string[],
    b: string[],
  ): number {
    if (!a.length && !b.length) return 0;
    const setA = new Set(a);
    const setB = new Set(b);
    let intersection = 0;
    for (const item of setA) {
      if (setB.has(item)) intersection++;
    }
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
  }

  private scoreCourse(
    course: Course,
    userSkillProfile: Map<string, number>,
    userLevelProfile: Map<string, number>,
    collaborativeRecs: Map<string, number>,
    courseRatings: Map<string, number>,
    userProgress: Map<string, number>,
    completedIds: string[],
  ): ScoredCourse {
    const reasons: string[] = [];
    const courseSkills = course.skills || [];
    const userSkills = [...userSkillProfile.keys()];

    const skillOverlap = this.jaccardSimilarity(userSkills, courseSkills);
    if (skillOverlap > 0) {
      reasons.push(`Matches your skills (${Math.round(skillOverlap * 100)}% overlap)`);
    }

    let levelScore = 0;
    const preferredLevel = this.getPreferredLevel(userLevelProfile);
    let levelMatchDesc = 'none';
    if (preferredLevel) {
      if (course.level === preferredLevel) {
        levelScore = 1.0;
        levelMatchDesc = preferredLevel;
        reasons.push(`Same level as your past courses (${preferredLevel})`);
      } else if (this.isAdjacentLevel(course.level, preferredLevel)) {
        levelScore = 0.5;
        levelMatchDesc = `adjacent to ${preferredLevel}`;
      }
    } else {
      levelScore = 0.3;
      levelMatchDesc = 'no preference yet';
    }

    const collabScore = collaborativeRecs.get(course.id) || 0;
    if (collabScore > 0) {
      reasons.push('Popular with similar students');
    }

    const avgRating = courseRatings.get(course.id) || null;
    const ratingScore = avgRating !== null ? avgRating / 5 : 0;

    const finalScore =
      this.WEIGHTS.skill * skillOverlap +
      this.WEIGHTS.level * levelScore +
      this.WEIGHTS.collaborative * collabScore +
      this.WEIGHTS.rating * ratingScore;

    return Object.assign(course, {
      score: Math.round(finalScore * 1000) / 1000,
      matchReasons: reasons,
      skillOverlap,
      levelMatch: levelMatchDesc,
      collaborativeScore: collabScore,
      averageRating: avgRating,
    });
  }

  private getPreferredLevel(
    levelProfile: Map<string, number>,
  ): string | null {
    let maxCount = 0;
    let preferred: string | null = null;
    for (const [level, count] of levelProfile) {
      if (count > maxCount) {
        maxCount = count;
        preferred = level;
      }
    }
    return preferred;
  }

  private isAdjacentLevel(a: string, b: string): boolean {
    const order = ['beginner', 'intermediate', 'advanced'];
    const idxA = order.indexOf(a);
    const idxB = order.indexOf(b);
    if (idxA === -1 || idxB === -1) return false;
    return Math.abs(idxA - idxB) === 1;
  }

  async invalidateCache(userId: string) {
    await this.cache.del(`recommendations:v2:${userId}`);
  }
}
