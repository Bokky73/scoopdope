import { UserRateLimitService } from './user-rate-limit.service';

describe('UserRateLimitService', () => {
  it('uses 20 requests per minute for guests and reports the fixed reset time', async () => {
    const values = new Map<string, unknown>();
    const cache = {
      get: jest.fn((key: string) => values.get(key)),
      set: jest.fn((key: string, value: unknown) => values.set(key, value)),
      del: jest.fn(),
    };
    const service = new UserRateLimitService(cache as never);

    for (let request = 0; request < 20; request += 1) {
      await expect(
        service.checkRateLimit(null, '203.0.113.10', 'guest'),
      ).resolves.toBe(true);
    }

    await expect(
      service.checkRateLimit(null, '203.0.113.10', 'guest'),
    ).resolves.toBe(false);
    const status = await service.getRateLimitStatus(
      null,
      '203.0.113.10',
      'guest',
    );

    expect(status.limit).toBe(20);
    expect(status.remaining).toBe(0);
    expect(status.resetTime.getTime()).toBeGreaterThan(Date.now());
  });

  it('uses separate counters for authenticated user IDs', async () => {
    const values = new Map<string, unknown>();
    const cache = {
      get: jest.fn((key: string) => values.get(key)),
      set: jest.fn((key: string, value: unknown) => values.set(key, value)),
      del: jest.fn(),
    };
    const service = new UserRateLimitService(cache as never);

    await service.checkRateLimit('user-a', '203.0.113.10', 'student');
    await service.checkRateLimit('user-b', '203.0.113.10', 'student');

    expect(values.size).toBe(2);
    expect(values.has('rate-limit:user-a')).toBe(true);
    expect(values.has('rate-limit:user-b')).toBe(true);
  });
});