import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Same JWT strategy as JwtAuthGuard, but never rejects the request when no
 * (or an invalid) token is present — `req.user` is simply left undefined.
 * Used on endpoints that are publicly viewable but tailor their response
 * (e.g. hiding private fields) when the caller happens to be authenticated.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    return user || undefined;
  }
}
