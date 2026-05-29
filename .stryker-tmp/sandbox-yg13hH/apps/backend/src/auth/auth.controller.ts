function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { StellarAuthService } from './stellar-auth.service';
import { GoogleAuthGuard } from './google-auth.guard'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { GoogleProfile } from './google.strategy'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
class AuthDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  password: string;
}
class LoginDto extends AuthDto {
  @IsString()
  @IsOptional()
  mfa_token?: string;
}
class ResendVerificationDto {
  @IsEmail()
  email: string;
}
class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
class ResetPasswordDto {
  @IsString()
  token: string;
  @IsString()
  @MinLength(8)
  newPassword: string;
}
class RefreshDto {
  @IsString()
  refresh_token: string;
}
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private stellarAuthService: StellarAuthService) {}
  @Get('stellar')
  @ApiOperation({
    summary: 'SEP-0010: get challenge transaction'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns unsigned challenge XDR and network passphrase'
  })
  stellarChallenge(@Query('account')
  account: string) {
    if (stryMutAct_9fa48("726")) {
      {}
    } else {
      stryCov_9fa48("726");
      return this.stellarAuthService.buildChallenge(account);
    }
  }
  @Post('stellar')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000
    }
  })
  @ApiOperation({
    summary: 'SEP-0010: verify signed challenge and receive JWT'
  })
  @ApiResponse({
    status: 201,
    description: 'Returns access_token'
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired challenge'
  })
  stellarVerify(@Body('transaction')
  transaction: string) {
    if (stryMutAct_9fa48("727")) {
      {}
    } else {
      stryCov_9fa48("727");
      return this.stellarAuthService.verifyChallenge(transaction);
    }
  }
  @Post('register')
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000
    }
  })
  @ApiOperation({
    summary: 'Register a new user'
  })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        password: 'password123'
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        access_token: 'jwt',
        refresh_token: 'token'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input'
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists'
  })
  register(@Body()
  dto: AuthDto, @Query('ref')
  ref?: string) {
    if (stryMutAct_9fa48("728")) {
      {}
    } else {
      stryCov_9fa48("728");
      return this.authService.register(dto.email, dto.password, ref);
    }
  }
  @Post('login')
  @Throttle({
    default: {
      limit: 5,
      ttl: 60000
    }
  })
  @ApiOperation({
    summary: 'Login with email and password'
  })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com',
        password: 'password123'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'jwt',
        refresh_token: 'token'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials'
  })
  login(@Body()
  dto: LoginDto) {
    if (stryMutAct_9fa48("729")) {
      {}
    } else {
      stryCov_9fa48("729");
      return this.authService.login(dto.email, dto.password, dto.mfa_token);
    }
  }
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token'
  })
  @ApiBody({
    schema: {
      example: {
        refresh_token: 'token'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'New access token issued',
    schema: {
      example: {
        access_token: 'jwt'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token'
  })
  refresh(@Body()
  dto: RefreshDto) {
    if (stryMutAct_9fa48("730")) {
      {}
    } else {
      stryCov_9fa48("730");
      return this.authService.refresh(dto.refresh_token);
    }
  }
  @Post('logout')
  @ApiOperation({
    summary: 'Logout and invalidate refresh token'
  })
  @ApiBody({
    schema: {
      example: {
        refresh_token: 'token'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully'
  })
  logout(@Body()
  dto: RefreshDto) {
    if (stryMutAct_9fa48("731")) {
      {}
    } else {
      stryCov_9fa48("731");
      return this.authService.logout(dto.refresh_token);
    }
  }
  @Get('verify')
  @ApiOperation({
    summary: 'Verify email address via token'
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token'
  })
  verifyEmail(@Query('token')
  token: string) {
    if (stryMutAct_9fa48("732")) {
      {}
    } else {
      stryCov_9fa48("732");
      return this.authService.verifyEmail(token);
    }
  }
  @Post('resend-verification')
  @ApiOperation({
    summary: 'Resend email verification link'
  })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  resendVerification(@Body()
  dto: ResendVerificationDto) {
    if (stryMutAct_9fa48("733")) {
      {}
    } else {
      stryCov_9fa48("733");
      return this.authService.resendVerification(dto.email);
    }
  }
  @Throttle({
    default: {
      limit: 3,
      ttl: 3600000
    }
  })
  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request a password reset email'
  })
  @ApiBody({
    schema: {
      example: {
        email: 'user@example.com'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  forgotPassword(@Body()
  dto: ForgotPasswordDto) {
    if (stryMutAct_9fa48("734")) {
      {}
    } else {
      stryCov_9fa48("734");
      return this.authService.forgotPassword(dto.email);
    }
  }
  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password using token'
  })
  @ApiBody({
    schema: {
      example: {
        token: 'reset-token',
        newPassword: 'newpassword123'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token'
  })
  resetPassword(@Body()
  dto: ResetPasswordDto) {
    if (stryMutAct_9fa48("735")) {
      {}
    } else {
      stryCov_9fa48("735");
      return this.authService.resetPassword(dto.token, dto.newPassword);
    }
  }
  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  enableMfa(@Req()
  req) {
    if (stryMutAct_9fa48("736")) {
      {}
    } else {
      stryCov_9fa48("736");
      return this.authService.generateMfaSecret(req.user.id);
    }
  }
  @Post('mfa/verify')
  @UseGuards(JwtAuthGuard)
  verifyMfa(@Req()
  req, @Body('code')
  code: string) {
    if (stryMutAct_9fa48("737")) {
      {}
    } else {
      stryCov_9fa48("737");
      return this.authService.verifyMfaSecret(req.user.id, code);
    }
  }
  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard)
  disableMfa(@Req()
  req, @Body('code')
  code: string) {
    if (stryMutAct_9fa48("738")) {
      {}
    } else {
      stryCov_9fa48("738");
      return this.authService.disableMfa(req.user.id, code);
    }
  }
  @Post('mfa/backup-codes/regenerate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Regenerate backup codes (requires valid TOTP)'
  })
  regenerateBackupCodes(@Req()
  req, @Body('code')
  code: string) {
    if (stryMutAct_9fa48("739")) {
      {}
    } else {
      stryCov_9fa48("739");
      return this.authService.regenerateBackupCodes(req.user.id, code);
    }
  }
  @Post('admin/api-keys')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  generateApiKey(@Body('userId')
  userId: string, @Body('name')
  name: string) {
    if (stryMutAct_9fa48("740")) {
      {}
    } else {
      stryCov_9fa48("740");
      return this.authService.generateApiKey(userId, name);
    }
  }
  @Post('admin/api-keys/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  revokeApiKey(@Body('id')
  id: string) {
    if (stryMutAct_9fa48("741")) {
      {}
    } else {
      stryCov_9fa48("741");
      return this.authService.revokeApiKey(id);
    }
  }
  @Post('stellar-challenge')
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000
    }
  })
  @ApiOperation({
    summary: 'Generate a challenge for Stellar wallet signing'
  })
  @ApiResponse({
    status: 200,
    description: 'Challenge generated successfully'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  generateStellarChallenge(@Body('publicKey')
  publicKey: string) {
    if (stryMutAct_9fa48("742")) {
      {}
    } else {
      stryCov_9fa48("742");
      return this.authService.generateStellarChallenge(publicKey);
    }
  }
  @Post('stellar-verify')
  @UseGuards(JwtAuthGuard)
  @Throttle({
    default: {
      limit: 10,
      ttl: 60000
    }
  })
  @ApiOperation({
    summary: 'Verify Stellar wallet signature and link to account'
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet linked successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid signature or challenge'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  verifyStellarSignature(@Req()
  req, @Body('publicKey')
  publicKey: string, @Body('signature')
  signature: string, @Body('challenge')
  challenge: string) {
    if (stryMutAct_9fa48("743")) {
      {}
    } else {
      stryCov_9fa48("743");
      return this.authService.verifyStellarSignature(req.user.id, publicKey, signature, challenge);
    }
  }
}