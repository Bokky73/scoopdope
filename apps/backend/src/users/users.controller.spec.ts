import { ForbiddenException } from '@nestjs/common';
import { UsersController, AdminUsersController } from './users.controller';

describe('UsersController', () => {
  const mockService = {
    findById: jest.fn(),
    getPublicProfile: jest.fn(),
    update: jest.fn(),
    changeRole: jest.fn(),
  };
  const mockAuditService = {
    log: jest.fn(),
  };
  let controller: UsersController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersController(mockService as any, mockService as any, mockAuditService as any);
  });

  it('findOne should return a public profile', async () => {
    const profile = { id: '1', username: 'u', role: 'student' };
    mockService.getPublicProfile.mockResolvedValue(profile);

    await expect(controller.findOne('1', {})).resolves.toEqual(profile);
    expect(mockService.getPublicProfile).toHaveBeenCalledWith('1', undefined);
  });

  it('findOne should pass the viewer id when authenticated', async () => {
    const profile = { id: '1', username: 'u', role: 'student', email: 'u@example.com' };
    mockService.getPublicProfile.mockResolvedValue(profile);

    await expect(controller.findOne('1', { user: { id: '1' } })).resolves.toEqual(profile);
    expect(mockService.getPublicProfile).toHaveBeenCalledWith('1', '1');
  });

  it('update should update when same user id', async () => {
    const dto = { username: 'TestUser' };
    mockService.update.mockResolvedValue({ id: '1', ...dto });

    await expect(controller.update('1', dto, { user: { id: '1' } })).resolves.toEqual({
      id: '1',
      ...dto,
    });
    expect(mockService.update).toHaveBeenCalledWith('1', dto);
  });

  it('update should throw ForbiddenException for different user', async () => {
    await expect(controller.update('1', { username: 'X' }, { user: { id: '2' } })).rejects.toThrow(
      ForbiddenException
    );
  });

  describe('changeRole', () => {
    it('updates the role and writes an audit log', async () => {
      const updated = { id: 'target', role: 'instructor' };
      mockService.changeRole.mockResolvedValue(updated);
      const req = {
        user: { id: 'admin-1' },
        ip: '10.0.0.1',
        headers: { 'user-agent': 'jest' },
      };

      await expect(
        controller.changeRole('target', { role: 'instructor' } as any, req as any),
      ).resolves.toEqual(updated);

      expect(mockService.changeRole).toHaveBeenCalledWith('target', 'instructor');
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'admin.role_changed',
        'admin-1',
        true,
        { affectedId: 'target', newRole: 'instructor' },
        '10.0.0.1',
        'jest',
      );
    });

    it('forbids an admin from changing their own role', async () => {
      const req = { user: { id: 'admin-1' }, ip: '10.0.0.1', headers: {} };

      await expect(
        controller.changeRole('admin-1', { role: 'student' } as any, req as any),
      ).rejects.toThrow(ForbiddenException);
      expect(mockService.changeRole).not.toHaveBeenCalled();
    });
  });
});

describe('AdminUsersController', () => {
  const mockUsersService = {
    findAll: jest.fn(),
    changeRole: jest.fn(),
    banUser: jest.fn(),
    softDelete: jest.fn(),
    bulkSoftDelete: jest.fn(),
  };
  const mockAuditService = {
    log: jest.fn(),
  };
  let adminController: AdminUsersController;

  beforeEach(() => {
    jest.clearAllMocks();
    adminController = new AdminUsersController(
      mockUsersService as any,
      mockAuditService as any,
    );
  });

  describe('deleteUser', () => {
    it('should soft delete a single user and write audit log', async () => {
      const deleted = { id: '1', email: 'test@example.com', deletedAt: new Date() };
      mockUsersService.softDelete.mockResolvedValue(deleted);

      const req = {
        user: { id: 'admin-id' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      };

      const result = await adminController.deleteUser('1', req as any);

      expect(result).toEqual(deleted);
      expect(mockUsersService.softDelete).toHaveBeenCalledWith('1');
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'admin.user_deleted',
        'admin-id',
        true,
        { affectedId: '1' },
        '127.0.0.1',
        'test-agent',
      );
    });
  });

  describe('bulkDeleteUsers', () => {
    it('should bulk soft delete users and write per-user + summary audit logs', async () => {
      const dto = { ids: ['uuid-1', 'uuid-2', 'uuid-3'] };
      const results = {
        deleted: ['uuid-1', 'uuid-2'],
        failed: [{ id: 'uuid-3', reason: 'User not found' }],
      };
      mockUsersService.bulkSoftDelete.mockResolvedValue(results);

      const req = {
        user: { id: 'admin-id' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
      };

      const response = await adminController.bulkDeleteUsers(dto, req as any);

      expect(mockUsersService.bulkSoftDelete).toHaveBeenCalledWith(dto.ids);

      // Per-user audit entries for each deleted user
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'admin.user_deleted',
        'admin-id',
        true,
        { affectedId: 'uuid-1', operation: 'bulk' },
        '127.0.0.1',
        'test-agent',
      );
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'admin.user_deleted',
        'admin-id',
        true,
        { affectedId: 'uuid-2', operation: 'bulk' },
        '127.0.0.1',
        'test-agent',
      );

      // Summary audit entry
      expect(mockAuditService.log).toHaveBeenCalledWith(
        'admin.user_bulk_deleted',
        'admin-id',
        true,
        {
          affectedIds: ['uuid-1', 'uuid-2'],
          failedIds: ['uuid-3'],
          totalRequested: 3,
        },
        '127.0.0.1',
        'test-agent',
      );

      expect(mockAuditService.log).toHaveBeenCalledTimes(3);

      expect(response).toEqual({
        message: 'Bulk deletion completed: 2 deleted, 1 failed',
        results,
      });
    });

    it('should handle empty failed list', async () => {
      const dto = { ids: ['uuid-1', 'uuid-2'] };
      const results = {
        deleted: ['uuid-1', 'uuid-2'],
        failed: [],
      };
      mockUsersService.bulkSoftDelete.mockResolvedValue(results);

      const req = {
        user: { id: 'admin-id' },
        ip: '127.0.0.1',
        headers: {},
      };

      const response = await adminController.bulkDeleteUsers(dto, req as any);

      expect(mockAuditService.log).toHaveBeenCalledWith(
        'admin.user_bulk_deleted',
        'admin-id',
        true,
        {
          affectedIds: ['uuid-1', 'uuid-2'],
          failedIds: [],
          totalRequested: 2,
        },
        '127.0.0.1',
        undefined,
      );
      expect(response.message).toBe('Bulk deletion completed: 2 deleted, 0 failed');
    });
  });
});
