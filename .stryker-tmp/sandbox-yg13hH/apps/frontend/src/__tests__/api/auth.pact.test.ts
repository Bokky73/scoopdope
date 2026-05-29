import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PactV3 } from '@pact-foundation/pact';
import axios from 'axios';

const pact = new PactV3({
  consumer: 'Scoopdope-Frontend',
  provider: 'Scoopdope-Backend',
  dir: './pacts',
});

describe('POST /auth/login', () => {
  beforeAll(async () => {
    await pact.setup();
  });

  afterAll(async () => {
    await pact.finalize();
  });

  it('returns JWT token on successful login', async () => {
    await pact
      .addInteraction()
      .uponReceiving('a login request with valid credentials')
      .withRequest('POST', '/auth/login', (builder) => {
        builder.jsonBody({
          email: 'user@example.com',
          password: 'password123',
        });
      })
      .willRespondWith(200, (builder) => {
        builder.jsonBody({
          access_token: expect.any(String),
          user: {
            id: expect.any(String),
            email: expect.any(String),
            role: expect.any(String),
          },
        });
      });

    const response = await axios.post(`${pact.mockService.baseUrl}/auth/login`, {
      email: 'user@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('access_token');
    expect(response.data.user).toHaveProperty('email');
  });

  it('returns 401 on invalid credentials', async () => {
    await pact
      .addInteraction()
      .uponReceiving('a login request with invalid credentials')
      .withRequest('POST', '/auth/login', (builder) => {
        builder.jsonBody({
          email: 'user@example.com',
          password: 'wrongpassword',
        });
      })
      .willRespondWith(401, (builder) => {
        builder.jsonBody({
          message: 'Invalid credentials',
        });
      });

    try {
      await axios.post(`${pact.mockService.baseUrl}/auth/login`, {
        email: 'user@example.com',
        password: 'wrongpassword',
      });
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
});
