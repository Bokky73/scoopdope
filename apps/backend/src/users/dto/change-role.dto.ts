import { IsEnum } from 'class-validator';

/**
 * Platform roles a user can hold. Kept in sync with the string literals used by
 * the `@Roles()` decorator across controllers ('admin', 'instructor', 'student').
 */
export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

export class ChangeRoleDto {
  @IsEnum(UserRole, {
    message: 'role must be one of: student, instructor, admin',
  })
  role: UserRole;
}
