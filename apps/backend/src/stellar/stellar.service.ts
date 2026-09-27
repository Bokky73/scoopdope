import { Injectable, Logger, Inject, ServiceUnavailableException, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import pRetry from 'p-retry';
import {
  Horizon,
  Keypair,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  SorobanRpc,
  nativeToScVal,
  Address,
} from '@stellar/stellar-sdk';

const MAX_RETRIES = 3;
const RETRY_OPTIONS = {
  retries: MAX_RETRIES,
  minTimeout: 1000,
  maxTimeout: 8000,
  onFailedAttempt: (error: any) => {
    Logger.warn(
      `Attempt ${error.attemptNumber}/${MAX_RETRIES} failed: ${error.message}`
    );
  },
};

@Injectable()
export class StellarService implements OnApplicationShutdown {
  private readonly logger = new Logger(StellarService.name);
  private server: Horizon.Server;
  private sorobanServer: SorobanRpc.Server;
  private networkPassphrase: string;
  private analyticsContractId: string;
  private tokenContractId: string;
  private credentialMetadataContractId: string;
  private certificateContractId: string;
  private contractId: string;
  private enrollmentContractId: string;
  private secretKey: string;
  private pendingTransactionCount = 0;
  private isShuttingDown = false;
  private readonly SHUTDOWN_TIMEOUT_MS = 10000;

  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    const isTestnet = this.configService.get<string>('stellar.network') !== 'mainnet';
    this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;

    this.server = new Horizon.Server(
      isTestnet ? 'https://horizon-testnet.stellar.org' : 'https://horizon.stellar.org'
    );

    const rpcUrl = this.configService.get<string>('stellar.sorobanRpcUrl') ?? '';
    this.sorobanServer = new SorobanRpc.Server(rpcUrl);

    this.contractId = this.configService.get<string>('stellar.contractId') ?? '';
    this.enrollmentContractId =
      this.configService.get<string>('stellar.enrollmentContractId') ?? '';
    this.analyticsContractId = this.configService.get<string>('stellar.analyticsContractId') ?? '';
    this.tokenContractId = this.configService.get<string>('stellar.tokenContractId') ?? '';
    this.credentialMetadataContractId =
      this.configService.get<string>('stellar.credentialMetadataContractId') ?? '';
    this.certificateContractId =
      this.configService.get<string>('stellar.certificateContractId') ?? '';
    this.secretKey = this.configService.get<string>('stellar.secretKey') ?? '';

    if (!this.secretKey) {
      this.logger.warn(
        '⚠️  STELLAR_SECRET_KEY is not configured. ' +
          'Read-only operations (querying balances, transactions) will work, ' +
          'but signing operations (issuing credentials, minting tokens) will fail.'
      );
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Records a course enrollment on-chain via the Soroban enrollment contract.
   *
   * Invokes the contract's `record_enrollment` function with the student's
   * public key and the course ID, then returns the resulting transaction hash.
   *
   * @throws {Error} if `ENROLLMENT_CONTRACT_ID` is not configured
   * @throws {Error} propagated from Soroban RPC on simulation/submission failure
   */
  async recordEnrollment(studentPublicKey: string, courseId: string): Promise<string> {
    this.ensureSecretKeyConfigured();
    if (!this.enrollmentContractId) {
      throw new Error('ENROLLMENT_CONTRACT_ID is not configured');
    }

    return this.trackTransaction(() =>
      pRetry(
        () =>
          this.invokeContract(this.enrollmentContractId, 'record_enrollment', [
            new Address(studentPublicKey).toScVal(),
            nativeToScVal(courseId, { type: 'string' }),
          ]),
        RETRY_OPTIONS
      )
    );
  }

  /**
   * Fetches all Stellar account balances for the given public key.
   *
   * Queries the Horizon server for the account and returns its balance array,
   * which can include native XLM and any issued assets the account holds.
   *
   * @param publicKey - The Stellar public key (G...) of the account to query.
   * @returns An array of balance records from the Horizon API.
   *
   * @throws {Error} if the account does not exist on the network (404 from Horizon).
   * @throws {Error} on network failure when contacting the Horizon server.
   */
  async getAccountBalance(publicKey: string) {
    const account = await this.server.loadAccount(publicKey);
    return account.balances;
  }

  /**
   * Retrieves the most recent transactions for a Stellar account.
   *
   * Queries Horizon for up to `limit` transactions for the given public key,
   * ordered from newest to oldest. The result is a simplified projection of
   * the raw Horizon transaction records.
   *
   * @param publicKey - The Stellar public key (G...) of the account to query.
   * @param limit     - Maximum number of transactions to return (default: 10).
   * @returns An array of simplified transaction objects containing id, hash,
   *   createdAt, operationCount, successful, memo, memoType, and feeCharged.
   *
   * @throws {Error} if the account does not exist on the network.
   * @throws {Error} on network failure when contacting the Horizon server.
   */
  async getTransactions(publicKey: string, limit = 10): Promise<object[]> {
    const records = await this.server
      .transactions()
      .forAccount(publicKey)
      .limit(limit)
      .order('desc')
      .call();
    return records.records.map((tx) => ({
      id: tx.id,
      hash: tx.hash,
      createdAt: tx.created_at,
      operationCount: tx.operation_count,
      successful: tx.successful,
      memo: tx.memo,
      memoType: tx.memo_type,
      feeCharged: tx.fee_charged,
    }));
  }

  /**
   * Funds a Stellar testnet account using the Friendbot faucet.
   *
   * Friendbot is a testnet-only service that sends 10,000 XLM to a new or
   * existing account. This method will throw if called when the configured
   * network is not `testnet`.
   *
   * @param publicKey - The Stellar public key (G...) of the account to fund.
   * @returns An object with a `message` confirming the account was funded.
   *
   * @throws {Error} if the configured network is not `testnet`.
   * @throws {Error} if the Friendbot HTTP request fails (e.g. invalid key, rate limit).
   */
  async fundTestnetAccount(publicKey: string): Promise<{ message: string }> {
    const network = this.configService.get<string>('stellar.network');
    if (network !== 'testnet') {
      throw new Error('Friendbot is only available on testnet');
    }
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Friendbot error: ${body}`);
    }
    return { message: `Account ${publicKey} funded successfully` };
  }

  getTransactionExplorerUrl(txHash: string): string {
    const network = this.configService.get<string>('stellar.network') ?? 'testnet';
    const segment = network === 'mainnet' ? 'public' : 'testnet';
    return `https://stellar.expert/explorer/${segment}/tx/${txHash}`;
  }

  async mintCertificateNFT(
    recipientPublicKey: string,
    certificateHash: string,
    courseTitle: string,
  ): Promise<string> {
    this.ensureSecretKeyConfigured();
    if (!this.certificateContractId) {
      throw new Error('CERTIFICATE_CONTRACT_ID is not configured');
    }

    return this.trackTransaction(() =>
      pRetry(() =>
        this.invokeContract(this.certificateContractId, 'mint_certificate', [
          new Address(recipientPublicKey).toScVal(),
          nativeToScVal(certificateHash, { type: 'string' }),
          nativeToScVal(courseTitle, { type: 'string' }),
        ]),
        RETRY_OPTIONS
      )
    );
  }

  /**
   * Issues a verifiable on-chain credential to a student upon course completion.
   *
   * This method follows a two-phase strategy:
   *
   * 1. **Soroban (primary):** Attempts to record 100% progress on the Analytics
   *    contract via `record_progress`. The call is automatically retried up to
   *    {@link MAX_RETRIES} times (3) using exponential back-off with jitter
   *    (minTimeout: 1 000 ms, maxTimeout: 8 000 ms). Failed attempts are logged
   *    as warnings before each retry.
   *
   * 2. **Horizon (fallback):** If the Soroban call ultimately fails, the service
   *    falls back to {@link issueCredentialFallback}, which writes a `manageData`
   *    operation to the Horizon ledger to preserve a lightweight credential record.
   *
   * After the credential path resolves (either way), the method optionally stores
   * rich metadata (course name, grade, skills) on the `credentialMetadata` contract
   * when both `metadata` and `CREDENTIAL_METADATA_CONTRACT_ID` are configured.
   * Metadata storage failures are non-fatal and logged as errors.
   *
   * Finally, a canonical Horizon `manageData` transaction is submitted to produce
   * the official credential transaction hash that is returned to the caller.
   *
   * @param recipientPublicKey - The Stellar public key (G...) of the student.
   * @param courseId           - Unique identifier of the completed course.
   * @param metadata           - Optional rich metadata to store on-chain.
   * @returns The transaction hash of the Horizon credential transaction.
   *
   * @throws {ServiceUnavailableException} if `STELLAR_SECRET_KEY` is not configured.
   * @throws {Error} if the Horizon credential transaction submission fails.
   */
  async issueCredential(
    recipientPublicKey: string,
    courseId: string,
    metadata?: { courseName: string; grade: string; skills: string[] }
  ): Promise<string> {
    this.ensureSecretKeyConfigured();
    return this.trackTransaction(async () => {
      try {
        await pRetry(() => this.recordProgressOnChain(recipientPublicKey, courseId), RETRY_OPTIONS);
        this.logger.log(`Progress recorded on Soroban for ${courseId}`);
      } catch (error: any) {
        this.logger.error(
          `Failed to record progress on Soroban: ${error.message}, falling back to Horizon`
        );
        await this.issueCredentialFallback(recipientPublicKey, courseId);
      }

      if (metadata && this.credentialMetadataContractId) {
        try {
          await pRetry(() => this.storeCredentialMetadata(recipientPublicKey, metadata), RETRY_OPTIONS);
          this.logger.log(`Metadata stored on-chain for ${metadata.courseName}`);
        } catch (error: any) {
          this.logger.error(`Failed to store metadata on-chain: ${error.message}`);
        }
      }

      return this.mintCredentialViaHorizon(recipientPublicKey, courseId);
    });
  }

  async storeCredentialMetadata(
    studentPublicKey: string,
    metadata: { courseName: string; grade: string; skills: string[] }
  ): Promise<string> {
    this.ensureSecretKeyConfigured();
    const issuerKeypair = Keypair.fromSecret(this.secretKey);

    return this.invokeContract(this.credentialMetadataContractId, 'store_metadata', [
      new Address(issuerKeypair.publicKey()).toScVal(), // admin
      new Address(studentPublicKey).toScVal(), // student
      nativeToScVal(metadata.courseName, { type: 'string' }),
      nativeToScVal(Math.floor(Date.now() / 1000), { type: 'u64' }), // completion_date
      nativeToScVal(metadata.grade, { type: 'string' }),
      nativeToScVal(metadata.skills), // Soroban Vec<String>
    ]);
  }

  /**
   * Records a student's progress percentage for a course on the Analytics Soroban contract.
   *
   * Invokes the `record_progress` function on the configured Analytics contract (falls back
   * to the generic `contractId` if `analyticsContractId` is not set). The call is retried
   * up to {@link MAX_RETRIES} times (3) with exponential back-off and jitter
   * (minTimeout: 1 000 ms, maxTimeout: 8 000 ms).
   *
   * @param studentPublicKey - The Stellar public key (G...) of the student.
   * @param courseId         - Unique identifier of the course.
   * @param _progressPct     - Progress value as a percentage integer (0–100).
   * @returns The transaction hash of the Soroban invocation.
   *
   * @throws {ServiceUnavailableException} if `STELLAR_SECRET_KEY` is not configured.
   * @throws {Error} if all retry attempts fail (Soroban RPC or network errors).
   */
  async recordProgress(
    studentPublicKey: string,
    courseId: string,
    _progressPct: number
  ): Promise<string> {
    this.ensureSecretKeyConfigured();
    return this.trackTransaction(() =>
      pRetry(
        () =>
          this.invokeContract(this.analyticsContractId ?? this.contractId, 'record_progress', [
            new Address(studentPublicKey).toScVal(),
            nativeToScVal(courseId, { type: 'symbol' }),
            nativeToScVal(_progressPct, { type: 'i32' }),
          ]),
        RETRY_OPTIONS
      )
    );
  }

  /** Read BST balance for an address from the Token contract (read-only simulate) */
  async getTokenBalance(stellarPublicKey: string): Promise<string> {
    this.ensureSecretKeyConfigured();
    if (!this.tokenContractId) {
      throw new Error('TOKEN_CONTRACT_ID not configured');
    }

    const cacheKey = `token_balance:${stellarPublicKey}`;
    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached !== undefined && cached !== null) return cached;

    const issuerKeypair = Keypair.fromSecret(this.secretKey);
    const source = await this.sorobanServer.getAccount(issuerKeypair.publicKey());

    const tx = new TransactionBuilder(source as any, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: this.tokenContractId,
          function: 'balance',
          args: [new Address(stellarPublicKey).toScVal()],
        })
      )
      .setTimeout(30)
      .build();

    const simResult = await this.sorobanServer.simulateTransaction(tx);

    if (SorobanRpc.Api.isSimulationError(simResult)) {
      throw new Error(`Token balance simulation failed: ${simResult.error}`);
    }

    const retVal = (simResult as SorobanRpc.Api.SimulateTransactionSuccessResponse).result?.retval;
    const balance = retVal ? BigInt(retVal.value() as unknown as bigint).toString() : '0';

    await this.cacheManager.set(cacheKey, balance, 30_000);
    return balance;
  }

  /**
   * Mints BST reward tokens to a student's Stellar account via the Token Soroban contract.
   *
   * Invokes the `mint_reward` function on the configured Token contract. The call is retried
   * up to {@link MAX_RETRIES} times (3) with exponential back-off and jitter
   * (minTimeout: 1 000 ms, maxTimeout: 8 000 ms).
   *
   * @param recipientPublicKey - The Stellar public key (G...) of the reward recipient.
   * @param amount             - Amount of BST tokens to mint (passed as i128 to the contract).
   * @returns The transaction hash of the Soroban mint transaction.
   *
   * @throws {ServiceUnavailableException} if `STELLAR_SECRET_KEY` is not configured.
   * @throws {Error} if `TOKEN_CONTRACT_ID` is not configured.
   * @throws {Error} if all retry attempts fail (Soroban RPC or network errors).
   */
  async mintReward(recipientPublicKey: string, amount: number): Promise<string> {
    this.ensureSecretKeyConfigured();
    if (!this.tokenContractId) {
      throw new Error('TOKEN_CONTRACT_ID not configured');
    }
    return this.trackTransaction(() =>
      pRetry(
        () =>
          this.invokeContract(this.tokenContractId, 'mint_reward', [
            new Address(recipientPublicKey).toScVal(),
            nativeToScVal(amount, { type: 'i128' }),
          ]),
        RETRY_OPTIONS
      )
    );
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private ensureSecretKeyConfigured(): void {
    if (!this.secretKey) {
      throw new ServiceUnavailableException(
        'STELLAR_SECRET_KEY is not configured. ' +
          'Signing operations (issuing credentials, minting tokens, recording progress) require the secret key. ' +
          'Configure STELLAR_SECRET_KEY environment variable to enable these features.'
      );
    }
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down StellarService (signal: ${signal})`);
    this.isShuttingDown = true;

    if (this.pendingTransactionCount > 0) {
      this.logger.warn(
        `⏳ Waiting for ${this.pendingTransactionCount} pending Stellar transaction(s) to complete...`
      );

      const startTime = Date.now();
      while (this.pendingTransactionCount > 0 && Date.now() - startTime < this.SHUTDOWN_TIMEOUT_MS) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (this.pendingTransactionCount > 0) {
        this.logger.warn(
          `⚠️  Shutdown timeout: ${this.pendingTransactionCount} Stellar transaction(s) still pending after ${this.SHUTDOWN_TIMEOUT_MS}ms. ` +
            'These may result in user charges without database records. Consider increasing deployment grace period.'
        );
      } else {
        this.logger.log('✅ All pending Stellar transactions completed successfully');
      }
    }
  }

  private incrementPendingTransactions(): void {
    this.pendingTransactionCount++;
  }

  private decrementPendingTransactions(): void {
    if (this.pendingTransactionCount > 0) {
      this.pendingTransactionCount--;
    }
  }

  private async trackTransaction<T>(fn: () => Promise<T>): Promise<T> {
    this.incrementPendingTransactions();
    try {
      return await fn();
    } finally {
      this.decrementPendingTransactions();
    }
  }

  private async recordProgressOnChain(studentPublicKey: string, courseId: string): Promise<void> {
    await this.invokeContract(this.analyticsContractId ?? this.contractId, 'record_progress', [
      new Address(studentPublicKey).toScVal(),
      nativeToScVal(courseId, { type: 'symbol' }),
      nativeToScVal(100, { type: 'i32' }),
    ]);
  }

  private async issueCredentialFallback(
    recipientPublicKey: string,
    courseId: string
  ): Promise<void> {
    this.ensureSecretKeyConfigured();
    const issuerKeypair = Keypair.fromSecret(this.secretKey);
    const issuerAccount = await this.server.loadAccount(issuerKeypair.publicKey());

    const tx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: `scoopdope:credential:${courseId}`,
          value: recipientPublicKey,
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(issuerKeypair);
    await this.server.submitTransaction(tx);
  }

  /**
   * Builds, simulates, signs, and submits a Soroban contract invocation transaction.
   *
   * This is the low-level execution engine used by all write operations in this service.
   * It performs the full Soroban transaction lifecycle:
   * 1. Load the issuer account from the Soroban RPC server.
   * 2. Build a `TransactionBuilder` with a single `invokeContractFunction` operation.
   * 3. Call `sorobanServer.prepareTransaction()` to simulate and attach the authorization
   *    footprint / fee data.
   * 4. Sign the prepared transaction with the issuer keypair.
   * 5. Submit the transaction to the network via `sorobanServer.sendTransaction()`.
   *
   * Callers are responsible for wrapping calls to this method with `pRetry` using
   * {@link RETRY_OPTIONS} if retry behaviour is required (max 3 attempts,
   * minTimeout: 1 000 ms, maxTimeout: 8 000 ms, exponential back-off with jitter).
   *
   * @param contractId - The Stellar contract address to invoke.
   * @param method     - The name of the contract function to call.
   * @param args       - Array of `ScVal` arguments to pass to the contract function.
   * @returns The transaction hash returned by the Soroban RPC node.
   *
   * @throws {ServiceUnavailableException} if `STELLAR_SECRET_KEY` is not configured.
   * @throws {Error} if transaction simulation fails (e.g. insufficient funds, bad args).
   * @throws {Error} if transaction submission fails at the Soroban RPC level.
   */
  private async invokeContract(contractId: string, method: string, args: any[]): Promise<string> {
    this.ensureSecretKeyConfigured();
    const issuerKeypair = Keypair.fromSecret(this.secretKey);
    const source = await this.sorobanServer.getAccount(issuerKeypair.publicKey());

    const tx = new TransactionBuilder(source as any, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: contractId,
          function: method,
          args,
        })
      )
      .setTimeout(30)
      .build();

    const prepared = await this.sorobanServer.prepareTransaction(tx);
    (prepared as any).sign(issuerKeypair);
    const result = await this.sorobanServer.sendTransaction(prepared as any);
    this.logger.log(`Contract ${method} tx: ${result.hash}`);
    return result.hash;
  }

  private async mintCredentialViaHorizon(
    recipientPublicKey: string,
    courseId: string
  ): Promise<string> {
    this.ensureSecretKeyConfigured();
    const issuerKeypair = Keypair.fromSecret(this.secretKey);
    const issuerAccount = await this.server.loadAccount(issuerKeypair.publicKey());

    const tx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(
        Operation.manageData({
          name: `scoopdope:credential:${courseId}`,
          value: recipientPublicKey,
        })
      )
      .setTimeout(30)
      .build();

    tx.sign(issuerKeypair);
    const result = await this.server.submitTransaction(tx);
    this.logger.log(`Credential issued via Horizon: ${result.hash}`);
    return result.hash;
  }
}
