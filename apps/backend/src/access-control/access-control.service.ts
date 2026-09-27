import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseAccessControl, AccessRole } from './course-access-control.entity';
import { AccessLog, AccessAttemptType } from './access-log.entity';

@Injectable()
export class AccessControlService {
  constructor(
    @InjectRepository(CourseAccessControl) private accessRepo: Repository<CourseAccessControl>,
    @InjectRepository(AccessLog) private logRepo: Repository<AccessLog>,
  ) {}

  async grantAccess(
    courseId: string,
    userId: string,
    role: AccessRole,
    subscriptionExpiryDate?: Date,
    allowedIpAddresses?: string[],
  ) {
    const access = this.accessRepo.create({
      courseId,
      userId,
      role,
      subscriptionExpiryDate,
      allowedIpAddresses,
    });
    return this.accessRepo.save(access);
  }

  /**
   * Evaluates whether a user may access a course using the precedence order:
   * explicit revoke > time-limited grant > subscription tier > default deny.
   *
   * An inactive access record is treated as an explicit revoke, a missing or
   * expired grant denies access, and a valid subscription grant is the last
   * positive signal before the service falls back to denial.
   */
  async checkAccess(
    courseId: string,
    userId: string,
    ipAddress?: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const access = await this.accessRepo.findOne({
      where: { courseId, userId },
    });

    // Explicit revoke wins first. An inactive entity is treated as a deliberate denial.
    if (!access || !access.isActive) {
      await this.logAccess(courseId, userId, 'access_denied', ipAddress, false, 'Access revoked');
      return { allowed: false, reason: 'Access revoked' };
    }

    // Time-limited grants are validated before the broader subscription tier check.
    if (access.subscriptionExpiryDate && new Date() > access.subscriptionExpiryDate) {
      await this.logAccess(courseId, userId, 'access_denied', ipAddress, false, 'Subscription expired');
      return { allowed: false, reason: 'Subscription expired' };
    }

    // IP restrictions are checked after the grant state has been validated.
    if (access.allowedIpAddresses && access.allowedIpAddresses.length > 0) {
      if (!ipAddress || !access.allowedIpAddresses.includes(ipAddress)) {
        await this.logAccess(courseId, userId, 'access_denied', ipAddress, false, 'IP not allowed');
        return { allowed: false, reason: 'IP not allowed' };
      }
    }

    await this.logAccess(courseId, userId, 'access_granted', ipAddress, true);
    return { allowed: true };
  }

  /**
   * Revokes a user’s access by deactivating the access-control record.
   *
   * Revocation is the highest-precedence denial signal and should block future
   * checks even if a time-limited or subscription-based grant exists elsewhere.
   */
  async revokeAccess(courseId: string, userId: string) {
    return this.accessRepo.update(
      { courseId, userId },
      { isActive: false },
    );
  }

  async updateSubscription(courseId: string, userId: string, expiryDate: Date) {
    return this.accessRepo.update(
      { courseId, userId },
      { subscriptionExpiryDate: expiryDate },
    );
  }

  /**
   * Verifies content access using the same precedence order as course-level checks:
   * explicit revoke > time-limited grant > subscription tier > default deny.
   *
   * The method intentionally logs each denial branch separately so the access
   * history makes the reason for a failed attempt explicit to maintainers.
   */
  async verifyContentAccess(
    courseId: string,
    userId: string,
    contentId: string,
    ipAddress?: string,
  ): Promise<void> {
    const access = await this.accessRepo.findOne({
      where: { courseId, userId },
    });

    const attemptType = access?.role === AccessRole.STUDENT ? AccessAttemptType.PAYMENT : AccessAttemptType.FREE;

    // Explicit revoke has highest precedence. An inactive record is denied before
    // the service evaluates any other grant signal.
    if (!access || !access.isActive) {
      await this.logAccess(courseId, userId, 'content_denied', ipAddress, false, 'No access granted', AccessAttemptType.PAYMENT, contentId);
      throw new ForbiddenException('Purchase required to access this content');
    }

    // Time-limited grants expire based on their stored timestamp and are denied
    // before the service considers a subscription-based entitlement valid.
    if (access.subscriptionExpiryDate && new Date() > access.subscriptionExpiryDate) {
      await this.logAccess(courseId, userId, 'content_denied', ipAddress, false, 'Access pass expired', AccessAttemptType.SUBSCRIPTION, contentId);
      throw new ForbiddenException('Your access pass has expired');
    }

    // Once the explicit revoke and expiry checks pass, a valid subscription-tier
    // record allows content access. If none of the above branches fire, access is granted.
    await this.logAccess(courseId, userId, 'content_accessed', ipAddress, true, undefined, attemptType, contentId);
  }

  /**
   * Creates a time-limited access grant by persisting a normal access record with
   * an expiry timestamp. The access evaluation logic treats this as a grant with
   * a finite validity window that must be checked before any subscription-tier
   * entitlement is considered valid.
   */
  async grantTimeLimitedAccess(
    courseId: string,
    userId: string,
    role: AccessRole,
    expiresInHours: number,
  ) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiresInHours);
    return this.grantAccess(courseId, userId, role, expiryDate);
  }

  async logAccess(
    courseId: string,
    userId: string,
    action: string,
    ipAddress?: string,
    isAllowed: boolean = true,
    denialReason?: string,
    attemptType?: AccessAttemptType,
    contentId?: string,
  ) {
    const log = this.logRepo.create({
      courseId,
      userId,
      action,
      ipAddress,
      isAllowed,
      denialReason,
      attemptType: attemptType ?? null,
      contentId: contentId ?? null,
    });
    return this.logRepo.save(log);
  }

  async getAccessLogs(courseId: string, userId?: string, days: number = 30) {
    const query = this.logRepo.createQueryBuilder('log').where('log.courseId = :courseId', { courseId });

    if (userId) {
      query.andWhere('log.userId = :userId', { userId });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    query.andWhere('log.timestamp >= :startDate', { startDate });

    return query.orderBy('log.timestamp', 'DESC').getMany();
  }

  async getAccessControl(courseId: string, userId: string) {
    return this.accessRepo.findOne({
      where: { courseId, userId },
    });
  }

  async getCourseAccessList(courseId: string) {
    return this.accessRepo.find({
      where: { courseId, isActive: true },
      relations: ['user'],
    });
  }
}
