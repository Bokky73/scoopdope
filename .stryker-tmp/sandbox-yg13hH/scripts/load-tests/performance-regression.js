import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

const API_URL = __ENV.API_URL || 'http://localhost:3000';

// Custom metrics
const errorRate = new Rate('errors');
const duration = new Trend('duration');
const successCount = new Counter('success');
const activeUsers = new Gauge('active_users');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '2m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
    'errors': ['rate<0.01'],
  },
};

export default function () {
  activeUsers.add(1);

  group('Health Check', () => {
    const res = http.get(`${API_URL}/health`);
    check(res, {
      'health status is 200': (r) => r.status === 200,
      'health response time < 100ms': (r) => r.timings.duration < 100,
    });
    duration.add(res.timings.duration, { endpoint: 'health' });
    errorRate.add(res.status !== 200);
    if (res.status === 200) successCount.add(1);
  });

  sleep(1);

  group('List Courses', () => {
    const res = http.get(`${API_URL}/v1/courses`);
    check(res, {
      'courses status is 200': (r) => r.status === 200,
      'courses response time < 500ms': (r) => r.timings.duration < 500,
      'courses has data': (r) => r.body.length > 0,
    });
    duration.add(res.timings.duration, { endpoint: 'courses' });
    errorRate.add(res.status !== 200);
    if (res.status === 200) successCount.add(1);
  });

  sleep(1);

  group('Get Course Details', () => {
    const res = http.get(`${API_URL}/v1/courses/1`);
    check(res, {
      'course detail status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'course detail response time < 300ms': (r) => r.timings.duration < 300,
    });
    duration.add(res.timings.duration, { endpoint: 'course-detail' });
    errorRate.add(res.status !== 200 && res.status !== 404);
    if (res.status === 200) successCount.add(1);
  });

  sleep(1);

  group('Stellar Balance Check', () => {
    const publicKey = 'GBRPYHIL2CI3WHZDTOOQFC6EB4PSQJNPPQYHORXIOY3D3FCWKAPBTPM';
    const res = http.get(`${API_URL}/v1/stellar/balance/${publicKey}`);
    check(res, {
      'balance status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      'balance response time < 1000ms': (r) => r.timings.duration < 1000,
    });
    duration.add(res.timings.duration, { endpoint: 'stellar-balance' });
    errorRate.add(res.status !== 200 && res.status !== 404);
    if (res.status === 200) successCount.add(1);
  });

  sleep(1);

  group('API Documentation', () => {
    const res = http.get(`${API_URL}/api/docs`);
    check(res, {
      'docs status is 200': (r) => r.status === 200,
      'docs response time < 200ms': (r) => r.timings.duration < 200,
    });
    duration.add(res.timings.duration, { endpoint: 'docs' });
    errorRate.add(res.status !== 200);
    if (res.status === 200) successCount.add(1);
  });

  activeUsers.add(-1);
  sleep(2);
}
