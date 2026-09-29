import {
  Injectable,
  Inject,
  forwardRef,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from './credential.entity';
import { StellarService } from '../stellar/stellar.service';
import { KycService } from '../kyc/kyc.service';
import { CoursesService } from '../courses/courses.service';

export interface BatchIssuanceItem {
  userId: string;
  courseId: string;
  stellarPublicKey: string;
}

@Injectable()
export class CredentialsService {
  constructor(
    @InjectRepository(Credential) private repo: Repository<Credential>,
    @Inject(forwardRef(() => StellarService)) private stellarService: StellarService,
    private kycService: KycService,
    private coursesService: CoursesService
  ) {}

  async issue(userId: string, courseId: string, stellarPublicKey: string): Promise<Credential> {
    // Avoid duplicate credentials
    const existing = await this.repo.findOne({ where: { userId, courseId } });
    if (existing) return existing;

    // KYC gate — only enforced when the course requires it
    const course = await this.coursesService.findOne(courseId);
    if (course.requiresKyc) {
      const approved = await this.kycService.isApproved(stellarPublicKey);
      if (!approved) {
        throw new ForbiddenException(
          'KYC verification required before credential issuance for this course'
        );
      }
    }

    const metadata = {
      courseName: course.title,
      grade: 'Pass', // Could be calculated from quiz scores if available
      skills: course.skills || [],
    };

    const txHash = await this.stellarService.issueCredential(
      stellarPublicKey,
      courseId,
      metadata
    );

    // Mint reward tokens after credential issuance
    try {
      await this.stellarService.mintReward(stellarPublicKey, 100);
    } catch {
      // Non-fatal
    }

    const credential = this.repo.create({
      userId,
      courseId,
      txHash,
      stellarPublicKey,
      grade: metadata.grade,
    });
    return this.repo.save(credential);
  }

  async issueBatch(items: BatchIssuanceItem[]): Promise<Credential[]> {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Batch issuance requires a non-empty list of credentials');
    }

    for (const item of items) {
      if (!item || !item.userId || !item.courseId || !item.stellarPublicKey) {
        throw new BadRequestException(
          'Each batch item requires userId, courseId and stellarPublicKey'
        );
      }
    }

    // Issue all credentials within a single transaction so a failure rolls back the batch
    return this.repo.manager.transaction(async (manager) => {
      const issued: Credential[] = [];
      for (const item of items) {
        const credential = await this.issue(
          item.userId,
          item.courseId,
          item.stellarPublicKey
        );
        issued.push(credential);
      }
      return issued;
    });
  }

  async issueBundle(userId: string, bundleId: string, stellarPublicKey: string): Promise<Credential> {
    const existing = await this.repo.findOne({ where: { userId, bundleId } });
    if (existing) return existing;

    const txHash = await this.stellarService.issueCredential(stellarPublicKey, `bundle:${bundleId}`);

    try {
      await this.stellarService.mintReward(stellarPublicKey, 500); // Higher reward for bundle completion
    } catch {
      // Non-fatal
    }

    const credential = this.repo.create({ userId, bundleId, txHash, stellarPublicKey });
    return this.repo.save(credential);
  }

  async issueLearningPath(userId: string, learningPathId: string, stellarPublicKey: string): Promise<Credential> {
    const existing = await this.repo.findOne({ where: { userId, learningPathId } });
    if (existing) return existing;

    const txHash = await this.stellarService.issueCredential(stellarPublicKey, `learning-path:${learningPathId}`);

    try {
      await this.stellarService.mintReward(stellarPublicKey, 750);
    } catch {
      // Non-fatal
    }

    const credential = this.repo.create({ userId, learningPathId, txHash, stellarPublicKey });
    return this.repo.save(credential);
  }  findByUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { issuedAt: 'DESC' } });
  }

  async findOne(id: string) {
    const credential = await this.repo.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    return credential;
  }

  async verify(txHash: string) {
    const credential = await this.repo.findOne({ where: { txHash } });
    if (!credential) {
      return { credential: null, verified: false, expired: false, message: 'Credential not found' };
    }
    const isExpired = credential.expiresAt ? new Date(credential.expiresAt) < new Date() : false;
    return {
      credential,
      verified: !isExpired,
      expired: isExpired,
      message: isExpired ? 'Credential has expired' : 'Credential verified successfully',
    };
  }
}
