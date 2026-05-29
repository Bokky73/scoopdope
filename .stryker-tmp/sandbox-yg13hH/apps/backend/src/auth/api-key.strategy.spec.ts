import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiKeyStrategy } from '../../../src/auth/api-key.strategy';
import { ApiKey } from '../../../src/auth/api-key.entity';
import * as crypto from 'crypto';

const mockApiKeyRepo = {
  findOne: jest.fn(),
  update: jest.fn().mockResolvedValue(undefined),
};

describe('ApiKeyStrategy', () => {
  let strategy: ApiKeyStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyStrategy,
        { provide: getRepositoryToken(ApiKey), useValue: mockApiKeyRepo },
      ],
    }).compile();

    strategy = module.get<ApiKeyStrategy>(ApiKeyStrategy);
  });

  afterEach(() => jest.clearAllMocks());

  it('resolves the linked user for a valid active API key', async () => {
    const rawKey = 'bst_testkey123';
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const fakeUser = { id: 'user-1', email: 'svc@example.com', role: 'admin' };
    mockApiKeyRepo.findOne.mockResolvedValue({
      id: 'key-1',
      keyHash: hash,
      isActive: true,
      user: fakeUser,
    });

    await new Promise<void>((resolve) => {
      (strategy as any).verify(rawKey, (err: any, user: any) => {
        expect(err).toBeNull();
        expect(user).toEqual(fakeUser);
        resolve();
      });
    });
  });

  it('returns UnauthorizedException for an unknown key', async () => {
    mockApiKeyRepo.findOne.mockResolvedValue(null);

    await new Promise<void>((resolve) => {
      (strategy as any).verify('invalid_key', (err: any, user: any) => {
        expect(err).toBeDefined();
        expect(user).toBeNull();
        resolve();
      });
    });
  });
});
