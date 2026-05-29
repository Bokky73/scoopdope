import http from 'k6/http';
import { check, sleep, group } from 'k6';

/**
 * Realistic User Journey Load Test
 * Simulates complete user flow: register → login → browse courses → enroll → view lesson
 */

export const options = {
  stages: [
    // Ramp-up: gradually increase to 100 users over 2 minutes
    { duration: '2m', target: 100 },
    // Sustained load: maintain 100 users for 5 minutes
    { duration: '5m', target: 100 },
    // Spike: sudden increase to 500 users
    { duration: '1m', target: 500 },
    // Sustained spike: maintain 500 users for 3 minutes
    { duration: '3m', target: 500 },
    // Ramp-down: gradually decrease to 0 over 2 minutes
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000', 'p(99.9)<2000'],
    http_req_failed: ['rate<0.05'],
    'http_req_duration{staticAsset:yes}': ['p(99)<1000'],
    'http_req_duration{api:yes}': ['p(99)<1000'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';
const THINK_TIME = 2; // seconds between actions

// Generate unique user for each VU
const userId = `user_${__VU}_${Date.now()}`;

export default function () {
  group('User Journey - Register → Login → Browse → Enroll → Learn', () => {
    // 1. Register new user
    group('1. Register', () => {
      const registerPayload = JSON.stringify({
        email: `${userId}@example.com`,
        password: 'Test@1234!',
        username: userId,
      });

      const registerRes = http.post(`${BASE_URL}/v1/auth/register`, registerPayload, {
        headers: { 'Content-Type': 'application/json' },
        tags: { api: 'yes' },
      });

      check(registerRes, {
        'register status 201': (r) => r.status === 201,
        'register response time < 500ms': (r) => r.timings.duration < 500,
      });

      sleep(THINK_TIME);
    });

    // 2. Login
    let accessToken = '';
    group('2. Login', () => {
      const loginPayload = JSON.stringify({
        email: `${userId}@example.com`,
        password: 'Test@1234!',
      });

      const loginRes = http.post(`${BASE_URL}/v1/auth/login`, loginPayload, {
        headers: { 'Content-Type': 'application/json' },
        tags: { api: 'yes' },
      });

      check(loginRes, {
        'login status 200': (r) => r.status === 200,
        'login response time < 500ms': (r) => r.timings.duration < 500,
        'has access_token': (r) => {
          const body = JSON.parse(r.body);
          accessToken = body.access_token;
          return accessToken !== undefined;
        },
      });

      sleep(THINK_TIME);
    });

    // 3. Browse courses
    group('3. Browse Courses', () => {
      const coursesRes = http.get(`${BASE_URL}/v1/courses?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        tags: { api: 'yes' },
      });

      check(coursesRes, {
        'courses list status 200': (r) => r.status === 200,
        'courses response time < 500ms': (r) => r.timings.duration < 500,
        'has courses data': (r) => {
          const body = JSON.parse(r.body);
          return body.data && body.data.length > 0;
        },
      });

      sleep(THINK_TIME);
    });

    // 4. Get course details
    group('4. View Course Details', () => {
      const courseRes = http.get(`${BASE_URL}/v1/courses/1`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        tags: { api: 'yes' },
      });

      check(courseRes, {
        'course details status 200': (r) => r.status === 200,
        'course response time < 500ms': (r) => r.timings.duration < 500,
      });

      sleep(THINK_TIME);
    });

    // 5. Enroll in course
    group('5. Enroll in Course', () => {
      const enrollRes = http.post(`${BASE_URL}/v1/courses/1/enroll`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
        tags: { api: 'yes' },
      });

      check(enrollRes, {
        'enroll status 200': (r) => r.status === 200 || r.status === 409,
        'enroll response time < 500ms': (r) => r.timings.duration < 500,
      });

      sleep(THINK_TIME);
    });

    // 6. Get user profile
    group('6. View User Profile', () => {
      const profileRes = http.get(`${BASE_URL}/v1/users/${__VU}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        tags: { api: 'yes' },
      });

      check(profileRes, {
        'profile status 200 or 404': (r) => r.status === 200 || r.status === 404,
        'profile response time < 500ms': (r) => r.timings.duration < 500,
      });

      sleep(THINK_TIME);
    });

    // 7. Get Stellar balance
    group('7. Check Stellar Balance', () => {
      const balanceRes = http.get(
        `${BASE_URL}/v1/stellar/balance/GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJBBX7UYXNMWX5YSXF3YFQHF`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          tags: { api: 'yes' },
        },
      );

      check(balanceRes, {
        'balance status 200 or 404': (r) => r.status === 200 || r.status === 404,
        'balance response time < 1000ms': (r) => r.timings.duration < 1000,
      });

      sleep(THINK_TIME);
    });
  });
}
