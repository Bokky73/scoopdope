import { StreaksService } from './streaks.service';
import { User } from '../users/user.entity';

describe('StreaksService', () => {
  let service: StreaksService;
  const mockUserRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const mockStellarService = {
    mintReward: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StreaksService(
      mockUserRepo as any,
      mockStellarService as any
    );
  });

  it('should start a streak for a new user', async () => {
    const user = { id: '1', currentStreak: 0, longestStreak: 0, lastActivityAt: null } as User;
    mockUserRepo.findOne.mockResolvedValue(user);
    mockUserRepo.save.mockImplementation((u) => Promise.resolve(u));

    const result = await service.recordActivity('1');

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastActivityAt).toBeDefined();
    expect(mockUserRepo.save).toHaveBeenCalled();
  });

  it('should increment streak on consecutive days', async () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const user = {
      id: '1',
      currentStreak: 5,
      longestStreak: 5,
      lastActivityAt: yesterday,
    } as User;
    mockUserRepo.findOne.mockResolvedValue(user);
    mockUserRepo.save.mockImplementation((u) => Promise.resolve(u));

    const result = await service.recordActivity('1');

    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
  });

  it('should reset streak if a day is missed', async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);

    const user = {
      id: '1',
      currentStreak: 5,
      longestStreak: 5,
      lastActivityAt: twoDaysAgo,
    } as User;
    mockUserRepo.findOne.mockResolvedValue(user);
    mockUserRepo.save.mockImplementation((u) => Promise.resolve(u));

    const result = await service.recordActivity('1');

    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(5);
  });

  it('should not increment streak if active on the same day', async () => {
    const today = new Date();
    const user = {
      id: '1',
      currentStreak: 5,
      longestStreak: 5,
      lastActivityAt: today,
    } as User;
    mockUserRepo.findOne.mockResolvedValue(user);
    mockUserRepo.save.mockImplementation((u) => Promise.resolve(u));

    const result = await service.recordActivity('1');

    expect(result.currentStreak).toBe(5);
  });

  it('should mint reward on milestone reach (7 days)', async () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    const user = {
      id: '1',
      currentStreak: 6,
      longestStreak: 6,
      lastActivityAt: yesterday,
      stellarPublicKey: 'G...',
    } as User;
    mockUserRepo.findOne.mockResolvedValue(user);
    mockUserRepo.save.mockImplementation((u) => Promise.resolve(u));

    await service.recordActivity('1');

    expect(mockStellarService.mintReward).toHaveBeenCalledWith('G...', 10);
  });
});
