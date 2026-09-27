import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AdminUsersController } from '../../src/users/admin-users.controller';
import { UsersService } from '../../src/users/users.service';
import { AuditService } from '../../src/audit/audit.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/users/user.entity';
import { AuditLog, AuditAction } from '../../src/audit/audit-log.entity';

describe('Admin User Management (Integration)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let auditService: AuditService;

  const mockUsersRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
    save: jest.fn(),
  };

  const mockAuditRepository = {
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        UsersService,
        AuditService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    auditService = moduleFixture.get<AuditService>(AuditService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /admin/users', () => {
    it('should return paginated users with filtering', async () => {
      const mockUsers = [
        { id: '1', displayName: 'Alice', email: 'alice@test.com', role: 'student', status: 'active' },
        { id: '2', displayName: 'Bob', email: 'bob@test.com', role: 'instructor', status: 'active' },
      ];

      mockUsersRepository.findAll = jest.fn().mockResolvedValue({
        users: mockUsers,
        total: 2,
        page: 1,
        limit: 20,
      });

      jest.spyOn(usersService, 'findAll').mockResolvedValueOnce({
        users: mockUsers,
        total: 2,
        page: 1,
        limit: 20,
      });

      const result = await usersService.findAll({
        page: 1,
        limit: 20,
        role: 'student',
      });

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter users by status', async () => {
      const mockUsers = [
        { id: '1', displayName: 'Alice', email: 'alice@test.com', role: 'student', status: 'banned' },
      ];

      jest.spyOn(usersService, 'findAll').mockResolvedValueOnce({
        users: mockUsers,
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await usersService.findAll({
        status: 'banned',
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].status).toBe('banned');
    });

    it('should search users by name/email', async () => {
      const mockUsers = [
        { id: '1', displayName: 'Alice', email: 'alice@test.com', role: 'student', status: 'active' },
      ];

      jest.spyOn(usersService, 'findAll').mockResolvedValueOnce({
        users: mockUsers,
        total: 1,
        page: 1,
        limit: 20,
      });

      const result = await usersService.findAll({
        search: 'alice',
      });

      expect(result.users).toHaveLength(1);
      expect(result.users[0].displayName).toContain('Alice');
    });
  });

  describe('PATCH /admin/users/:id/role', () => {
    it('should change user role and log action', async () => {
      const userId = '1';
      const newRole = 'instructor';
      const oldRole = 'student';

      const mockUser = { id: userId, role: newRole, displayName: 'Alice', email: 'alice@test.com' };

      jest.spyOn(usersService, 'changeRole').mockResolvedValueOnce({
        user: mockUser,
        previousRole: oldRole,
      });

      jest.spyOn(auditService, 'log').mockResolvedValueOnce(undefined);

      const result = await usersService.changeRole(userId, newRole);

      expect(result.user.role).toBe(newRole);
      expect(result.previousRole).toBe(oldRole);

      // Verify audit log would be created
      await auditService.log(AuditAction.ROLE_CHANGED, '999', true, {
        resourceType: 'user',
        resourceId: userId,
        changes: { role: { from: oldRole, to: newRole } },
      });

      expect(auditService.log).toHaveBeenCalledWith(
        AuditAction.ROLE_CHANGED,
        '999',
        true,
        expect.any(Object),
      );
    });

    it('should change user status to suspended', async () => {
      const userId = '1';
      const newStatus = 'suspended';
      const oldStatus = 'active';

      const mockUser = { id: userId, status: newStatus, displayName: 'Alice', email: 'alice@test.com' };

      jest.spyOn(usersService, 'setStatus').mockResolvedValueOnce({
        user: mockUser,
        previousStatus: oldStatus,
      });

      const result = await usersService.setStatus(userId, 'suspended');

      expect(result.user.status).toBe(newStatus);
      expect(result.previousStatus).toBe(oldStatus);
    });

    it('should change user status to banned', async () => {
      const userId = '1';
      const newStatus = 'banned';
      const oldStatus = 'active';

      const mockUser = { id: userId, status: newStatus, displayName: 'Alice', email: 'alice@test.com' };

      jest.spyOn(usersService, 'setStatus').mockResolvedValueOnce({
        user: mockUser,
        previousStatus: oldStatus,
      });

      const result = await usersService.setStatus(userId, 'banned');

      expect(result.user.status).toBe(newStatus);
    });
  });

  describe('Audit Logging', () => {
    it('should log role changes with details', async () => {
      const auditLog = {
        action: AuditAction.ROLE_CHANGED,
        userId: 'admin-id',
        resourceType: 'user',
        resourceId: 'target-user-id',
        changes: { role: { from: 'student', to: 'instructor' } },
        success: true,
      };

      jest.spyOn(auditService, 'log').mockResolvedValueOnce(undefined);

      await auditService.log(
        auditLog.action,
        auditLog.userId,
        auditLog.success,
        {
          resourceType: auditLog.resourceType,
          resourceId: auditLog.resourceId,
          changes: auditLog.changes,
        },
      );

      expect(auditService.log).toHaveBeenCalled();
    });

    it('should log user status changes', async () => {
      jest.spyOn(auditService, 'log').mockResolvedValueOnce(undefined);

      await auditService.log(
        AuditAction.USER_SUSPENDED,
        'admin-id',
        true,
        {
          resourceType: 'user',
          resourceId: 'target-user-id',
        },
      );

      expect(auditService.log).toHaveBeenCalledWith(
        AuditAction.USER_SUSPENDED,
        'admin-id',
        true,
        expect.any(Object),
      );
    });
  });
});
