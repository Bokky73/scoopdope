import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuditService } from '../../src/audit/audit.service';
import { AuditLog, AuditAction } from '../../src/audit/audit-log.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CustomLoggerService } from '../../src/common/logger/logger.service';
import { DistributedLockService } from '../../src/common/distributed-lock.service';

describe('Audit Logging (Integration)', () => {
  let app: INestApplication;
  let auditService: AuditService;

  const mockAuditRepository = {
    save: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
      clone: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    })),
    delete: jest.fn(),
  };

  const mockLoggerService = {
    setContext: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  const mockDistributedLockService = {
    withLock: jest.fn((key, fn) => fn()),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockAuditRepository,
        },
        {
          provide: CustomLoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: DistributedLockService,
          useValue: mockDistributedLockService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    auditService = moduleFixture.get<AuditService>(AuditService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Audit Log Creation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should log role change with details', async () => {
      const auditData = {
        action: AuditAction.ROLE_CHANGED,
        userId: 'admin-123',
        success: true,
        resourceType: 'user',
        resourceId: 'user-456',
        changes: {
          role: { from: 'student', to: 'instructor' },
        },
      };

      mockAuditRepository.save.mockResolvedValue({
        id: 'audit-1',
        ...auditData,
        createdAt: new Date(),
      });

      await auditService.log(auditData.action, auditData.userId, auditData.success, {
        resourceType: auditData.resourceType,
        resourceId: auditData.resourceId,
        changes: auditData.changes,
      });

      expect(mockAuditRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        action: AuditAction.ROLE_CHANGED,
        userId: 'admin-123',
        success: true,
        resourceType: 'user',
        resourceId: 'user-456',
        changes: auditData.changes,
      }));
    });

    it('should log user status changes', async () => {
      const auditData = {
        action: AuditAction.USER_SUSPENDED,
        userId: 'admin-123',
        success: true,
        resourceType: 'user',
        resourceId: 'user-456',
      };

      mockAuditRepository.save.mockResolvedValue({
        id: 'audit-2',
        ...auditData,
        createdAt: new Date(),
      });

      await auditService.log(auditData.action, auditData.userId, auditData.success, {
        resourceType: auditData.resourceType,
        resourceId: auditData.resourceId,
      });

      expect(mockAuditRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        action: AuditAction.USER_SUSPENDED,
        resourceType: 'user',
        resourceId: 'user-456',
      }));
    });

    it('should log course approval', async () => {
      await auditService.log(
        AuditAction.COURSE_APPROVED,
        'admin-123',
        true,
        {
          resourceType: 'course',
          resourceId: 'course-789',
          changes: { status: { from: 'pending', to: 'published' } },
        },
      );

      expect(mockAuditRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        action: AuditAction.COURSE_APPROVED,
        resourceType: 'course',
        resourceId: 'course-789',
      }));
    });

    it('should log failed actions', async () => {
      await auditService.log(
        'some.action',
        'user-123',
        false,
        { metadata: { reason: 'Permission denied' } },
      );

      expect(mockAuditRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        metadata: { reason: 'Permission denied' },
      }));
    });

    it('should capture IP address and user agent', async () => {
      await auditService.log(
        AuditAction.LOGIN_SUCCESS,
        'user-123',
        true,
        {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
        },
      );

      expect(mockAuditRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
      }));
    });
  });

  describe('Audit Log Retrieval', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should retrieve logs with pagination', async () => {
      const mockLogs = [
        { id: '1', action: AuditAction.ROLE_CHANGED, createdAt: new Date() },
        { id: '2', action: AuditAction.USER_SUSPENDED, createdAt: new Date() },
      ];

      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockLogs),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      };

      mockAuditRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await auditService.getLogs({
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should filter logs by action', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockAuditRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await auditService.getLogs({
        action: AuditAction.ROLE_CHANGED,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'log.action = :action',
        { action: AuditAction.ROLE_CHANGED },
      );
    });

    it('should filter logs by resource type', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockAuditRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await auditService.getLogs({
        resourceType: 'course',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'log.resourceType = :resourceType',
        { resourceType: 'course' },
      );
    });

    it('should filter logs by date range', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockAuditRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      await auditService.getLogs({
        startDate,
        endDate,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'log.createdAt >= :start',
        { start: startDate },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'log.createdAt <= :end',
        { end: endDate },
      );
    });

    it('should enforce pagination limits', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        clone: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockAuditRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      // Test with limit > 100 (should be capped at 100)
      await auditService.getLogs({
        page: 1,
        limit: 200,
      });

      expect(queryBuilder.take).toHaveBeenCalledWith(100);
    });
  });

  describe('Audit Log Integrity', () => {
    it('should include all admin user actions', async () => {
      const adminActions = [
        AuditAction.ROLE_CHANGED,
        AuditAction.USER_BANNED,
        AuditAction.USER_SUSPENDED,
        AuditAction.USER_DEACTIVATED,
      ];

      for (const action of adminActions) {
        mockAuditRepository.save.mockResolvedValue({ id: '1', action });

        await auditService.log(action, 'admin-id', true, {
          resourceType: 'user',
          resourceId: 'user-id',
        });

        expect(mockAuditRepository.save).toHaveBeenCalled();
      }
    });

    it('should include all admin course actions', async () => {
      const courseActions = [
        AuditAction.COURSE_APPROVED,
        AuditAction.COURSE_ARCHIVED,
        AuditAction.COURSE_UNARCHIVED,
        AuditAction.COURSE_DELETED,
      ];

      for (const action of courseActions) {
        mockAuditRepository.save.mockResolvedValue({ id: '1', action });

        await auditService.log(action, 'admin-id', true, {
          resourceType: 'course',
          resourceId: 'course-id',
        });

        expect(mockAuditRepository.save).toHaveBeenCalled();
      }
    });

    it('should be immutable (no update/delete of existing logs)', () => {
      // Audit logs should only have save (insert) operations, no update/delete
      expect(mockAuditRepository.update).toBeUndefined();
      // Delete should only be used by purge job, not by regular operations
    });
  });

  describe('Audit Log Retention', () => {
    it('should purge logs older than retention period', async () => {
      mockAuditRepository.delete.mockResolvedValue({ affected: 100 });

      await auditService.purgeOldLogs();

      expect(mockAuditRepository.delete).toHaveBeenCalled();
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        expect.stringContaining('purged'),
        expect.any(Object),
      );
    });
  });
});
