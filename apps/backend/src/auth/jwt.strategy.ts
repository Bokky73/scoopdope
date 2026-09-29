import { Injectable, Inject, Logger, Optional } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UsersService } from '../users/users.service';
import { formatJwtPayloadForLog } from './jwt-payload-redactor';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    @Optional() @Inject(CACHE_MANAGER) private cacheManager?: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: { sub: string; email: string; role?: string }) {
    const cacheKey = `session:${payload.sub}`;
    // #959 — the claims are logged through the redactor, so the `email` claim
    // is reported as withheld rather than written to the log.
    const claims = formatJwtPayloadForLog(payload);
    if (this.cacheManager) {
      try {
        const session = await this.cacheManager.get<{ id: string; email: string; role: string }>(cacheKey);
        if (session) {
          await this.cacheManager.set(cacheKey, session, 24 * 60 * 60 * 1000);
          this.logger.debug(`Session cache hit for user ${payload.sub} ${claims}`);
          return session;
        }
        this.logger.debug(`Session cache miss for user ${payload.sub} ${claims}`);
      } catch (error) {
        this.logger.warn(`Session cache unavailable; using database: ${(error as Error).message}`);
      }
    }

    // The session is handed to controllers via @CurrentUser(), so `email` is
    // part of its contract — it is simply never logged or forwarded anywhere.
    const user = await this.usersService.findById(payload.sub);
    const session = { id: payload.sub, email: user?.email || payload.email, role: user?.role || payload.role || 'student' };
    try {
      await this.cacheManager?.set(cacheKey, session, 24 * 60 * 60 * 1000);
    } catch (error) {
      this.logger.warn(`Unable to cache user session: ${(error as Error).message}`);
    }
    return session;
  }
}
