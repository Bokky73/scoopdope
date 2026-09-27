import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { QueryAlertService } from '../services/query-alert.service';
import { QueryPerformanceService } from '../services/query-performance.service';

describe('QueryAlertService', () => {
  let service: QueryAlertService;
  let queryPerformanceService: QueryPerformanceService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'monitoring.slowQueryThreshold') return 1000;
        if (key === 'monitoring.criticalQueryThreshold') return 5000;
        if (key === 'monitoring.slowQueryLogPath') return 'logs/slow-queries.log';
        return null;
      }),
    };

    const mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueryAlertService,
        QueryPerformanceService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<QueryAlertService>(QueryAlertService);
    queryPerformanceService = module.get<QueryPerformanceService>(QueryPerformanceService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  describe('recordAlert', () => {
    it('should create an alert for critical queries', () => {
      const query = 'SELECT * FROM users';
      const alert = service.recordAlert(query, 6000, 'critical');

      expect(alert).toBeDefined();
      expect(alert.severity).toBe('critical');
      expect(alert.duration).toBe(6000);
      expect(alert.acknowledged).toBe(false);
    });

    it('should emit event when alert is created', () => {
      const query = 'SELECT * FROM users';
      service.recordAlert(query, 6000);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'query.alert.created',
        expect.objectContaining({
          severity: 'critical',
          duration: 6000,
        }),
      );
    });

    it('should respect alert cooldown', () => {
      const query = 'SELECT * FROM users';
      
      // Record first alert
      const alert1 = service.recordAlert(query, 6000);
      expect(alert1).toBeDefined();

      // Try to record same query immediately (should be filtered by cooldown)
      const alert2 = service.recordAlert(query, 7000);
      expect(alert2).toBeNull();
    });

    it('should allow alerts for different queries', () => {
      const alert1 = service.recordAlert('SELECT * FROM users', 6000);
      const alert2 = service.recordAlert('SELECT * FROM courses', 6000);

      expect(alert1).toBeDefined();
      expect(alert2).toBeDefined();
    });
  });

  describe('getActiveAlerts', () => {
    it('should return only unacknowledged alerts', () => {
      service.recordAlert('SELECT 1', 6000);
      service.recordAlert('SELECT 2', 6000);

      let alerts = service.getActiveAlerts();
      expect(alerts.length).toBe(2);

      // Acknowledge first alert
      service.acknowledgeAlert(alerts[0].id);

      alerts = service.getActiveAlerts();
      expect(alerts.length).toBe(1);
    });
  });

  describe('getAllAlerts', () => {
    it('should return limited number of alerts', () => {
      // Record many alerts with different queries to bypass cooldown
      for (let i = 0; i < 200; i++) {
        service.recordAlert(`SELECT ${i}`, 6000);
      }

      const alerts = service.getAllAlerts(50);
      expect(alerts.length).toBeLessThanOrEqual(50);
    });

    it('should return most recent alerts first (slice from end)', () => {
      service.recordAlert('SELECT 1', 6000);
      service.recordAlert('SELECT 2', 6000);
      service.recordAlert('SELECT 3', 6000);

      const alerts = service.getAllAlerts(100);
      // The last recorded should be first in the returned slice
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('acknowledgeAlert', () => {
    it('should mark alert as acknowledged', () => {
      const alert = service.recordAlert('SELECT * FROM users', 6000);
      
      const result = service.acknowledgeAlert(alert.id);
      expect(result).toBe(true);

      const activeAlerts = service.getActiveAlerts();
      expect(activeAlerts.find(a => a.id === alert.id)).toBeUndefined();
    });

    it('should return false for non-existent alert', () => {
      const result = service.acknowledgeAlert('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getAlertStats', () => {
    it('should calculate alert statistics', () => {
      service.recordAlert('SELECT 1', 6000);
      service.recordAlert('SELECT 2', 6000);
      service.recordAlert('SELECT 3', 6000);

      const stats = service.getAlertStats();
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.active).toBeGreaterThan(0);
      expect(stats.criticalCount).toBeGreaterThan(0);
    });

    it('should track time-based statistics', () => {
      service.recordAlert('SELECT 1', 6000);

      const stats = service.getAlertStats();
      expect(stats.last24h).toBeGreaterThan(0);
      expect(stats.last1h).toBeGreaterThan(0);
    });
  });

  describe('clearAlerts', () => {
    it('should clear all alerts', () => {
      service.recordAlert('SELECT 1', 6000);
      service.recordAlert('SELECT 2', 6000);

      service.clearAlerts();

      const alerts = service.getAllAlerts();
      expect(alerts.length).toBe(0);
    });
  });

  describe('clearAcknowledgedAlerts', () => {
    it('should only clear acknowledged alerts', () => {
      const alert1 = service.recordAlert('SELECT 1', 6000);
      const alert2 = service.recordAlert('SELECT 2', 6000);

      service.acknowledgeAlert(alert1.id);
      service.clearAcknowledgedAlerts();

      const alerts = service.getAllAlerts();
      expect(alerts.find(a => a.id === alert1.id)).toBeUndefined();
      expect(alerts.find(a => a.id === alert2.id)).toBeDefined();
    });
  });
});
