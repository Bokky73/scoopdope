import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';

/**
 * Guard to restrict access to admin-only endpoints
 */
@Injectable()
export class IsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has admin role
    const isAdmin = user.role === 'admin' || user.roles?.includes('admin');
    
    if (!isAdmin) {
      throw new ForbiddenException('Only administrators can access this resource');
    }

    return true;
  }
}
