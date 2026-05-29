import { PactV3 } from '@pact-foundation/pact';
import axios from 'axios';

const pact = new PactV3({
  consumer: 'Scoopdope-Frontend',
  provider: 'Scoopdope-Backend',
  dir: './pacts',
});

describe('Auth API Contract Tests', () => {
  const baseUrl = 'http://localhost:3000';
  const client = axios.create({ baseURL: baseUrl });

  describe('POST /v1/auth/register', () => {
    it('should register a new user', async () => {
      await pact
        .addInteraction()
        .given('user does not exist')
        .uponReceiving('a request to register')
        .withRequest('POST', '/v1/auth/register', {
          body: {
            email: 'test@example.com',
            password: 'Test@1234!',
            username: 'testuser',
          },
        })
        .willRespondWith(201, {
          body: {
            id: expect.any(String),
            email: 'test@example.com',
            username: 'testuser',
          },
        })
        .executeTest(async () => {
          const response = await client.post('/v1/auth/register', {
            email: 'test@example.com',
            password: 'Test@1234!',
            username: 'testuser',
          });
          expect(response.status).toBe(201);
          expect(response.data.email).toBe('test@example.com');
        });
    });

    it('should reject duplicate email', async () => {
      await pact
        .addInteraction()
        .given('user with email exists')
        .uponReceiving('a request to register with duplicate email')
        .withRequest('POST', '/v1/auth/register', {
          body: {
            email: 'existing@example.com',
            password: 'Test@1234!',
            username: 'newuser',
          },
        })
        .willRespondWith(409, {
          body: {
            statusCode: 409,
            message: 'Email already exists',
          },
        })
        .executeTest(async () => {
          try {
            await client.post('/v1/auth/register', {
              email: 'existing@example.com',
              password: 'Test@1234!',
              username: 'newuser',
            });
          } catch (error: any) {
            expect(error.response.status).toBe(409);
          }
        });
    });
  });

  describe('POST /v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      await pact
        .addInteraction()
        .given('user exists with credentials')
        .uponReceiving('a request to login')
        .withRequest('POST', '/v1/auth/login', {
          body: {
            email: 'user@example.com',
            password: 'Test@1234!',
          },
        })
        .willRespondWith(200, {
          body: {
            access_token: expect.any(String),
            user: {
              id: expect.any(String),
              email: 'user@example.com',
            },
          },
        })
        .executeTest(async () => {
          const response = await client.post('/v1/auth/login', {
            email: 'user@example.com',
            password: 'Test@1234!',
          });
          expect(response.status).toBe(200);
          expect(response.data.access_token).toBeDefined();
        });
    });

    it('should reject invalid credentials', async () => {
      await pact
        .addInteraction()
        .given('user exists')
        .uponReceiving('a request to login with wrong password')
        .withRequest('POST', '/v1/auth/login', {
          body: {
            email: 'user@example.com',
            password: 'WrongPassword',
          },
        })
        .willRespondWith(401, {
          body: {
            statusCode: 401,
            message: 'Invalid credentials',
          },
        })
        .executeTest(async () => {
          try {
            await client.post('/v1/auth/login', {
              email: 'user@example.com',
              password: 'WrongPassword',
            });
          } catch (error: any) {
            expect(error.response.status).toBe(401);
          }
        });
    });
  });
});
