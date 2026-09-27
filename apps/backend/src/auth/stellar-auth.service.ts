import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Keypair, Networks, WebAuth } from '@stellar/stellar-sdk';
import { UsersService } from '../users/users.service';

const CHALLENGE_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class StellarAuthService {
  private readonly serverKeypair: Keypair;
  private readonly networkPassphrase: string;
  private readonly webAuthDomain: string;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private usersService: UsersService
  ) {
    this.serverKeypair = Keypair.fromSecret(
      this.configService.get<string>('stellar.secretKey') ?? ''
    );
    const isTestnet = this.configService.get<string>('stellar.network') !== 'mainnet';
    this.networkPassphrase = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
    this.webAuthDomain = this.configService.get<string>('stellar.webAuthDomain') ?? '';
  }

  /** GET /auth/stellar?account=G... — returns a SEP-0010 challenge XDR */
  buildChallenge(clientPublicKey: string): { transaction: string; network_passphrase: string } {
    const transaction = WebAuth.buildChallengeTx(
      this.serverKeypair,
      clientPublicKey,
      this.webAuthDomain,
      CHALLENGE_TTL_SECONDS,
      this.networkPassphrase,
      this.webAuthDomain
    );
    return { transaction, network_passphrase: this.networkPassphrase };
  }

  /** POST /auth/stellar — verifies signed challenge, returns JWT */
  async verifyChallenge(signedXdr: string): Promise<{ access_token: string }> {
    let clientPublicKey: string;
    try {
      const { clientAccountID } = WebAuth.readChallengeTx(
        signedXdr,
        this.serverKeypair.publicKey(),
        this.networkPassphrase,
        this.webAuthDomain,
        this.webAuthDomain
      );
      clientPublicKey = clientAccountID;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new UnauthorizedException(`Invalid SEP-0010 challenge: ${message}`);
    }

    // Find or auto-provision a user for this Stellar account
    let user = await this.usersService.findByStellarPublicKey(clientPublicKey);
    if (!user) {
      user = await this.usersService.create({
        stellarPublicKey: clientPublicKey,
        email: `${clientPublicKey}@stellar.local`,
        passwordHash: '',
        isVerified: true,
      });
    }

    const access_token = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' }
    );
    return { access_token };
  }
}
