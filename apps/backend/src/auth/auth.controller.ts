import { Body, Controller, Get, Post, Query, Redirect, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { RateLimit } from '../rate-limit/rate-limit.decorator';
import { AUTH_RATE_LIMIT } from '../rate-limit/rate-limit.constants';
import { AuthService } from './auth.service';
import { StellarAuthService } from './stellar-auth.service';
import { GoogleAuthGuard } from './google-auth.guard';
import { GoogleProfile } from './google.strategy';
import { MicrosoftAuthGuard } from './microsoft-auth.guard';
import { MicrosoftProfile } from './microsoft.strategy';
import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UserDeactivationService } from '../user-deactivation/user-deactivation.service';

class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Valid email address for the new account',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Str0ngPass!',
    description:
      'Password — minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, and one number',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
}

class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Registered email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Str0ngPass!',
    description: 'Account password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '123456',
    description: 'TOTP code required only when MFA is enabled on the account',
    required: false,
  })
  @IsString()
  @IsOptional()
  mfa_token?: string;
}

class ResendVerificationDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail() email: string;
}

class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail() email: string;
}

class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-here' })
  @IsString() token: string;

  @ApiProperty({ example: 'NewStr0ng!', minLength: 8 })
  @IsString() @MinLength(8) newPassword: string;
}

class RefreshDto {
  @ApiProperty({ example: 'refresh-token-here' })
  @IsString() refresh_token: string;
}

@ApiTags('auth')
@RateLimit(AUTH_RATE_LIMIT)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private stellarAuthService: StellarAuthService,
    private configService: ConfigService,
    private userDeactivationService: UserDeactivationService,
  ) {}

  /**
   * Validates a redirect URI against the configured whitelist of allowed
   * frontend origins. Prevents open-redirect attacks on the OAuth callback.
   * Returns the whitelisted origin when valid, otherwise the safe default.
   */
  private resolveSafeRedirectUri(candidate?: string): string {
    const defaultUrl = this.configService.get<string>('frontend.url');
    const whitelist = this.configService.get<string[]>('frontend.allowedRedirectOrigins') ?? [];

    if (!candidate) {
      return defaultUrl;
    }

    try {
      const parsed = new URL(candidate);
      const isAllowed = whitelist.some((allowed) => {
        try {
          return new URL(allowed).origin === parsed.origin;
        } catch {
          return false;
        }
      });
      return isAllowed ? parsed.origin : defaultUrl;
    } catch {
      return defaultUrl;
    }
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth consent screen' })
  googleLogin() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @Redirect()
  @ApiOperation({ summary: 'Google OAuth callback — issues JWT and redirects to frontend' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  async googleCallback(@Req() req: { user: GoogleProfile }, @Query('redirect_uri') redirectUri?: string) {
    const tokens = await this.authService.googleOAuthLogin(req.user);
    const safeOrigin = this.resolveSafeRedirectUri(redirectUri);
    return {
      url: `${safeOrigin}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
    };
  }

  @Get('microsoft')
  @UseGuards(MicrosoftAuthGuard)
  @ApiOperation({ summary: 'Initiate Microsoft OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Microsoft OAuth consent screen' })
  microsoftLogin() {
    // Guard redirects to Microsoft
  }

  @Get('microsoft/callback')
  @UseGuards(MicrosoftAuthGuard)
  @Redirect()
  @ApiOperation({ summary: 'Microsoft OAuth callback — issues JWT and redirects to frontend' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  async microsoftCallback(@Req() req: { user: MicrosoftProfile }) {
    const tokens = await this.authService.microsoftOAuthLogin(req.user);
    const frontendUrl = this.configService.get<string>('frontend.url');
    return {
      url: `${frontendUrl}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
    };
  }

  @Get('stellar')
  @ApiOperation({ summary: 'SEP-0010: get challenge transaction' })
  @ApiResponse({
    status: 200,
    description: 'Returns unsigned challenge XDR and network passphrase',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  stellarChallenge(@Query('account') account: string) {
    return this.stellarAuthService.buildChallenge(account);
  }

  @Post('stellar')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @RateLimit(AUTH_RATE_LIMIT)
  @ApiOperation({ summary: 'SEP-0010: verify signed challenge and receive JWT' })
  @ApiResponse({ status: 201, description: 'Returns access_token' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Invalid or expired challenge' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  stellarVerify(@Body('transaction') transaction: string) {
    return this.stellarAuthService.verifyChallenge(transaction);
  }

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @RateLimit({ limit: 5, windowMs: 60000 })
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new account. Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, and one number. Returns a JWT access token and the new user ID on success.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully — returns JWT tokens and user ID',
    schema: {
      example: {
        userId: 'uuid-here',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'opaque-refresh-token',
        message: 'Registration successful. Please verify your email.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error — invalid email or weak password' })
  @ApiResponse({ status: 409, description: 'Conflict — email address already registered' })
  @ApiResponse({ status: 429, description: 'Too many requests — rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  register(@Body() dto: RegisterDto, @Query('ref') ref?: string) {
    return this.authService.register(dto.email, dto.password, ref);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @RateLimit({ limit: 5, windowMs: 60000 })
  @ApiOperation({
    summary: 'Login with email and password',
    description:
      'Authenticates a user and returns JWT tokens along with the user profile. Rate-limited to 5 attempts per minute per IP to prevent brute-force attacks. Returns 401 for both unknown email and incorrect password to avoid user enumeration.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful — returns JWT tokens and user profile',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'opaque-refresh-token',
        user: {
          id: 'uuid-here',
          email: 'user@example.com',
          role: 'user',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests — rate limit exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.mfa_token);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, description: 'Returns new access token' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@Req() req: { user: { id: string } }) {
    return this.authService.logout(req.user.id);
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({ status: 200, description: 'Verification email sent if account exists' })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('deactivate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate the current user account' })
  @ApiResponse({ status: 200, description: 'Account deactivated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deactivate(@Req() req: { user: { id: string } }) {
    return this.userDeactivationService.deactivate(req.user.id);
  }

  @Post('admin/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a user account (admin only)' })
  @ApiResponse({ status: 200, description: 'Account deactivated' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  adminDeactivate(@Body('userId') userId: string) {
    return this.userDeactivationService.deactivate(userId);
  }
}
