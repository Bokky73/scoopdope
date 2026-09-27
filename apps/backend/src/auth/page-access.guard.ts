import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const PAGE_ACCESS_KEY = 'page_access';

/**
 * Decorator for enforcing page-level role-based access control.
 * Returns 403 Forbidden if user role doesn't match allowed roles.
 * 
 * @example
 * @PageAccess('student', 'instructor')
 * @Get()
 * getPage() { }
 */
export const PageAccess = (...roles: string[]) => {
  return (target: any, key?: any, descriptor?: any) => {
    Reflect.setMetadata(PAGE_ACCESS_KEY, roles, descriptor?.value || target);
    return descriptor || target;
  };
};

@Injectable()
export class PageAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(PAGE_ACCESS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no PAGE_ACCESS is set, allow access
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.role) {
      throw new ForbiddenException('User role is missing');
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${user.role}`
      );
    }

    return true;
  }
}
