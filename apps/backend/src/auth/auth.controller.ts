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
  async googleCallback(@Req() req: { user: GoogleProfile }) {
    const tokens = await this.authService.googleOAuthLogin(req.user);
    const frontendUrl = this.configService.get<string>('frontend.url');
    return {
      url: `${frontendUrl}/auth/callback?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}`,
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
    description: 'Login successful — returns JWT tokens and user object',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'opaque-refresh-token',
        user: {
          id: 'uuid-here',
          email: 'user@example.com',
          role: 'student',
          isVerified: true,
          avatar: null,
          username: null,
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request — missing or invalid fields' })
  @ApiResponse({ status: 401, description: 'Unauthorized — invalid email or incorrect password' })
  @ApiResponse({ status: 403, description: 'Forbidden — unverified email or admin MFA not set up' })
  @ApiResponse({ status: 429, description: 'Too many requests — rate limit of 5 per minute exceeded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  login(@Body() dto: LoginDto, @Req() req: { ip: string; headers: Record<string, string> }) {
    return this.authService.login(
      dto.email,
      dto.password,
      dto.mfa_token,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ schema: { example: { refresh_token: 'token' } } })
  @ApiResponse({
    status: 200,
    description: 'New access token issued',
    schema: { example: { access_token: 'jwt' } },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiBody({ schema: { example: { refresh_token: 'token' } } })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refresh_token);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify email address via token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification link' })
  @ApiBody({ schema: { example: { email: 'user@example.com' } } })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto.email);
  }

  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @RateLimit({ limit: 3, windowMs: 3600000 })
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiBody({ schema: { example: { email: 'user@example.com' } } })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiBody({ schema: { example: { token: 'reset-token', newPassword: 'newpassword123' } } })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable MFA - generate TOTP secret' })
  @ApiResponse({ status: 200, description: 'Returns TOTP secret and QR code URL' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  enableMfa(@Req() req: { user: { id: string } }) {
    return this.authService.generateMfaSecret(req.user.id);
  }

  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify MFA code and enable TOTP' })
  @ApiResponse({ status: 200, description: 'MFA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  verifyMfa(@Req() req: { user: { id: string } }, @Body('code') code: string) {
    return this.authService.verifyMfaSecret(req.user.id, code);
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable MFA' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  disableMfa(@Req() req: { user: { id: string } }, @Body('code') code: string) {
    return this.authService.disableMfa(req.user.id, code);
  }

  @Post('mfa/backup-codes/regenerate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Regenerate backup codes (requires valid TOTP)' })
  @ApiResponse({ status: 200, description: 'Backup codes regenerated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  regenerateBackupCodes(@Req() req: { user: { id: string } }, @Body('code') code: string) {
    return this.authService.regenerateBackupCodes(req.user.id, code);
  }

  @Post('admin/api-keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate an API key for a user (admin)' })
  @ApiResponse({ status: 201, description: 'API key generated' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  generateApiKey(@Body('userId') userId: string, @Body('name') name: string) {
    return this.authService.generateApiKey(userId, name);
  }

  @Post('admin/api-keys/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke an API key (admin)' })
  @ApiResponse({ status: 200, description: 'API key revoked' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  revokeApiKey(@Body('id') id: string) {
    return this.authService.revokeApiKey(id);
  }

  @Post('stellar-challenge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate a challenge for Stellar wallet signing' })
  @ApiResponse({ status: 200, description: 'Challenge generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  generateStellarChallenge(@Body('publicKey') publicKey: string) {
    return this.authService.generateStellarChallenge(publicKey);
  }

  @Post('stellar-verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify Stellar wallet signature and link to account' })
  @ApiResponse({ status: 200, description: 'Wallet linked successfully' })
  @ApiResponse({ status: 400, description: 'Invalid signature or challenge' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  verifyStellarSignature(
    @Req() req: { user: { id: string } },
    @Body('publicKey') publicKey: string,
    @Body('signature') signature: string,
    @Body('challenge') challenge: string
  ) {
    return this.authService.verifyStellarSignature(req.user.id, publicKey, signature, challenge);
  }

  /**
   * POST /v1/auth/reactivate
   *
   * #872 – Account Reactivation
   * No authentication required. Accepts a single-use token sent via email
   * and re-enables the deactivated account.
   *
   * Rate-limited to 10 attempts / hour to prevent brute-force attacks.
   */
  @Post('reactivate')
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @ApiOperation({ summary: 'Reactivate a deactivated account via email token' })
  @ApiBody({ schema: { example: { token: 'hex-token-from-email' } } })
  @ApiResponse({ status: 200, description: 'Account reactivated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired reactivation token' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async reactivate(@Body('token') token: string) {
    if (!token) {
      return { success: false, message: 'Reactivation token is required' };
    }
    try {
      const user = await this.userDeactivationService.reactivate(token);
      return {
        success: true,
        message: 'Your account has been reactivated. You can now log in.',
        userId: user.id,
      };
    } catch (err: any) {
      return { success: false, message: err?.message ?? 'Reactivation failed' };
    }
  }
}
