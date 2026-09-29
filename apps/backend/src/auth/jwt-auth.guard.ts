import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as Sentry from '@sentry/nestjs';
import { redactJwtPayload } from './jwt-payload-redactor';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (user) {
      // #959 — `user` is the JWT-derived session and carries the account email
      // address. Forward only the allowlisted claims to the error tracker so a
      // crash report cannot be turned into a list of user emails.
      const safeUser = redactJwtPayload(user);
      Sentry.setUser({
        id: safeUser.id as string,
        role: safeUser.role as string,
      });
    } else {
      Sentry.setUser(null);
    }
    return super.handleRequest(err, user, info, context);
  }
}
