import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QueryPerformanceService, QueryLog } from '../services/query-performance.service';
import * as fs from 'fs';
import * as path from 'path';

describe('QueryPerformanceService', () => {
  let service: QueryPerformanceService;
  let configService: ConfigService;
  let testLogPath: string;

  beforeEach(async () => {
    testLogPath = path.join(__dirname, 'test-slow-queries.log');

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'monitoring.slowQueryThreshold') return 1000;
        if (key === 'monitoring.criticalQueryThreshold') return 5000;
        if (key === 'monitoring.slowQueryLogPath') return testLogPath;
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryPerformanceService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<QueryPerformanceService>(QueryPerformanceService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    // Clean up test log file
    try {
      if (fs.existsSync(testLogPath)) {
        fs.unlinkSync(testLogPath);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('recordQuery', () => {
    it('should not record fast queries below threshold', () => {
      const query = 'SELECT * FROM users';
      service.recordQuery(query, [], 500);

      const metrics = service.getMetrics();
      expect(metrics.totalQueries).toBe(0);
    });

    it('should record slow queries', () => {
      const query = 'SELECT * FROM users WHERE id = $1';
      service.recordQuery(query, ['123'], 1500);

      const slowQueries = service.getRecentSlowQueries();
      expect(slowQueries.length).toBe(1);
      expect(slowQueries[0].status).toBe('slow');
      expect(slowQueries[0].duration).toBe(1500);
    });

    it('should record critical queries with status critical', () => {
      const query = 'SELECT * FROM users';
      service.recordQuery(query, [], 6000);

      const criticalQueries = service.getQueriesByStatus('critical');
      expect(criticalQueries.length).toBe(1);
      expect(criticalQueries[0].status).toBe('critical');
    });

    it('should sanitize sensitive data in queries', () => {
      const query = "INSERT INTO users (name, email) VALUES ('John', 'john@example.com')";
      service.recordQuery(query, ['John', 'john@example.com'], 1500);

      const slowQueries = service.getRecentSlowQueries();
      expect(slowQueries[0].query).toContain('VALUES (...)');
      expect(slowQueries[0].query).not.toContain('John');
    });

    it('should write to log file', () => {
      const query = 'SELECT * FROM users';
      service.recordQuery(query, [], 2000);

      // Give file system time to write
      setTimeout(() => {
        const exists = fs.existsSync(testLogPath);
        expect(exists).toBe(true);
      }, 100);
    });

    it('should include context in query logs', () => {
      const query = 'SELECT * FROM users';
      service.recordQuery(query, [], 1500, 'user.service.getAllUsers');

      const slowQueries = service.getRecentSlowQueries();
      expect(slowQueries[0].context).toBe('user.service.getAllUsers');
    });
  });

  describe('getMetrics', () => {
    it('should return zero metrics when no queries recorded', () => {
      const metrics = service.getMetrics();
      expect(metrics.totalQueries).toBe(0);
      expect(metrics.slowQueries).toBe(0);
      expect(metrics.criticalQueries).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
    });

    it('should calculate average response time', () => {
      service.recordQuery('SELECT 1', [], 1000);
      service.recordQuery('SELECT 2', [], 2000);
      service.recordQuery('SELECT 3', [], 3000);

      const metrics = service.getMetrics();
      expect(metrics.totalQueries).toBe(3);
      expect(metrics.averageResponseTime).toBe(2000);
    });

    it('should calculate percentiles correctly', () => {
      // Record 100 queries with increasing durations
      for (let i = 0; i < 100; i++) {
        service.recordQuery(`SELECT ${i}`, [], 1000 + i * 50);
      }

      const metrics = service.getMetrics();
      expect(metrics.p95ResponseTime).toBeGreaterThan(5000);
      expect(metrics.p99ResponseTime).toBeGreaterThan(metrics.p95ResponseTime);
    });

    it('should count slow and critical queries separately', () => {
      // 3 slow queries
      service.recordQuery('SELECT 1', [], 1500);
      service.recordQuery('SELECT 2', [], 2500);
      service.recordQuery('SELECT 3', [], 3500);

      // 2 critical queries
      service.recordQuery('SELECT 4', [], 6000);
      service.recordQuery('SELECT 5', [], 7000);

      const metrics = service.getMetrics();
      expect(metrics.slowQueries).toBe(3);
      expect(metrics.criticalQueries).toBe(2);
      expect(metrics.totalQueries).toBe(5);
    });
  });

  describe('getQueriesByStatus', () => {
    it('should return only slow queries', () => {
      service.recordQuery('SELECT 1', [], 1500);
      service.recordQuery('SELECT 2', [], 2500);
      service.recordQuery('SELECT 3', [], 6000);

      const slowQueries = service.getQueriesByStatus('slow');
      expect(slowQueries.length).toBe(2);
      expect(slowQueries.every(q => q.status === 'slow')).toBe(true);
    });

    it('should return only critical queries', () => {
      service.recordQuery('SELECT 1', [], 1500);
      service.recordQuery('SELECT 2', [], 6000);
      service.recordQuery('SELECT 3', [], 7000);

      const criticalQueries = service.getQueriesByStatus('critical');
      expect(criticalQueries.length).toBe(2);
      expect(criticalQueries.every(q => q.status === 'critical')).toBe(true);
    });
  });

  describe('clearLogs', () => {
    it('should clear all in-memory logs', () => {
      service.recordQuery('SELECT 1', [], 1500);
      service.recordQuery('SELECT 2', [], 2500);

      let metrics = service.getMetrics();
      expect(metrics.totalQueries).toBe(2);

      service.clearLogs();

      metrics = service.getMetrics();
      expect(metrics.totalQueries).toBe(0);
    });
  });

  describe('getThresholds', () => {
    it('should return configured slow query threshold', () => {
      const threshold = service.getSlowQueryThreshold();
      expect(threshold).toBe(1000);
    });

    it('should return configured critical query threshold', () => {
      const threshold = service.getCriticalQueryThreshold();
      expect(threshold).toBe(5000);
    });
  });

  describe('memory management', () => {
    it('should maintain max logs in memory', () => {
      // Record more than MAX_LOGS_IN_MEMORY (1000)
      for (let i = 0; i < 1500; i++) {
        service.recordQuery(`SELECT ${i}`, [], 1000 + i % 100);
      }

      const metrics = service.getMetrics();
      expect(metrics.totalQueries).toBeLessThanOrEqual(1000);
    });
  });
});
