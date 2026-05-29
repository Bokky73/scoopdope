import { PactV3 } from '@pact-foundation/pact';
import axios from 'axios';

const pact = new PactV3({
  consumer: 'Scoopdope-Frontend',
  provider: 'Scoopdope-Backend',
  dir: './pacts',
});

describe('Users API Contract Tests', () => {
  const baseUrl = 'http://localhost:3000';
  const client = axios.create({ baseURL: baseUrl });

  describe('GET /v1/users/:id', () => {
    it('should get user profile', async () => {
      await pact
        .addInteraction()
        .given('user with id 1 exists')
        .uponReceiving('a request to get user profile')
        .withRequest('GET', '/v1/users/1', {
          headers: {
            Authorization: 'Bearer valid-token',
          },
        })
        .willRespondWith(200, {
          body: {
            id: '1',
            email: expect.any(String),
            username: expect.any(String),
            profile: {
              avatar: expect.any(String),
              bio: expect.any(String),
            },
          },
        })
        .executeTest(async () => {
          const response = await client.get('/v1/users/1', {
            headers: {
              Authorization: 'Bearer valid-token',
            },
          });
          expect(response.status).toBe(200);
          expect(response.data.id).toBe('1');
        });
    });

    it('should return 401 without authentication', async () => {
      await pact
        .addInteraction()
        .given('user is not authenticated')
        .uponReceiving('a request to get user profile without auth')
        .withRequest('GET', '/v1/users/1')
        .willRespondWith(401, {
          body: {
            statusCode: 401,
            message: 'Unauthorized',
          },
        })
        .executeTest(async () => {
          try {
            await client.get('/v1/users/1');
          } catch (error: any) {
            expect(error.response.status).toBe(401);
          }
        });
    });
  });

  describe('PUT /v1/users/:id', () => {
    it('should update user profile', async () => {
      await pact
        .addInteraction()
        .given('user with id 1 exists')
        .uponReceiving('a request to update user profile')
        .withRequest('PUT', '/v1/users/1', {
          headers: {
            Authorization: 'Bearer valid-token',
          },
          body: {
            username: 'newusername',
            bio: 'Updated bio',
          },
        })
        .willRespondWith(200, {
          body: {
            id: '1',
            username: 'newusername',
            bio: 'Updated bio',
          },
        })
        .executeTest(async () => {
          const response = await client.put(
            '/v1/users/1',
            {
              username: 'newusername',
              bio: 'Updated bio',
            },
            {
              headers: {
                Authorization: 'Bearer valid-token',
              },
            },
          );
          expect(response.status).toBe(200);
          expect(response.data.username).toBe('newusername');
        });
    });
  });
});
