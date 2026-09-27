import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiUsageLog } from './api-usage-log.entity';

@Injectable()
export class ApiUsageService {
  constructor(
    @InjectRepository(ApiUsageLog) private logRepo: Repository<ApiUsageLog>,
  ) {}

  async log(data: Partial<ApiUsageLog>): Promise<void> {
    await this.logRepo.save(this.logRepo.create(data));
  }

  async getAggregatedByEndpoint(from: Date, to: Date) {
    return this.logRepo
      .createQueryBuilder('log')
      .select('log.endpoint', 'endpoint')
      .addSelect('log.method', 'method')
      .addSelect('COUNT(*)', 'requestCount')
      .addSelect('AVG(log.responseTimeMs)', 'avgResponseTimeMs')
      .addSelect('SUM(CASE WHEN log.statusCode >= 400 THEN 1 ELSE 0 END)', 'errorCount')
      .where('log.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('log.endpoint')
      .addGroupBy('log.method')
      .orderBy('"requestCount"', 'DESC')
      .getRawMany();
  }

  async getAggregatedByUser(from: Date, to: Date) {
    return this.logRepo
      .createQueryBuilder('log')
      .select('log.userId', 'userId')
      .addSelect('COUNT(*)', 'requestCount')
      .addSelect('AVG(log.responseTimeMs)', 'avgResponseTimeMs')
      .where('log.createdAt BETWEEN :from AND :to', { from, to })
      .andWhere('log.userId IS NOT NULL')
      .groupBy('log.userId')
      .orderBy('"requestCount"', 'DESC')
      .getRawMany();
  }

  async getAggregatedByTime(from: Date, to: Date, granularity: 'hour' | 'day' = 'hour') {
    const trunc = granularity === 'hour' ? 'hour' : 'day';
    return this.logRepo
      .createQueryBuilder('log')
      .select(`DATE_TRUNC('${trunc}', log.createdAt)`, 'period')
      .addSelect('COUNT(*)', 'requestCount')
      .where('log.createdAt BETWEEN :from AND :to', { from, to })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();
  }

  async getDashboard(from: Date, to: Date) {
    const [byEndpoint, byUser, byTime, totals] = await Promise.all([
      this.getAggregatedByEndpoint(from, to),
      this.getAggregatedByUser(from, to),
      this.getAggregatedByTime(from, to, 'day'),
      this.logRepo
        .createQueryBuilder('log')
        .select('COUNT(*)', 'totalRequests')
        .addSelect('AVG(log.responseTimeMs)', 'avgResponseTimeMs')
        .addSelect('SUM(CASE WHEN log.statusCode >= 400 THEN 1 ELSE 0 END)', 'totalErrors')
        .where('log.createdAt BETWEEN :from AND :to', { from, to })
        .getRawOne(),
    ]);

    return { totals, byEndpoint: byEndpoint.slice(0, 20), byUser: byUser.slice(0, 20), byTime };
  }

  async checkUsageAlerts(thresholdPerMinute = 100): Promise<{ alert: boolean; count: number }> {
    const since = new Date(Date.now() - 60_000);
    const count = await this.logRepo
      .createQueryBuilder('log')
      .where('log.createdAt > :since', { since })
      .getCount();
    return { alert: count > thresholdPerMinute, count };
  }

  async getUserRequestCount(userId: string, windowMs: number): Promise<number> {
    const since = new Date(Date.now() - windowMs);
    return this.logRepo
      .createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.createdAt > :since', { since })
      .getCount();
  }

  async getStatistics(days: number) {
    const now = new Date();
    const from = new Date(now.getTime() - days * 86_400_000);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now.getTime() - 7 * 86_400_000);
    const monthStart = new Date(now.getTime() - 30 * 86_400_000);

    // Run all queries in parallel
    const [totalsRaw, percentilesRaw, dauRaw, wauRaw, mauRaw, topEndpoints, dailyTrend] =
      await Promise.all([
        // Overall totals for the period
        this.logRepo
          .createQueryBuilder('log')
          .select('COUNT(*)', 'totalRequests')
          .addSelect('AVG(log.responseTimeMs)', 'avgResponseTimeMs')
          .addSelect(
            'SUM(CASE WHEN log.statusCode >= 400 THEN 1 ELSE 0 END)',
            'totalErrors',
          )
          .where('log.createdAt BETWEEN :from AND :to', { from, to: now })
          .getRawOne<{
            totalRequests: string;
            avgResponseTimeMs: string;
            totalErrors: string;
          }>(),

        // Percentiles using PostgreSQL percentile_cont
        this.logRepo
          .createQueryBuilder('log')
          .select(
            'percentile_cont(0.50) WITHIN GROUP (ORDER BY log.responseTimeMs)',
            'p50',
          )
          .addSelect(
            'percentile_cont(0.95) WITHIN GROUP (ORDER BY log.responseTimeMs)',
            'p95',
          )
          .addSelect(
            'percentile_cont(0.99) WITHIN GROUP (ORDER BY log.responseTimeMs)',
            'p99',
          )
          .where('log.createdAt BETWEEN :from AND :to', { from, to: now })
          .getRawOne<{ p50: string; p95: string; p99: string }>(),

        // Daily active users (today)
        this.logRepo
          .createQueryBuilder('log')
          .select('COUNT(DISTINCT log.userId)', 'count')
          .where('log.createdAt >= :since', { since: todayStart })
          .andWhere('log.userId IS NOT NULL')
          .getRawOne<{ count: string }>(),

        // Weekly active users (last 7 days)
        this.logRepo
          .createQueryBuilder('log')
          .select('COUNT(DISTINCT log.userId)', 'count')
          .where('log.createdAt >= :since', { since: weekStart })
          .andWhere('log.userId IS NOT NULL')
          .getRawOne<{ count: string }>(),

        // Monthly active users (last 30 days)
        this.logRepo
          .createQueryBuilder('log')
          .select('COUNT(DISTINCT log.userId)', 'count')
          .where('log.createdAt >= :since', { since: monthStart })
          .andWhere('log.userId IS NOT NULL')
          .getRawOne<{ count: string }>(),

        // Top endpoints by request count
        this.logRepo
          .createQueryBuilder('log')
          .select('log.endpoint', 'endpoint')
          .addSelect('log.method', 'method')
          .addSelect('COUNT(*)', 'requestCount')
          .addSelect('AVG(log.responseTimeMs)', 'avgResponseTimeMs')
          .addSelect(
            'SUM(CASE WHEN log.statusCode >= 400 THEN 1 ELSE 0 END)',
            'errorCount',
          )
          .where('log.createdAt BETWEEN :from AND :to', { from, to: now })
          .groupBy('log.endpoint')
          .addGroupBy('log.method')
          .orderBy('"requestCount"', 'DESC')
          .limit(10)
          .getRawMany<{
            endpoint: string;
            method: string;
            requestCount: string;
            avgResponseTimeMs: string;
            errorCount: string;
          }>(),

        // Daily trend grouped by day
        this.logRepo
          .createQueryBuilder('log')
          .select("TO_CHAR(DATE_TRUNC('day', log.createdAt), 'YYYY-MM-DD')", 'date')
          .addSelect('COUNT(*)', 'requestCount')
          .addSelect(
            'SUM(CASE WHEN log.statusCode >= 400 THEN 1 ELSE 0 END)',
            'errorCount',
          )
          .addSelect('AVG(log.responseTimeMs)', 'avgResponseTimeMs')
          .where('log.createdAt BETWEEN :from AND :to', { from, to: now })
          .groupBy("DATE_TRUNC('day', log.createdAt)")
          .orderBy("DATE_TRUNC('day', log.createdAt)", 'ASC')
          .getRawMany<{
            date: string;
            requestCount: string;
            errorCount: string;
            avgResponseTimeMs: string;
          }>(),
      ]);

    const totalRequests = parseInt(totalsRaw?.totalRequests ?? '0', 10);
    const totalErrors = parseInt(totalsRaw?.totalErrors ?? '0', 10);

    return {
      period: { from, to: now, days },
      totalRequests,
      errorRate:
        totalRequests > 0
          ? Math.round((totalErrors / totalRequests) * 10000) / 100
          : 0,
      avgResponseTimeMs: Math.round(
        parseFloat(totalsRaw?.avgResponseTimeMs ?? '0'),
      ),
      p50ResponseTimeMs: Math.round(parseFloat(percentilesRaw?.p50 ?? '0')),
      p95ResponseTimeMs: Math.round(parseFloat(percentilesRaw?.p95 ?? '0')),
      p99ResponseTimeMs: Math.round(parseFloat(percentilesRaw?.p99 ?? '0')),
      dailyActiveUsers: parseInt(dauRaw?.count ?? '0', 10),
      weeklyActiveUsers: parseInt(wauRaw?.count ?? '0', 10),
      monthlyActiveUsers: parseInt(mauRaw?.count ?? '0', 10),
      topEndpoints: topEndpoints.map((e) => ({
        endpoint: e.endpoint,
        method: e.method,
        requestCount: parseInt(e.requestCount, 10),
        avgResponseTimeMs: Math.round(parseFloat(e.avgResponseTimeMs ?? '0')),
        errorCount: parseInt(e.errorCount, 10),
      })),
      dailyTrend: dailyTrend.map((d) => ({
        date: d.date,
        requestCount: parseInt(d.requestCount, 10),
        errorCount: parseInt(d.errorCount, 10),
        avgResponseTimeMs: Math.round(parseFloat(d.avgResponseTimeMs ?? '0')),
      })),
    };
  }
}
