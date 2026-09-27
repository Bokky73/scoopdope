import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { UsersService } from '../users/users.service';
import { EncryptionService } from '../common/encryption.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/audit-log.entity';
import * as crypto from 'crypto';

// Mock the TOTP library
jest.mock('otplib', () => ({
  generateSecret: jest.fn().mockReturnValue('JBSWY3DPEBLW64TMMQ======'),
  generateURI: jest.fn().mockReturnValue('otpauth://totp/scoopdope:test%40example.com?secret=JBSWY3DPEBLW64TMMQ%3D%3D%3D%3D%3D%3D&issuer=scoopdope'),
  verifySync: jest.fn(),
}));

jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHQAAAB0CAMAAAAyHTbWAAAABlBMVEX///8='),
}));

import { verifySync } from 'otplib';

const mockVerifySync = verifySync as jest.MockedFunction<typeof verifySync>;

/**
 * Unit tests for MFA Service
 * Tests all core functionality:
 * - TOTP secret generation
 * - QR code generation
 * - Code verification
 * - Backup code management
 * - Encryption/decryption
 */
describe('MfaService', () => {
  let service: MfaService;
  let mockUsersService: any;
  let mockEncryptionService: any;
  let mockAuditService: any;

  const testSecret = 'JBSWY3DPEBLW64TMMQ======';
  const testUserId = 'test-user-id-123';
  const testEmail = 'user@example.com';

  beforeEach(async () => {
    mockUsersService = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    mockEncryptionService = {
      encrypt: jest.fn((v) => `encrypted(${v})`),
      decrypt: jest.fn((v) => v.replace('encrypted(', '').replace(')', '')),
    };

    mockAuditService = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MfaService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: EncryptionService, useValue: mockEncryptionService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<MfaService>(MfaService);
  });

  describe('Secret Generation', () => {
    it('should generate TOTP secret and QR code', async () => {
      const mockUser = { id: testUserId, email: testEmail };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await service.generateSecret(testUserId);

      expect(result).toHaveProperty('secret');
      expect(result).toHaveProperty('qrCodeDataUrl');
      expect(result.secret).toBe('JBSWY3DPEBLW64TMMQ======');
      expect(result.qrCodeDataUrl).toContain('data:image/png;base64');
    });

    it('should update user with encrypted secret', async () => {
      const mockUser = { id: testUserId, email: testEmail };
      mockUsersService.findById.mockResolvedValue(mockUser);

      await service.generateSecret(testUserId);

      expect(mockUsersService.update).toHaveBeenCalledWith(testUserId, {
        mfaSecret: `encrypted(${testSecret})`,
        mfaEnabled: false,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(service.generateSecret(testUserId)).rejects.toThrow(NotFoundException);
    });

    it('should include email and issuer in QR code otpauth URL', async () => {
      const { generateURI } = require('otplib');
      const mockUser = { id: testUserId, email: testEmail };
      mockUsersService.findById.mockResolvedValue(mockUser);

      await service.generateSecret(testUserId);

      expect(generateURI).toHaveBeenCalledWith({
        label: testEmail,
        issuer: 'scoopdope',
        secret: testSecret,
      });
    });
  });

  describe('Code Verification', () => {
    it('should verify valid TOTP code', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: true });

      const isValid = await service.verifyCode(testUserId, '123456');

      expect(isValid).toBe(true);
      expect(mockEncryptionService.decrypt).toHaveBeenCalledWith(`encrypted(${testSecret})`);
      expect(mockVerifySync).toHaveBeenCalledWith({
        token: '123456',
        secret: testSecret,
      });
    });

    it('should reject invalid TOTP code', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: false });

      const isValid = await service.verifyCode(testUserId, '000000');

      expect(isValid).toBe(false);
    });

    it('should return false if user has no MFA secret', async () => {
      const mockUser = { id: testUserId, email: testEmail, mfaSecret: null };
      mockUsersService.findById.mockResolvedValue(mockUser);

      const isValid = await service.verifyCode(testUserId, '123456');

      expect(isValid).toBe(false);
    });
  });

  describe('MFA Enablement', () => {
    it('should enable MFA with valid code', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
        mfaEnabled: false,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: true });

      const result = await service.verifyAndEnable(testUserId, '123456');

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('MFA enabled successfully');
      expect(result).toHaveProperty('backupCodes');
      expect(Array.isArray(result.backupCodes)).toBe(true);
      expect(result.backupCodes.length).toBe(8);

      // Verify backup codes are hex strings (10 chars each)
      result.backupCodes.forEach((code) => {
        expect(code).toMatch(/^[A-F0-9]{10}$/);
      });
    });

    it('should hash backup codes before storing', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
        mfaEnabled: false,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: true });

      const result = await service.verifyAndEnable(testUserId, '123456');
      const callArgs = mockUsersService.update.mock.calls[0];
      const hashedCodes = callArgs[1].mfaBackupCodes;

      // Verify codes are hashed (64-char hex strings)
      hashedCodes.forEach((hash) => {
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
      });
    });

    it('should log audit event when MFA enabled', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
        mfaEnabled: false,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: true });

      await service.verifyAndEnable(testUserId, '123456');

      expect(mockAuditService.log).toHaveBeenCalledWith(AuditAction.MFA_ENABLED, testUserId, true);
    });

    it('should throw error if MFA setup not initiated', async () => {
      const mockUser = { id: testUserId, email: testEmail, mfaSecret: null };
      mockUsersService.findById.mockResolvedValue(mockUser);

      await expect(service.verifyAndEnable(testUserId, '123456')).rejects.toThrow(BadRequestException);
    });

    it('should throw error if code is invalid', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
        mfaEnabled: false,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: false });

      await expect(service.verifyAndEnable(testUserId, '000000')).rejects.toThrow(BadRequestException);
    });
  });

  describe('Backup Code Management', () => {
    it('should generate 8 unique backup codes', () => {
      const codes = (service as any).generateBackupCodes();

      expect(codes.length).toBe(8);

      // Check all codes are unique
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(8);

      // Check all codes are valid hex format (10 chars uppercase)
      codes.forEach((code) => {
        expect(code).toMatch(/^[A-F0-9]{10}$/);
      });
    });

    it('should generate different codes on multiple calls', () => {
      const codes1 = (service as any).generateBackupCodes();
      const codes2 = (service as any).generateBackupCodes();

      expect(codes1).not.toEqual(codes2);
    });

    it('should regenerate backup codes with valid TOTP', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
        mfaEnabled: true,
        mfaBackupCodes: ['hashedcode1', 'hashedcode2'],
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: true });

      const result = await service.regenerateBackupCodes(testUserId, '123456');

      expect(result).toHaveProperty('backupCodes');
      expect(result.backupCodes.length).toBe(8);
      expect(mockUsersService.update).toHaveBeenCalled();
    });

    it('should not allow backup code regeneration without valid TOTP', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
        mfaEnabled: true,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: false });

      await expect(service.regenerateBackupCodes(testUserId, '000000')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('MFA Disable', () => {
    it('should disable MFA with valid code', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
        mfaEnabled: true,
        mfaBackupCodes: ['hash1', 'hash2'],
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: true });

      const result = await service.disable(testUserId, '123456');

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('MFA disabled successfully');

      // Verify all MFA data is cleared
      expect(mockUsersService.update).toHaveBeenCalledWith(testUserId, {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
      });
    });

    it('should log audit event when MFA disabled', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
        mfaEnabled: true,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: true });

      await service.disable(testUserId, '123456');

      expect(mockAuditService.log).toHaveBeenCalledWith(AuditAction.MFA_DISABLED, testUserId, true);
    });

    it('should throw error if MFA not enabled', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: null,
        mfaEnabled: false,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);

      await expect(service.disable(testUserId, '123456')).rejects.toThrow(BadRequestException);
    });

    it('should throw error if code is invalid', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
        mfaEnabled: true,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: false });

      await expect(service.disable(testUserId, '000000')).rejects.toThrow(BadRequestException);
    });
  });

  describe('Encryption/Decryption', () => {
    it('should encrypt secrets before storing', async () => {
      const mockUser = { id: testUserId, email: testEmail };
      mockUsersService.findById.mockResolvedValue(mockUser);

      await service.generateSecret(testUserId);

      const updateCall = mockUsersService.update.mock.calls[0];
      expect(updateCall[1].mfaSecret).toContain('encrypted');
      expect(updateCall[1].mfaSecret).not.toBe(testSecret);
    });

    it('should decrypt secrets when verifying', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaSecret: `encrypted(${testSecret})`,
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: true });

      await service.verifyCode(testUserId, '123456');

      expect(mockEncryptionService.decrypt).toHaveBeenCalledWith(`encrypted(${testSecret})`);
    });
  });

  describe('Backup Code Recovery', () => {
    it('should use and remove backup code on successful authentication', async () => {
      const testCode = 'ABC123DEF4';
      const testHash = crypto.createHash('sha256').update(testCode).digest('hex');
      const otherHash = crypto.createHash('sha256').update('OTHER1234').digest('hex');

      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaBackupCodes: [testHash, otherHash],
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: false }); // TOTP verification fails

      const result = await service.verifyCode(testUserId, testCode);

      expect(result).toBe(true);

      // Verify the used code is removed
      const updateCall = mockUsersService.update.mock.calls[0];
      const remainingCodes = updateCall[1].mfaBackupCodes;
      expect(remainingCodes).toHaveLength(1);
      expect(remainingCodes[0]).toBe(otherHash);
    });

    it('should reject invalid backup code', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaBackupCodes: ['hash1', 'hash2'],
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: false });

      const result = await service.verifyCode(testUserId, 'INVALID123');

      expect(result).toBe(false);
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should return false if no backup codes remain', async () => {
      const mockUser = {
        id: testUserId,
        email: testEmail,
        mfaBackupCodes: [],
      };
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockVerifySync.mockReturnValue({ valid: false });

      const result = await service.verifyCode(testUserId, 'ANY123CODE');

      expect(result).toBe(false);
    });
  });
});
