import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { QueryPerformanceService, QueryLog } from './query-performance.service';

export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'warning';
  message: string;
  query: string;
  duration: number;
  threshold: number;
  acknowledged: boolean;
}

@Injectable()
export class QueryAlertService {
  private readonly logger = new Logger(QueryAlertService.name);
  private alerts: Alert[] = [];
  private readonly MAX_ALERTS = 500;
  private readonly ALERT_COOLDOWN_MS = 60000; // 1 minute
  private lastAlertTime: Map<string, number> = new Map();

  constructor(
    private queryPerformanceService: QueryPerformanceService,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
  ) {
    this.startMonitoring();
  }

  /**
   * Record an alert for a critical query
   */
  recordAlert(
    query: string,
    duration: number,
    severity: 'critical' | 'warning' = 'critical',
  ): Alert {
    const queryHash = this.hashQuery(query);
    const now = Date.now();

    // Check cooldown to avoid alert spam
    const lastAlert = this.lastAlertTime.get(queryHash) || 0;
    if (now - lastAlert < this.ALERT_COOLDOWN_MS) {
      return null; // Skip alert due to cooldown
    }

    const threshold = this.queryPerformanceService.getCriticalQueryThreshold();
    const alert: Alert = {
      id: this.generateAlertId(),
      timestamp: new Date(),
      severity,
      message: `Query exceeded ${threshold}ms threshold (took ${duration}ms)`,
      query: this.truncateQuery(query),
      duration,
      threshold,
      acknowledged: false,
    };

    this.alerts.push(alert);
    this.lastAlertTime.set(queryHash, now);

    // Maintain max alerts
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts.shift();
    }

    this.logger.warn(`CRITICAL QUERY ALERT: ${alert.message}`, {
      duration,
      threshold,
      query: query.substring(0, 100),
    });

    // Emit event for external alert systems (email, Slack, etc.)
    this.eventEmitter.emit('query.alert.created', alert);

    return alert;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.acknowledged);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(limit: number = 100): Alert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Get alert statistics
   */
  getAlertStats() {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const last1h = now - 60 * 60 * 1000;

    const alertsLast24h = this.alerts.filter(
      a => a.timestamp.getTime() > last24h,
    );
    const alertsLast1h = this.alerts.filter(
      a => a.timestamp.getTime() > last1h,
    );

    return {
      total: this.alerts.length,
      active: this.alerts.filter(a => !a.acknowledged).length,
      last24h: alertsLast24h.length,
      last1h: alertsLast1h.length,
      criticalCount: this.alerts.filter(a => a.severity === 'critical').length,
      warningCount: this.alerts.filter(a => a.severity === 'warning').length,
    };
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
    this.lastAlertTime.clear();
    this.logger.log('All alerts cleared');
  }

  /**
   * Clear acknowledged alerts
   */
  clearAcknowledgedAlerts(): void {
    const beforeCount = this.alerts.length;
    this.alerts = this.alerts.filter(a => !a.acknowledged);
    this.logger.log(
      `Cleared ${beforeCount - this.alerts.length} acknowledged alerts`,
    );
  }

  /**
   * Start monitoring critical queries
   */
  private startMonitoring(): void {
    // This will be called during initialization
    this.logger.log('Query alert monitoring started');
  }

  /**
   * Periodic check for slow queries (runs every minute)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  private checkSlowQueries(): void {
    const criticalQueries = this.queryPerformanceService.getQueriesByStatus('critical');

    for (const query of criticalQueries) {
      if (query.duration >= this.queryPerformanceService.getCriticalQueryThreshold()) {
        this.recordAlert(query.query, query.duration, 'critical');
      }
    }
  }

  /**
   * Periodic alert cleanup (runs every hour)
   */
  @Cron(CronExpression.EVERY_HOUR)
  private cleanupOldAlerts(): void {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const beforeCount = this.alerts.length;
    this.alerts = this.alerts.filter(
      a => a.timestamp.getTime() > oneWeekAgo,
    );

    if (beforeCount !== this.alerts.length) {
      this.logger.log(
        `Cleaned up ${beforeCount - this.alerts.length} old alerts`,
      );
    }
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Hash query for cooldown tracking
   */
  private hashQuery(query: string): string {
    // Simple hash for cooldown tracking
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
      const char = query.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `query_${Math.abs(hash)}`;
  }

  /**
   * Truncate query for storage
   */
  private truncateQuery(query: string, length: number = 200): string {
    if (query.length <= length) {
      return query;
    }
    return query.substring(0, length) + '...';
  }
}
