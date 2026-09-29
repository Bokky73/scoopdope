import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  Keypair,
  xdr,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';

/**
 * Validates that a string is a well-formed Stellar contract ID (C...).
 * A valid contract ID is a 56-character StrKey encoded contract address
 * that decodes to a 32-byte contract hash.
 */
export function isValidContractId(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  // Contract IDs are StrKey encoded with the 'C' prefix and are 56 chars long.
  if (address.length !== 56 || !address.startsWith('C')) {
    return false;
  }
  try {
    // StrKey.decodeAny... / decodeCheck validates the checksum and payload.
    const decoded = (xdr as any).StrKey?.decodeContract
      ? (xdr as any).StrKey.decodeContract(address)
      : null;
    if (decoded && decoded.length === 32) {
      return true;
    }
  } catch {
    return false;
  }
  // Fallback: validate base32 alphabet and checksum via Contract constructor.
  try {
    // eslint-disable-next-line no-new
    new Contract(address);
    return true;
  } catch {
    return false;
  }
}

@Injectable()
export class SorobanService {
  private readonly logger = new Logger(SorobanService.name);
  private readonly server: SorobanRpc.Server;
  private readonly networkPassphrase: string;
  private readonly contractId: string;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl =
      this.configService.get<string>('STELLAR_RPC_URL') ??
      'https://soroban-testnet.stellar.org';
    this.networkPassphrase =
      this.configService.get<string>('STELLAR_NETWORK_PASSPHRASE') ??
      Networks.TESTNET;

    const configuredContractId =
      this.configService.get<string>('SOROBAN_CONTRACT_ID') ?? '';

    if (!isValidContractId(configuredContractId)) {
      throw new BadRequestException(
        `Invalid Soroban contract address: "${configuredContractId}". ` +
          'Expected a valid Stellar contract ID (56-character StrKey starting with "C").',
      );
    }

    this.contractId = configuredContractId;
    this.server = new SorobanRpc.Server(rpcUrl, { allowHttp: rpcUrl.startsWith('http://') });
  }

  /**
   * Ensures the configured contract address is valid before making any call.
   */
  private assertValidContractId(): void {
    if (!isValidContractId(this.contractId)) {
      throw new BadRequestException(
        `Invalid Soroban contract address: "${this.contractId}". ` +
          'Expected a valid Stellar contract ID (56-character StrKey starting with "C").',
      );
    }
  }

  getContractId(): string {
    this.assertValidContractId();
    return this.contractId;
  }

  async callContract(
    method: string,
    params: xdr.ScVal[] = [],
    sourceSecret?: string,
  ): Promise<any> {
    this.assertValidContractId();

    const sourceKeypair = sourceSecret
      ? Keypair.fromSecret(sourceSecret)
      : Keypair.random();

    const contract = new Contract(this.contractId);
    const account = await this.server.getAccount(sourceKeypair.publicKey());

    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(method, ...params))
      .setTimeout(30)
      .build();

    const prepared = await this.server.prepareTransaction(transaction);
    const response = await this.server.sendTransaction(prepared);

    if (response.status === 'ERROR') {
      this.logger.error(`Soroban transaction failed: ${JSON.stringify(response)}`);
      throw new BadRequestException('Soroban transaction failed');
    }

    return response;
  }

  async simulateContract(
    method: string,
    params: xdr.ScVal[] = [],
    sourcePublicKey?: string,
  ): Promise<any> {
    this.assertValidContractId();

    const contract = new Contract(this.contractId);
    const account = await this.server.getAccount(
      sourcePublicKey ?? Keypair.random().publicKey(),
    );

    const transaction = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: this.networkPassphrase,
    })
      .addOperation(contract.call(method, ...params))
      .setTimeout(30)
      .build();

    return this.server.simulateTransaction(transaction);
  }

  toScVal(value: unknown): xdr.ScVal {
    return nativeToScVal(value);
  }

  fromScVal(value: xdr.ScVal): unknown {
    return scValToNative(value);
  }
}
