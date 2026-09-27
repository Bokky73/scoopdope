import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SorobanRpc } from '@stellar/stellar-sdk';
import { CredentialsService } from '../credentials/credentials.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

const LAST_LEDGER_KEY = 'indexer:last_ledger';

@Injectable()
export class StellarIndexerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StellarIndexerService.name);
  private readonly sorobanServer: SorobanRpc.Server;
  private readonly analyticsContractId: string;
  private readonly tokenContractId: string;
  private pollInterval: number;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private credentialsService: CredentialsService,
    private notificationsService: NotificationsService,
    private usersService: UsersService
  ) {
    this.sorobanServer = new SorobanRpc.Server(
      this.configService.get<string>('stellar.sorobanRpcUrl') ?? ''
    );
    this.analyticsContractId = this.configService.get<string>('stellar.analyticsContractId') ?? '';
    this.tokenContractId = this.configService.get<string>('stellar.tokenContractId') ?? '';
    this.pollInterval = this.configService.get<number>('stellar.indexerPollIntervalMs')!;
  }

  onModuleInit() {
    if (!this.analyticsContractId && !this.tokenContractId) {
      this.logger.warn('No contract IDs configured — indexer disabled');
      return;
    }
    this.timer = setInterval(() => this.poll(), this.pollInterval);
    this.logger.log(`Indexer started (interval: ${this.pollInterval}ms)`);
  }

  onModuleDestroy() {
    this.clearTimer();
  }

  updatePollInterval(ms: number): void {
    this.pollInterval = ms;
    this.clearTimer();
    this.timer = setInterval(() => this.poll(), this.pollInterval);
    this.logger.log(`Indexer poll interval updated to ${ms}ms`);
  }

  private clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async poll() {
    try {
      const lastLedger = (await this.cacheManager.get<number>(LAST_LEDGER_KEY)) ?? 0;

      const contractIds = [this.analyticsContractId, this.tokenContractId].filter(Boolean);
      const { events, latestLedger } = await this.sorobanServer.getEvents({
        startLedger: lastLedger || undefined,
        filters: [{ type: 'contract', contractIds }],
      } as any);

      for (const event of events ?? []) {
        await this.handleEvent(event).catch((err) =>
          this.logger.error(`Error handling event: ${err.message}`, err.stack)
        );
      }

      if (latestLedger > lastLedger) {
        await this.cacheManager.set(LAST_LEDGER_KEY, latestLedger, 0);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Poll error: ${message}`);
    }
  }

  private async handleEvent(event: SorobanRpc.Api.EventResponse) {
    const topic = (event.topic ?? []).map((t: any) => t?.value?.toString() ?? '');
    const [contractType, eventName] = topic;

    if (contractType === 'analytics' && eventName === 'completed') {
      await this.handleAnalyticsCompleted(event);
    } else if (contractType === 'token' && eventName === 'transfer') {
      await this.handleTokenTransfer(event);
    }
  }

  private async handleAnalyticsCompleted(event: SorobanRpc.Api.EventResponse) {
    // Expected value shape: { student: publicKey, course: courseId }
    const value = event.value?.value?.() as any;
    const studentPublicKey: string = value?.student?.toString();
    const courseId: string = value?.course?.toString();

    if (!studentPublicKey || !courseId) return;

    const user = await this.usersService.findByStellarPublicKey(studentPublicKey);
    if (!user) return;

    this.logger.log(`analytics:completed — user ${user.id}, course ${courseId}`);
    await this.credentialsService.issue(user.id, courseId, studentPublicKey);
    await this.notificationsService.onCredentialIssued(user.id, courseId);
  }

  private async handleTokenTransfer(event: SorobanRpc.Api.EventResponse) {
    // Expected value shape: { to: publicKey, amount: bigint }
    const value = event.value?.value?.() as any;
    const toPublicKey: string = value?.to?.toString();

    if (!toPublicKey) return;

    // Bust the cached BST balance so the next read is fresh
    await this.cacheManager.del(`token_balance:${toPublicKey}`);
    this.logger.log(`token:transfer — busted BST cache for ${toPublicKey}`);
  }
}
