import { PactV3 } from '@pact-foundation/pact';
import axios from 'axios';

const pact = new PactV3({
  consumer: 'Scoopdope-Frontend',
  provider: 'Scoopdope-Backend',
  dir: './pacts',
});

describe('Courses API Contract Tests', () => {
  const baseUrl = 'http://localhost:3000';
  const client = axios.create({ baseURL: baseUrl });

  describe('GET /v1/courses', () => {
    it('should list all courses', async () => {
      await pact
        .addInteraction()
        .given('courses exist')
        .uponReceiving('a request to list courses')
        .withRequest('GET', '/v1/courses')
        .willRespondWith(200, {
          body: {
            data: expect.arrayContaining([
              {
                id: expect.any(String),
                title: expect.any(String),
                description: expect.any(String),
              },
            ]),
            total: expect.any(Number),
          },
        })
        .executeTest(async () => {
          const response = await client.get('/v1/courses');
          expect(response.status).toBe(200);
          expect(Array.isArray(response.data.data)).toBe(true);
        });
    });
  });

  describe('GET /v1/courses/:id', () => {
    it('should get a single course', async () => {
      await pact
        .addInteraction()
        .given('course with id 1 exists')
        .uponReceiving('a request to get a course')
        .withRequest('GET', '/v1/courses/1')
        .willRespondWith(200, {
          body: {
            id: '1',
            title: expect.any(String),
            description: expect.any(String),
            modules: expect.arrayContaining([
              {
                id: expect.any(String),
                title: expect.any(String),
              },
            ]),
          },
        })
        .executeTest(async () => {
          const response = await client.get('/v1/courses/1');
          expect(response.status).toBe(200);
          expect(response.data.id).toBe('1');
        });
    });

    it('should return 404 for non-existent course', async () => {
      await pact
        .addInteraction()
        .given('course with id 999 does not exist')
        .uponReceiving('a request to get non-existent course')
        .withRequest('GET', '/v1/courses/999')
        .willRespondWith(404, {
          body: {
            statusCode: 404,
            message: 'Course not found',
          },
        })
        .executeTest(async () => {
          try {
            await client.get('/v1/courses/999');
          } catch (error: any) {
            expect(error.response.status).toBe(404);
          }
        });
    });
  });

  describe('POST /v1/courses/:id/enroll', () => {
    it('should enroll user in course', async () => {
      await pact
        .addInteraction()
        .given('user is authenticated and course exists')
        .uponReceiving('a request to enroll in course')
        .withRequest('POST', '/v1/courses/1/enroll', {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        })
        .willRespondWith(200, {
          body: {
            enrollment_id: expect.any(String),
            course_id: '1',
            status: 'active',
          },
        })
        .executeTest(async () => {
          const response = await client.post(
            '/v1/courses/1/enroll',
            {},
            {
              headers: {
                Authorization: 'Bearer valid-token',
              },
            },
          );
          expect(response.status).toBe(200);
          expect(response.data.status).toBe('active');
        });
    });
  });
});
