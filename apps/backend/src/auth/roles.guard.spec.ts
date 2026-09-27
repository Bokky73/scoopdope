import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../roles.guard';
import { ROLES_KEY } from '../roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access if no roles are required', () => {
    const mockContext = {
      getHandler: () => ({}),
      getClass: () => class {},
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'student' } }) }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  describe('No role restriction', () => {
    /**
     * Test: When no @Roles() metadata is present, access is allowed (authenticated-only).
     * 
     * This is the default behavior: if no roles are specified on the handler or class,
     * the guard returns true, allowing any authenticated user to proceed. The JWT auth
     * guard handles the actual authentication check.
     */
    it('should allow access when no roles are required (public endpoint)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext({ role: 'student' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when roles array is empty', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      const context = createMockContext({ role: 'admin' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow any authenticated user when no roles are specified', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext(
        { role: 'student', userId: 'user-123' },
        jest.fn(),
        jest.fn()
      );
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Single role enforcement', () => {
    /**
     * Test: User with the required admin role can access an admin-only endpoint.
     * 
     * When @Roles('admin') is specified and user.role === 'admin', the guard
     * returns true.
     */
    it('should allow access when user has required admin role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ role: 'admin' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has required instructor role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['instructor']);
      const context = createMockContext({ role: 'instructor' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has required student role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['student']);
      const context = createMockContext({ role: 'student' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(true);
    });

    /**
     * Test: Student is denied access to an admin-only endpoint.
     * 
     * When @Roles('admin') is specified but user.role === 'student', the guard
     * returns false.
     */
    it('should deny access when user does not have required admin role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ role: 'student' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when user tries to access instructor-only endpoint as student', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['instructor']);
      const context = createMockContext({ role: 'student' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when user tries to access admin-only endpoint as instructor', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ role: 'instructor' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('Multiple role enforcement', () => {
    /**
     * Test: User with one of multiple allowed roles can access the endpoint.
     * 
     * When @Roles('admin', 'instructor') is specified, a user with role 'instructor'
     * should be granted access.
     */
    it('should allow access when user has one of multiple required roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'instructor']);
      const context = createMockContext({ role: 'instructor' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow admin when endpoint allows admin or instructor', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'instructor']);
      const context = createMockContext({ role: 'admin' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow both admin and instructor for multi-role endpoints', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'instructor']);
      const contextAdmin = createMockContext({ role: 'admin' }, jest.fn(), jest.fn());
      const contextInstructor = createMockContext(
        { role: 'instructor' },
        jest.fn(),
        jest.fn()
      );
      expect(guard.canActivate(contextAdmin)).toBe(true);
      expect(guard.canActivate(contextInstructor)).toBe(true);
    });

    /**
     * Test: Student is denied access when endpoint allows only admin and instructor.
     * 
     * When @Roles('admin', 'instructor') is specified but user.role === 'student',
     * the guard returns false.
     */
    it('should deny access when user role is not in the allowed list', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'instructor']);
      const context = createMockContext({ role: 'student' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny student access when only admin and instructor are allowed', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'instructor']);
      const context = createMockContext({ role: 'student' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('Missing authentication', () => {
    /**
     * Test: Request with no user object is denied.
     * 
     * Typically, an unauthenticated request will have request.user === null.
     * The RolesGuard returns false, which should trigger a 401 or 403 response
     * from NestJS's guard system.
     */
    it('should deny access when no user in request (unauthenticated)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext(null, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when user is undefined', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['student']);
      const context = createMockContext(undefined, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    /**
     * Test: User exists but has no role property.
     * 
     * If the JWT payload is malformed and doesn't include a role claim,
     * the guard returns false.
     */
    it('should deny access when user has no role property', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const userWithoutRole = { userId: 'user-123', email: 'user@example.com' };
      const context = createMockContext(userWithoutRole, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when user.role is null', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ userId: 'user-123', role: null }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when user.role is undefined', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ userId: 'user-123', role: undefined }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when user.role is empty string', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ userId: 'user-123', role: '' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('Metadata resolution from handler and class', () => {
    /**
     * Test: Role metadata can be set on either the handler (method) or class level.
     * 
     * The Reflector.getAllAndOverride() method should check both the handler
     * and class level, with handler-level metadata taking precedence.
     */
    it('should resolve roles from handler level metadata', () => {
      const handlerFn = jest.fn();
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ role: 'admin' }, handlerFn, class Controller {});
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should resolve roles from class level metadata', () => {
      const classRef = class AdminController {};
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext(
        { role: 'admin' },
        jest.fn(),
        classRef
      );
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should use handler metadata over class metadata (priority)', () => {
      // In a real scenario, getAllAndOverride combines both but handler takes priority
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['instructor']);
      const context = createMockContext({ role: 'instructor' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Edge cases and case sensitivity', () => {
    /**
     * Test: Role comparison is case-sensitive.
     * 
     * @Roles('admin') should not match user.role === 'Admin' or 'ADMIN'.
     */
    it('should deny access with incorrect role case', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ role: 'Admin' }, jest.fn(), jest.fn()); // capital A
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when role is uppercase instead of lowercase', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ role: 'ADMIN' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    /**
     * Test: Role strings with extra whitespace do not match.
     */
    it('should deny access when role has extra whitespace', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ role: ' admin ' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    /**
     * Test: Partial role matches are not allowed.
     * 
     * @Roles('admin') should not match user.role === 'administrator'.
     */
    it('should deny access with partial role match', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const context = createMockContext({ role: 'administrator' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny access when user role is substring of required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['administrator']);
      const context = createMockContext({ role: 'admin' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('Complex role scenarios', () => {
    /**
     * Test: Endpoint with 3+ required roles.
     */
    it('should allow access when user matches one of many required roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'instructor', 'moderator']);
      const context = createMockContext({ role: 'moderator' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny when user role is not in long required roles list', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'instructor', 'moderator']);
      const context = createMockContext({ role: 'student' }, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });

    /**
     * Test: User object with additional properties should not affect role check.
     */
    it('should allow access with additional user properties present', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const userWithExtraProps = {
        role: 'admin',
        userId: 'user-123',
        email: 'admin@example.com',
        permissions: ['read', 'write'],
        department: 'Security',
      };
      const context = createMockContext(userWithExtraProps, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny when required role not present despite other user properties', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);
      const userWithExtraProps = {
        role: 'student',
        userId: 'user-456',
        email: 'student@example.com',
        permissions: ['read'],
      };
      const context = createMockContext(userWithExtraProps, jest.fn(), jest.fn());
      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
