import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { Payout } from './payout.entity';
import { Enrollment } from '../enrollments/enrollment.entity';
import { Course } from '../courses/course.entity';
import { ConfigService } from '@nestjs/config';
import { KycService } from '../kyc/kyc.service';

interface PayoutBatchFailure {
  cursor: number;
  error: string;
}

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);

  constructor(
    @InjectRepository(Payout)
    private payoutsRepository: Repository<Payout>,
    @InjectRepository(Enrollment)
    private enrollmentsRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    private configService: ConfigService,
    private kycService: KycService,
  ) {}

  async calculatePayouts(startDate: Date, endDate: Date): Promise<Payout[]> {
    const platformFeePercent = this.configService.get<number>('PLATFORM_FEE_PERCENT', 20);
    const batchSize = this.configService.get<number>('payouts.batchSize', 500);

    const courses = await this.coursesRepository.find({
      where: { instructorId: Not(IsNull()) },
      relations: ['instructor'],
    });

    const payouts: Payout[] = [];
    const failedBatches: PayoutBatchFailure[] = [];

    for (const course of courses) {
      if (!course.instructor) continue;

      const coursePrice = this.configService.get<number>(`COURSE_PRICE_${course.id}`, 0);
      const instructorId = course.instructor.id;

      let offset = 0;
      let totalCompletions = 0;

      while (true) {
        let enrollments: Enrollment[];
        try {
          enrollments = await this.enrollmentsRepository.find({
            where: {
              courseId: course.id,
              completedAt: Between(startDate, endDate),
            },
            order: { id: 'ASC' },
            skip: offset,
            take: batchSize,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const stack = error instanceof Error ? error.stack : undefined;
          this.logger.error(
            `Payout batch fetch failed for course ${course.id} at offset ${offset}: ${message}`,
            stack,
          );
          failedBatches.push({ cursor: offset, error: message });
          offset += batchSize;
          continue;
        }

        if (enrollments.length === 0) {
          break;
        }

        totalCompletions += enrollments.length;
        offset += batchSize;

        if (enrollments.length < batchSize) {
          break;
        }
      }

      if (totalCompletions === 0) continue;

      const totalRevenue = totalCompletions * coursePrice;
      
      // Stripe fees: 2.9% + $0.30 per transaction
      // For simplicity, we'll use 2.9% + $0.30 per completion
      // In production, this would come from Stripe's PaymentIntent.application_fee_amount
      const stripeFeePercentage = totalRevenue * 0.029;
      const stripeFeeFixedPerCompletion = 0.30;
      const totalStripeFee = stripeFeePercentage + (stripeFeeFixedPerCompletion * totalCompletions);
      
      // Net revenue = gross - Stripe fees
      const netRevenue = totalRevenue - totalStripeFee;
      
      // Platform fee taken from net revenue
      const platformFee = (netRevenue * platformFeePercent) / 100;
      
      // Instructor share = net revenue - platform fee
      const instructorShare = netRevenue - platformFee;

      const payout = this.payoutsRepository.create({
        instructorId,
        courseId: course.id,
        totalRevenue,
        stripeFee: totalStripeFee,
        platformFee,
        instructorShare,
        status: 'pending',
        payoutDate: new Date(),
      });

      payouts.push(payout);
    }

    if (failedBatches.length > 0) {
      this.logger.warn(
        `Payout run completed with ${failedBatches.length} failed batch(es). See logs above for details.`,
      );
    }

    return this.payoutsRepository.save(payouts);
  }

  async processPayout(payoutId: string): Promise<Payout> {
    const payout = await this.payoutsRepository.findOne({
      where: { id: payoutId },
      relations: ['instructor'],
    });

    if (!payout) {
      throw new NotFoundException('Payout not found');
    }

    // Check KYC approval before processing payout
    const stellarPublicKey = payout.instructor?.stellarPublicKey;
    if (!stellarPublicKey) {
      throw new ForbiddenException('Instructor must have a Stellar public key configured to receive payouts');
    }

    const isKycApproved = await this.kycService.isApproved(stellarPublicKey);
    if (!isKycApproved) {
      payout.status = 'failed';
      await this.payoutsRepository.save(payout);
      throw new ForbiddenException('KYC verification is required before processing payouts. Please complete KYC verification.');
    }

    try {
      payout.status = 'processed';
      payout.transactionId = `TXN-${Date.now()}`;
      this.logger.log(`Payout processed for instructor ${payout.instructor.email}: $${payout.instructorShare}`);
    } catch (error) {
      payout.status = 'failed';
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Payout failed: ${message}`);
    }

    return this.payoutsRepository.save(payout);
  }

  async getInstructorPayouts(instructorId: string): Promise<Payout[]> {
    return this.payoutsRepository.find({
      where: { instructorId },
      relations: ['course'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPayoutStats(instructorId: string): Promise<{
    totalEarnings: number;
    pendingPayouts: number;
    processedPayouts: number;
  }> {
    const payouts = await this.payoutsRepository.find({
      where: { instructorId },
    });

    const totalEarnings = payouts.reduce((sum, p) => sum + Number(p.instructorShare), 0);
    const pendingPayouts = payouts.filter((p) => p.status === 'pending').length;
    const processedPayouts = payouts.filter((p) => p.status === 'processed').length;

    return { totalEarnings, pendingPayouts, processedPayouts };
  }

  async getPayoutHistory(instructorId: string, limit = 10): Promise<Payout[]> {
    return this.payoutsRepository.find({
      where: { instructorId },
      relations: ['course'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getMonthlyRevenue(instructorId: string): Promise<{ month: string; revenue: number }[]> {
    const payouts = await this.payoutsRepository.find({
      where: { instructorId, status: 'processed' },
      order: { payoutDate: 'ASC' },
    });

    const byMonth: Record<string, number> = {};
    for (const p of payouts) {
      const key = p.payoutDate.toISOString().slice(0, 7); // YYYY-MM
      byMonth[key] = (byMonth[key] ?? 0) + Number(p.instructorShare);
    }

    return Object.entries(byMonth).map(([month, revenue]) => ({ month, revenue }));
  }

  async getPerCourseRevenue(
    instructorId: string,
  ): Promise<{ courseId: string; courseTitle: string; revenue: number; payoutCount: number }[]> {
    const payouts = await this.payoutsRepository.find({
      where: { instructorId },
      relations: ['course'],
    });

    const byCourse: Record<string, { courseTitle: string; revenue: number; payoutCount: number }> = {};
    for (const p of payouts) {
      if (!byCourse[p.courseId]) {
        byCourse[p.courseId] = { courseTitle: p.course?.title ?? p.courseId, revenue: 0, payoutCount: 0 };
      }
      byCourse[p.courseId].revenue += Number(p.instructorShare);
      byCourse[p.courseId].payoutCount += 1;
    }

    return Object.entries(byCourse).map(([courseId, data]) => ({ courseId, ...data }));
  }

  async getRevenueProjection(instructorId: string): Promise<{ projectedMonthly: number; trend: 'up' | 'down' | 'stable' }> {
    const monthly = await this.getMonthlyRevenue(instructorId);
    if (monthly.length < 2) {
      return { projectedMonthly: monthly[0]?.revenue ?? 0, trend: 'stable' };
    }

    const last = monthly[monthly.length - 1].revenue;
    const prev = monthly[monthly.length - 2].revenue;
    const trend: 'up' | 'down' | 'stable' =
      last > prev * 1.05 ? 'up' : last < prev * 0.95 ? 'down' : 'stable';

    // Simple linear projection: average growth applied to last month
    const avgGrowth = monthly.slice(1).reduce((sum, m, i) => sum + (m.revenue - monthly[i].revenue), 0) / (monthly.length - 1);
    const projectedMonthly = Math.max(0, last + avgGrowth);

    return { projectedMonthly: Math.round(projectedMonthly * 100) / 100, trend };
  }
}
