import {
  Injectable,
  Inject,
  forwardRef,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from './credential.entity';
import { StellarService } from '../stellar/stellar.service';
import { KycService } from '../kyc/kyc.service';
import { CoursesService } from '../courses/courses.service';

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
