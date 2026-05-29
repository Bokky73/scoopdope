// @ts-nocheck
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { AuthService } from './auth.service';
import { StellarAuthService } from './stellar-auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { PasswordResetToken } from './password-reset-token.entity';
import { RefreshToken } from './refresh-token.entity';
import { ApiKey } from './api-key.entity';
import { EncryptionService } from '../common/encryption.service';
import { ApiKeyStrategy } from './api-key.strategy';
import { ApiKeyAuthGuard } from './api-key-auth.guard';
import { AuditModule } from '../audit/audit.module';
@Module({
  imports: [UsersModule, MailModule, PassportModule, AuditModule, TypeOrmModule.forFeature([PasswordResetToken, RefreshToken, ApiKey]), JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      secret: config.get<string>('jwt.secret'),
      signOptions: {
        expiresIn: '15m'
      }
    })
  })],
  providers: [AuthService, StellarAuthService, JwtStrategy, JwtAuthGuard, RolesGuard, EncryptionService, ApiKeyStrategy, ApiKeyAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard, RolesGuard, ApiKeyAuthGuard]
})
export class AuthModule {}