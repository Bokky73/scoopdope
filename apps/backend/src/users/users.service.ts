import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './dto/change-role.dto';
import { Post } from '../forums/post.entity';
import { Review } from '../courses/review.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from '../courses/course.entity';

/** Stable UUID used as the author for anonymized forum posts. */
export const ANONYMOUS_USER_ID = '00000000-0000-0000-0000-000000000000';

export interface ExportedUserData {
  profile: Partial<User>;
  enrollments: any[];
  certificates: any[];
  credentials: any[];
  auditLogs: any[];
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Enrollment) private enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByEmailWithPassword(email: string) {
    return this.repo
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.passwordHash')
      .getOne();
  }

  findByVerificationToken(hash: string) {
    return this.repo.findOne({ where: { verificationToken: hash } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Public-facing profile view for GET /users/:id.
   * - Never exposes passwordHash or other auth secrets (see User entity `select: false`).
   * - Email is only included when the viewer is the profile owner.
   * - Instructors additionally expose bio and the list of courses they teach.
   */
  async getPublicProfile(id: string, viewerId?: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const [enrollmentCount, completedCoursesCount] = await Promise.all([
      this.enrollmentRepo.count({ where: { userId: id } }),
      this.enrollmentRepo
        .createQueryBuilder('enrollment')
        .where('enrollment.userId = :id', { id })
        .andWhere('enrollment.completedAt IS NOT NULL')
        .getCount(),
    ]);

    const profile: Record<string, unknown> = {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      enrollmentCount,
      completedCoursesCount,
    };

    if (viewerId && viewerId === user.id) {
      profile.email = user.email;
    }

    if (user.role === 'instructor') {
      profile.bio = user.bio;
      profile.coursesTaught = await this.courseRepo.find({
        where: { instructorId: id, isDeleted: false },
        select: ['id', 'title'],
      });
    }

    return profile;
  }

  findByIdWithPassword(id: string) {
    return this.repo
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .addSelect('user.passwordHash')
      .getOne();
  }

  findByStellarPublicKey(stellarPublicKey: string) {
    return this.repo.findOne({ where: { stellarPublicKey } });
  }

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data));
  }

  // Allowed profile fields that users can self-update.
  // Explicitly whitelisted to prevent privilege escalation via unvalidated properties
  // such as role, isBanned, isVerified, passwordHash, etc.
  private static readonly ALLOWED_UPDATE_FIELDS = new Set<string>([
    'username',
    'avatar',
    'bio',
    'email',
  ]);

  private pickAllowedFields(data: Partial<User>): Partial<User> {
    const picked: any = {};
    for (const key of Object.keys(data)) {
      if (UsersService.ALLOWED_UPDATE_FIELDS.has(key)) {
        picked[key] = (data as any)[key];
      }
    }
    return picked;
  }

  /**
   * Update a user's profile.
   *
   * - Only fields in ALLOWED_UPDATE_FIELDS are persisted (whitelist).
   * - If `email` is being changed, uniqueness is enforced before saving.
   * - `profilePictureUrl` is treated as an alias for `avatar`.
   */
  async update(id: string, data: UpdateUserDto | Partial<User>) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    // Normalise profilePictureUrl → avatar so either field name is accepted
    const normalised: Record<string, unknown> = { ...(data as Record<string, unknown>) };
    if ('profilePictureUrl' in normalised && normalised['profilePictureUrl'] !== undefined) {
      normalised['avatar'] = normalised['profilePictureUrl'];
      delete normalised['profilePictureUrl'];
    }

    const allowed = this.pickAllowedFields(normalised as Partial<User>);

    // Email uniqueness check — only query when the caller is actually changing
    // the email to a different address.
    if (allowed.email && allowed.email !== user.email) {
      const existing = await this.findByEmail(allowed.email);
      if (existing) {
        throw new ConflictException('Email address is already in use');
      }
    }

    return this.repo.save({ ...user, ...allowed });
  }

  async findAll(
    options: {
      page?: number;
      limit?: number;
      role?: string;
      status?: UserStatus;
      isVerified?: boolean;
      search?: string;
    } = {}
  ) {
    const { page = 1, limit = 10, role, status, isVerified, search } = options;

    const query = this.repo.createQueryBuilder('user');

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (status) {
      query.andWhere('user.status = :status', { status });
    }

    if (isVerified !== undefined) {
      query.andWhere('user.isVerified = :isVerified', { isVerified });
    }

    if (search) {
      query.andWhere(
        '(user.email ILIKE :search OR user.username ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.andWhere('user.deletedAt IS NULL');

    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async banUser(id: string, isBanned: boolean) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.repo.save({ ...user, isBanned });
  }

  /**
   * Set a user's status (active / suspended / deactivated).
   * Returns the old status so callers can record a change delta.
   */
  async setStatus(id: string, status: UserStatus): Promise<{ user: User; previousStatus: UserStatus }> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const previousStatus = user.status;
    const updated = await this.repo.save({ ...user, status });
    return { user: updated, previousStatus };
  }

  async changeRole(id: string, role: string) {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new BadRequestException(
        `Invalid role "${role}". Valid roles: ${Object.values(UserRole).join(', ')}`,
      );
    }
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const previousRole = user.role;
    const updated = await this.repo.save({ ...user, role });
    return { user: updated, previousRole };
  }

  async softDelete(id: string) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    if (user.deletedAt) throw new NotFoundException('User already deleted');
    return this.repo.save({ ...user, deletedAt: new Date() });
  }

  async bulkSoftDelete(ids: string[]) {
    const results = { deleted: [] as string[], failed: [] as { id: string; reason: string }[] };

    for (const id of ids) {
      try {
        await this.softDelete(id);
        results.deleted.push(id);
      } catch (err) {
        results.failed.push({
          id,
          reason: err instanceof NotFoundException ? err.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  findByReferralCode(code: string) {
    return this.repo.findOne({ where: { referralCode: code } });
  }

  async getReferralStats(userId: string) {
    const count = await this.repo.count({ where: { referredBy: userId } });
    return { referralCount: count, earnedBst: count * 50 };
  }

  async exportUserData(id: string): Promise<ExportedUserData> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const { passwordHash, mfaSecret, mfaBackupCodes, verificationToken, ...safeProfile } = user;

    return {
      profile: safeProfile,
      enrollments: [],
      certificates: [],
      credentials: [],
      auditLogs: [],
    };
  }

  async anonymizeUser(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    const anonymizedEmail = `deleted-${id.slice(0, 8)}@anonymized.invalid`;
    const anonymizedUsername = `deleted-user-${id.slice(0, 8)}`;

    if (this.postRepo) {
      // Reassign forum posts to the anonymous placeholder user so thread
      // continuity is preserved (replies to these posts still have a parent).
      await this.postRepo.update({ userId: id }, { userId: ANONYMOUS_USER_ID });
    }

    if (this.reviewRepo) {
      // Anonymize course reviews in-place: detach the author identity
      // by clearing the userId link rather than deleting the review row,
      // keeping course ratings intact.
      await this.reviewRepo.update({ userId: id }, { userId: ANONYMOUS_USER_ID });
    }

    // Scrub all PII from the user row and mark it as deleted.
    Object.assign(user, {
      email: anonymizedEmail,
      username: anonymizedUsername,
      passwordHash: '',
      avatar: null as unknown as string,
      bio: null as unknown as string,
      stellarPublicKey: null as unknown as string,
      referralCode: null as unknown as string,
      stripeCustomerId: null as unknown as string,
      stripeSubscriptionId: null as unknown as string,
      deletedAt: new Date(),
    });
    await this.repo.save(user);
  }
}
