import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PactV3 } from '@pact-foundation/pact';
import axios from 'axios';

const pact = new PactV3({
  consumer: 'Scoopdope-Frontend',
  provider: 'Scoopdope-Backend',
  dir: './pacts',
});

describe('GET /credentials/:userId', () => {
  beforeAll(async () => {
    await pact.setup();
  });

  afterAll(async () => {
    await pact.finalize();
  });

  it('returns user credentials', async () => {
    const userId = '123';

    await pact
      .addInteraction()
      .uponReceiving(`a request for credentials of user ${userId}`)
      .withRequest('GET', `/credentials/${userId}`)
      .willRespondWith(200, (builder) => {
        builder.jsonBody([
          {
            id: expect.any(String),
            courseId: expect.any(String),
            courseName: expect.any(String),
            issuedAt: expect.any(String),
            credentialHash: expect.any(String),
          },
        ]);
      });

    const response = await axios.get(`${pact.mockService.baseUrl}/credentials/${userId}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    if (response.data.length > 0) {
      expect(response.data[0]).toHaveProperty('id');
      expect(response.data[0]).toHaveProperty('courseId');
    }
  });

  it('returns 404 for non-existent user', async () => {
    const userId = 'nonexistent';

    await pact
      .addInteraction()
      .uponReceiving(`a request for credentials of non-existent user ${userId}`)
      .withRequest('GET', `/credentials/${userId}`)
      .willRespondWith(404, (builder) => {
        builder.jsonBody({
          message: 'User not found',
        });
      });

    try {
      await axios.get(`${pact.mockService.baseUrl}/credentials/${userId}`);
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
});
