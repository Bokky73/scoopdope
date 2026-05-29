import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PactV3 } from '@pact-foundation/pact';
import axios from 'axios';

const pact = new PactV3({
  consumer: 'Scoopdope-Frontend',
  provider: 'Scoopdope-Backend',
  dir: './pacts',
});

describe('GET /courses', () => {
  beforeAll(async () => {
    await pact.setup();
  });

  afterAll(async () => {
    await pact.finalize();
  });

  it('returns a list of courses', async () => {
    await pact
      .addInteraction()
      .uponReceiving('a request for all courses')
      .withRequest('GET', '/courses')
      .willRespondWith(200, (builder) => {
        builder.jsonBody([
          {
            id: expect.any(String),
            title: expect.any(String),
            description: expect.any(String),
            instructor: expect.any(String),
          },
        ]);
      });

    const response = await axios.get(`${pact.mockService.baseUrl}/courses`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0]).toHaveProperty('id');
    expect(response.data[0]).toHaveProperty('title');
  });
});
