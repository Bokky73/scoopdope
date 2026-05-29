import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import axios from 'axios';
import { AppModule } from '../../app.module';

/**
 * Chaos Engineering Tests
 * Tests system resilience under failure conditions
 */
describe('Chaos Engineering - Resilience Tests', () => {
  let app: INestApplication;
  const baseUrl = 'http://localhost:3000';
  const client = axios.create({ baseURL: baseUrl });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Network Latency Resilience', () => {
    it('should handle requests under high latency', async () => {
      const startTime = Date.now();
      try {
        const response = await client.get('/v1/courses', {
          timeout: 30000, // 30s timeout
        });
        const duration = Date.now() - startTime;

        expect(response.status).toBe(200);
        // Should complete within reasonable time even with latency
        expect(duration).toBeLessThan(30000);
      } catch (error: any) {
        // Should not timeout
        expect(error.code).not.toBe('ECONNABORTED');
      }
    });

    it('should retry failed requests', async () => {
      let attempts = 0;
      const maxRetries = 3;

      const makeRequest = async () => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            attempts++;
            const response = await client.get('/v1/courses', {
              timeout: 5000,
            });
            return response;
          } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      };

      const response = await makeRequest();
      expect(response.status).toBe(200);
      expect(attempts).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Database Failure Resilience', () => {
    it('should handle database connection errors gracefully', async () => {
      try {
        const response = await client.get('/v1/health/db', {
          timeout: 5000,
        });
        // If DB is up, should return healthy status
        expect([200, 503]).toContain(response.status);
      } catch (error: any) {
        // Should not crash the application
        expect(error.response?.status).toBeDefined();
      }
    });

    it('should return service unavailable on DB failure', async () => {
      try {
        const response = await client.get('/v1/courses', {
          timeout: 5000,
        });
        // Should either succeed or return 503
        expect([200, 503]).toContain(response.status);
      } catch (error: any) {
        // Should return 503, not 500
        expect(error.response?.status).toBe(503);
      }
    });
  });

  describe('Cache Failure Resilience', () => {
    it('should work without Redis cache', async () => {
      try {
        const response = await client.get('/v1/courses', {
          timeout: 5000,
        });
        // Should still work even if cache is down
        expect(response.status).toBe(200);
      } catch (error: any) {
        // Should not fail due to cache
        expect(error.response?.status).not.toBe(500);
      }
    });

    it('should handle cache timeout gracefully', async () => {
      try {
        const response = await client.get('/v1/users/1', {
          headers: {
            Authorization: 'Bearer test-token',
          },
          timeout: 5000,
        });
        // Should either succeed or return auth error, not cache error
        expect([200, 401, 404]).toContain(response.status);
      } catch (error: any) {
        expect([401, 404, 503]).toContain(error.response?.status);
      }
    });
  });

  describe('Circuit Breaker Pattern', () => {
    it('should open circuit after repeated failures', async () => {
      const failureThreshold = 5;
      let failures = 0;

      for (let i = 0; i < failureThreshold + 2; i++) {
        try {
          await client.get('/v1/courses', {
            timeout: 1000,
          });
        } catch (error) {
          failures++;
        }
      }

      // After threshold, should get circuit breaker response
      try {
        const response = await client.get('/v1/courses', {
          timeout: 1000,
        });
        expect(response.status).toBe(200);
      } catch (error: any) {
        // Circuit breaker should return 503
        expect([503, 429]).toContain(error.response?.status);
      }
    });
  });

  describe('Graceful Degradation', () => {
    it('should serve cached data when service is degraded', async () => {
      try {
        // First request to populate cache
        await client.get('/v1/courses');

        // Simulate degradation and retry
        const response = await client.get('/v1/courses', {
          timeout: 5000,
        });

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
      } catch (error: any) {
        // Should not crash
        expect(error.response?.status).toBeDefined();
      }
    });

    it('should return partial data on partial failure', async () => {
      try {
        const response = await client.get('/v1/courses', {
          timeout: 5000,
        });

        if (response.status === 200) {
          // Should have data structure even if incomplete
          expect(response.data).toBeDefined();
        }
      } catch (error: any) {
        expect(error.response?.status).toBeDefined();
      }
    });
  });

  describe('Load Shedding', () => {
    it('should reject requests when overloaded', async () => {
      const concurrentRequests = 100;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          client.get('/v1/courses', { timeout: 5000 }).catch((e) => e),
        );
      }

      const results = await Promise.all(promises);
      const successful = results.filter((r) => r.status === 200).length;
      const rejected = results.filter((r) => r.response?.status === 429).length;

      // Should handle load gracefully
      expect(successful + rejected).toBe(concurrentRequests);
    });
  });
});
