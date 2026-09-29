import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Horizon,
  Networks,
  Keypair,
  TransactionBuilder,
  Asset,
  Operation,
  Memo,
  BASE_FEE,
} from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private readonly logger = new Logger(StellarService.name);
  private readonly server: Horizon.Server;
  private readonly networkPassphrase: string;

  constructor(private readonly configService: ConfigService) {
    const network = (
      this.configService.get<string>('STELLAR_NETWORK') ?? 'testnet'
    ).toLowerCase();

    const isMainnet = network === 'mainnet' || network === 'public';

    this.networkPassphrase = isMainnet
      ? Networks.PUBLIC
      : Networks.TESTNET;

    const horizonUrl = isMainnet
      ? 'https://horizon.stellar.org'
      : 'https://horizon-testnet.stellar.org';

    this.server = new Horizon.Server(horizonUrl);

    this.logger.log(
      `Stellar service initialized on ${isMainnet ? 'mainnet' : 'testnet'} (${horizonUrl})`,
    );
  }

  getNetworkPassphrase(): string {
    return this.networkPassphrase;
  }

  getServer(): Horizon.Server {
    return this.server;
  }

  async getAccount(publicKey: string): Promise<Horizon.AccountResponse> {
    return this.server.loadAccount(publicKey);
  }

  async getBalance(publicKey: string): Promise<string> {
    const account = await this.server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (balance) => balance.asset_type === 'native',
    );
    return nativeBalance ? nativeBalance.balance : '0';
  }

  async sendPayment(
    sourceSecret: string,
    destination: string,
    amount: string,
    asset: Asset = Asset.native(),
    memo?: string,
  ): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
    const sourceKeypair = Keypair.fromSecret(sourceSecret);
    const sourceAccount = await this.server.loadAccount(
      sourceKeypair.publicKey(),
    );

    const transactionBuilder = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    }).addOperation(
      Operation.payment({
        destination,
        asset,
        amount,
      }),
    );

    if (memo) {
      transactionBuilder.addMemo(Memo.text(memo));
    }

    const transaction = transactionBuilder.setTimeout(30).build();
    transaction.sign(sourceKeypair);

    return this.server.submitTransaction(transaction);
  }
}
