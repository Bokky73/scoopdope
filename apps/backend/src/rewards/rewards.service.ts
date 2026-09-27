import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StellarService } from '../stellar/stellar.service';
import { User } from '../users/user.entity';
import { Reward, RewardType } from './reward.entity';

export interface ClaimRewardDto {
  type: RewardType;
  referenceId: string;
}

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Reward) private readonly rewardRepo: Repository<Reward>,
    private readonly stellarService: StellarService,
    private readonly configService: ConfigService,
  ) {}

  calculateEarnedTokens(type: RewardType): number {
    const defaultMap: Record<RewardType, number> = {
      [RewardType.MODULE]: 25,
      [RewardType.COURSE]: 100,
    };

    const configuredMap = {
      [RewardType.MODULE]: this.configService.get<number>('rewards.moduleCompletion', defaultMap[RewardType.MODULE]),
      [RewardType.COURSE]: this.configService.get<number>('rewards.courseCompletion', defaultMap[RewardType.COURSE]),
    };

    return configuredMap[type] ?? defaultMap[type] ?? 0;
  }

  async claim(userId: string, dto: ClaimRewardDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userId !== user.id) {
      throw new ForbiddenException('You can only claim rewards for your own account');
    }

    const existing = await this.rewardRepo.findOne({
      where: {
        userId,
        type: dto.type,
        referenceId: dto.referenceId,
      },
    });

    if (existing) {
      throw new ConflictException('Reward already claimed for this reference');
    }

    const amount = this.calculateEarnedTokens(dto.type);

    if (!user.stellarPublicKey) {
      throw new NotFoundException('User has no Stellar public key linked');
    }

    const txHash = await this.stellarService.mintReward(user.stellarPublicKey, amount);

    const nextBalance = Number(user.rewardBalance ?? 0) + amount;

    const savedUser = await this.userRepo.save({
      ...user,
      rewardBalance: nextBalance,
    });

    const reward = this.rewardRepo.create({
      userId,
      type: dto.type,
      referenceId: dto.referenceId,
      amount,
      reason: `${dto.type} completion reward`,
      txHash,
    });

    const savedReward = await this.rewardRepo.save(reward);

    this.logger.log(
      `Reward claimed: user=${userId} type=${dto.type} amount=${amount} reference=${dto.referenceId}`,
    );

    return {
      userId,
      amount,
      balance: Number(savedUser.rewardBalance ?? 0),
      txHash,
      reason: savedReward.reason,
      claimedAt: savedReward.claimedAt,
    };
  }

  async getHistory(userId: string) {
    return this.rewardRepo.find({
      where: { userId },
      order: { claimedAt: 'DESC' },
    });
  }
}
