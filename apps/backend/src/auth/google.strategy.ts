import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

export interface GoogleProfile {
  id: string;
  email: string;
  displayName: string;
  picture: string;
}

const DEFAULT_ALLOWED_REDIRECT_ORIGINS = ['http://localhost:3000'];

/**
 * Validates a post-login redirect URI against a whitelist of allowed origins.
 * Returns the redirect URI when it is safe, otherwise falls back to the
 * configured default (or the first allowed origin).
 */
export function resolveSafeRedirectUri(
  redirectUri: string | undefined,
  allowedOrigins: string[],
  fallback: string,
): string {
  if (!redirectUri) {
    return fallback;
  }

  try {
    const parsed = new URL(redirectUri);
    const isAllowed = allowedOrigins.some((origin) => {
      try {
        return new URL(origin).origin === parsed.origin;
      } catch {
        return false;
      }
    });
    return isAllowed ? redirectUri : fallback;
  } catch {
    return fallback;
  }
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly allowedRedirectOrigins: string[];
  private readonly defaultRedirectUri: string;

  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('google.clientId'),
      clientSecret: configService.get<string>('google.clientSecret'),
      callbackURL: configService.get<string>('google.callbackUrl'),
      scope: ['email', 'profile'],
    });

    const configuredOrigins = configService.get<string>('google.allowedRedirectOrigins');
    this.allowedRedirectOrigins = configuredOrigins
      ? configuredOrigins
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean)
      : DEFAULT_ALLOWED_REDIRECT_ORIGINS;

    this.defaultRedirectUri =
      configService.get<string>('google.defaultRedirectUri') ??
      this.allowedRedirectOrigins[0];
  }

  /**
   * Validates the requested redirect URI against the whitelist before it is
   * used, preventing open redirects in the Google OAuth callback flow.
   */
  getSafeRedirectUri(redirectUri?: string): string {
    return resolveSafeRedirectUri(
      redirectUri,
      this.allowedRedirectOrigins,
      this.defaultRedirectUri,
    );
  }

  validate(_accessToken: string, _refreshToken: string, profile: any, done: VerifyCallback) {
    const googleProfile: GoogleProfile = {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      displayName: profile.displayName,
      picture: profile.photos?.[0]?.value,
    };
    done(null, googleProfile);
  }
}
