// @ts-nocheck
import http from 'k6/http';
import { check, sleep, group } from 'k6';

/**
 * Enrollment Load Test
 * Tests course enrollment flow under load: login → list courses → enroll → verify
 */

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<600', 'p(99)<1200'],
    http_req_failed: ['rate<0.05'],
    'http_req_duration{endpoint:enroll}': ['p(95)<800'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3000';

export function setup() {
  // Register a test user and return auth token + course list
  const email = `enroll_setup_${Date.now()}@example.com`;
  const reg = http.post(
    `${BASE_URL}/v1/auth/register`,
    JSON.stringify({ email, password: 'Test@1234!', username: `enroll_${Date.now()}` }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  const token = reg.status === 201 ? JSON.parse(reg.body).access_token : null;

  const coursesRes = http.get(`${BASE_URL}/v1/courses`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const courses = coursesRes.status === 200 ? JSON.parse(coursesRes.body) : [];
  const courseIds = Array.isArray(courses)
    ? courses.slice(0, 5).map((c) => c.id)
    : [];

  return { courseIds };
}

export default function (data) {
  const email = `enroll_vu${__VU}_${__ITER}@example.com`;

  let token = null;

  group('Auth', () => {
    const reg = http.post(
      `${BASE_URL}/v1/auth/register`,
      JSON.stringify({ email, password: 'Test@1234!', username: `vu${__VU}_${__ITER}` }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    if (reg.status === 201) {
      token = JSON.parse(reg.body).access_token;
    } else {
      // Try login if already registered
      const login = http.post(
        `${BASE_URL}/v1/auth/login`,
        JSON.stringify({ email, password: 'Test@1234!' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (login.status === 200) token = JSON.parse(login.body).access_token;
    }
  });

  if (!token) {
    sleep(1);
    return;
  }

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  group('Browse Courses', () => {
    const res = http.get(`${BASE_URL}/v1/courses`, { headers: authHeaders });
    check(res, {
      'courses listed': (r) => r.status === 200,
      'response time ok': (r) => r.timings.duration < 600,
    });
  });

  sleep(1);

  group('Enroll', () => {
    const courseIds = data.courseIds;
    if (!courseIds || courseIds.length === 0) return;

    const courseId = courseIds[__VU % courseIds.length];
    const res = http.post(
      `${BASE_URL}/v1/enrollments`,
      JSON.stringify({ courseId }),
      { headers: authHeaders, tags: { endpoint: 'enroll' } }
    );
    check(res, {
      'enrolled or already enrolled': (r) => r.status === 201 || r.status === 409,
      'enroll response time ok': (r) => r.timings.duration < 800,
    });
  });

  sleep(1);
}
