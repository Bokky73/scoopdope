import { BadRequestException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { TokenService } from './token.service';

@Injectable()
export class OAuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {}

  async googleLogin(profile: { id: string; email: string; displayName: string; picture: string }) {
    let user = await this.usersService.findByEmail(profile.email);
    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        passwordHash: '',
        isVerified: true,
        referralCode: crypto.randomBytes(6).toString('hex'),
        avatar: profile.picture,
      });
    }
    return this.tokenService.issueTokenPair(user.id, user.email, user.role);
  }

  async microsoftLogin(profile: { id: string; email: string; displayName: string; picture?: string }) {
    let user = await this.usersService.findByEmail(profile.email);
    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        passwordHash: '',
        isVerified: true,
        referralCode: crypto.randomBytes(6).toString('hex'),
        avatar: profile.picture ?? null,
      });
    }
    return this.tokenService.issueTokenPair(user.id, user.email, user.role);
  }

  generateStellarChallenge(publicKey: string) {
    const nonce = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const challenge = Buffer.from(JSON.stringify({ nonce, publicKey, expiresAt: expiresAt.toISOString() })).toString('base64');
    return {
      challenge,
      nonce,
      message: `Sign this message to verify ownership of ${publicKey}: ${nonce}`,
    };
  }

  async verifyStellarSignature(userId: string, publicKey: string, signature: string, challenge: string) {
    let challengeData: { expiresAt: string; publicKey: string };
    try {
      challengeData = JSON.parse(Buffer.from(challenge, 'base64').toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid challenge or signature');
    }

    if (new Date(challengeData.expiresAt) < new Date()) throw new BadRequestException('Challenge has expired');
    if (challengeData.publicKey !== publicKey) throw new BadRequestException('Public key mismatch');
    if (!signature || signature.length < 10) throw new BadRequestException('Invalid signature');

    await this.usersService.update(userId, { stellarPublicKey: publicKey });
    return { message: 'Wallet linked successfully', publicKey };
  }
}
