/**
 * Shared user-related types used by both frontend and backend.
 * @module user.types
 */

/** Roles available in the platform */
export type UserRole = 'student' | 'instructor' | 'admin';

/**
 * Public-facing user profile data.
 * Safe to expose to the frontend — excludes sensitive fields like passwordHash.
 */
export interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  stellarPublicKey: string | null;
  isVerified: boolean;
  mfaEnabled: boolean;
  referralCode: string | null;
  createdAt: string;
}

/**
 * DTO for updating a user's profile.
 * All fields are optional — only provided fields are updated.
 */
export interface UpdateUserDto {
  /** 3–30 characters */
  username?: string;
  /** Must be a valid URL */
  avatar?: string;
  /** Max 500 characters, HTML stripped */
  bio?: string;
}

/**
 * DTO for user registration.
 */
export interface RegisterDto {
  email: string;
  /** Min 8 characters */
  password: string;
  /** Optional referral code from an existing user */
  referralCode?: string;
}

/**
 * DTO for user login.
 */
export interface LoginDto {
  email: string;
  password: string;
  /** TOTP code or backup code — required if MFA is enabled */
  mfaToken?: string;
}

/**
 * Response returned after a successful login or token refresh.
 */
export interface AuthTokensResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * Response when MFA is required to complete login.
 */
export interface MfaRequiredResponse {
  mfa_required: true;
}

/** Union of possible login responses */
export type LoginResponse = AuthTokensResponse | MfaRequiredResponse;

/**
 * JWT payload decoded from an access token.
 */
export interface JwtPayload {
  /** User ID */
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
