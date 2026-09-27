import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';

export interface MicrosoftProfile {
  id: string;
  email: string;
  displayName: string;
  picture?: string;
}

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('microsoft.clientId'),
      clientSecret: configService.get<string>('microsoft.clientSecret'),
      callbackURL: configService.get<string>('microsoft.callbackUrl'),
      scope: ['user.read'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (error: unknown, user?: MicrosoftProfile | false) => void,
  ) {
    const email =
      profile.emails?.[0]?.value ??
      profile._json?.mail ??
      profile._json?.userPrincipalName;

    if (!email) {
      return done(new Error('No email returned from Microsoft'), false);
    }

    const microsoftProfile: MicrosoftProfile = {
      id: profile.id,
      email,
      displayName: profile.displayName,
      picture: profile.photos?.[0]?.value,
    };

    done(null, microsoftProfile);
  }
}
