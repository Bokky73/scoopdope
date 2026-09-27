import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('UsersService', () => {
  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  let service: UsersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UsersService(
      mockRepo as unknown as any,
      mockRepo as unknown as any,
      mockRepo as unknown as any,
    );
  });

  it('findByEmail should query by email', async () => {
    const expected = { id: '1', email: 'test@example.com' } as User;
    mockRepo.findOne.mockResolvedValue(expected);

    await expect(service.findByEmail('test@example.com')).resolves.toEqual(expected);
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
  });

  it('findById should query by id', async () => {
    const expected = { id: '1', email: 'test@example.com' } as User;
    mockRepo.findOne.mockResolvedValue(expected);

    await expect(service.findById('1')).resolves.toEqual(expected);
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('create should build and save user', async () => {
    const payload: Partial<User> = { email: 'new@example.com' };
    const created = { id: '2', email: 'new@example.com' } as User;
    mockRepo.create.mockReturnValue(created);
    mockRepo.save.mockResolvedValue(created);

    await expect(service.create(payload)).resolves.toEqual(created);
    expect(mockRepo.create).toHaveBeenCalledWith(payload);
    expect(mockRepo.save).toHaveBeenCalledWith(created);
  });

  it('update should return updated user', async () => {
    const existing = { id: '1', email: 'test@example.com' } as User;
    const updated = { id: '1', email: 'test@example.com', username: 'abc' } as User;

    mockRepo.findOne.mockResolvedValue(existing);
    mockRepo.save.mockResolvedValue(updated);

    await expect(service.update('1', { username: 'abc' })).resolves.toEqual(updated);
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
    expect(mockRepo.save).toHaveBeenCalledWith({ ...existing, username: 'abc' });
  });

  it('update should throw NotFoundException when user missing', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await expect(service.update('1', { username: 'abc' })).rejects.toThrow('User not found');
  });

  describe('changeRole', () => {
    it('rejects an invalid role value with BadRequestException', async () => {
      await expect(service.changeRole('1', 'superuser')).rejects.toThrow('Invalid role');
      expect(mockRepo.findOne).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a nonexistent user', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.changeRole('1', 'instructor')).rejects.toThrow('User not found');
    });

    it('persists a valid role change', async () => {
      const existing = { id: '1', email: 'test@example.com', role: 'student' } as User;
      mockRepo.findOne.mockResolvedValue(existing);
      mockRepo.save.mockImplementation((u) => Promise.resolve(u));

      const result = await service.changeRole('1', 'instructor');

      expect(result.role).toBe('instructor');
      expect(mockRepo.save).toHaveBeenCalledWith({ ...existing, role: 'instructor' });
    });
  });

  it('update should block role escalation via profile update', async () => {
    const existing = { id: '1', email: 'test@example.com', role: 'student' } as User;
    const saved = { id: '1', email: 'test@example.com', role: 'student' } as User;

    mockRepo.findOne.mockResolvedValue(existing);
    mockRepo.save.mockResolvedValue(saved);

    await service.update('1', { role: 'admin' } as any);

    // The save call must NOT include role
    const saveCall = mockRepo.save.mock.calls[0][0];
    expect(saveCall.role).toBe('student');
  });

  it('update should block isBanned escalation via profile update', async () => {
    const existing = { id: '1', email: 'test@example.com', isBanned: false } as User;
    const saved = { id: '1', email: 'test@example.com', isBanned: false } as User;

    mockRepo.findOne.mockResolvedValue(existing);
    mockRepo.save.mockResolvedValue(saved);

    await service.update('1', { isBanned: true } as any);

    const saveCall = mockRepo.save.mock.calls[0][0];
    expect(saveCall.isBanned).toBe(false);
  });

  it('update should block id modification via profile update', async () => {
    const existing = { id: '1', email: 'test@example.com' } as User;
    const saved = { id: '1', email: 'test@example.com' } as User;

    mockRepo.findOne.mockResolvedValue(existing);
    mockRepo.save.mockResolvedValue(saved);

    await service.update('1', { id: '2' } as any);

    const saveCall = mockRepo.save.mock.calls[0][0];
    expect(saveCall.id).toBe('1');
  });

  it('update should block passwordHash via profile update', async () => {
    const existing = { id: '1', email: 'test@example.com' } as User;
    const saved = { id: '1', email: 'test@example.com' } as User;

    mockRepo.findOne.mockResolvedValue(existing);
    mockRepo.save.mockResolvedValue(saved);

    await service.update('1', { passwordHash: 'hacked' } as any);

    const saveCall = mockRepo.save.mock.calls[0][0];
    expect(saveCall.passwordHash).toBeUndefined();
  });

  it('update should pick allowed fields while dropping disallowed ones', async () => {
    const existing = {
      id: '1',
      email: 'test@example.com',
      username: 'oldname',
      role: 'student',
    } as User;
    const saved = {
      id: '1',
      email: 'test@example.com',
      username: 'newname',
      role: 'student',
    } as User;

    mockRepo.findOne.mockResolvedValue(existing);
    mockRepo.save.mockResolvedValue(saved);

    // Send both an allowed field (username) and disallowed field (role)
    await service.update('1', { username: 'newname', role: 'admin' } as any);

    const saveCall = mockRepo.save.mock.calls[0][0];
    expect(saveCall.username).toBe('newname');
    expect(saveCall.role).toBe('student');
  });

  describe('softDelete', () => {
    it('should set deletedAt on an active user', async () => {
      const user = { id: '1', email: 'test@example.com', deletedAt: null } as User;
      const saved = { ...user, deletedAt: expect.any(Date) };
      mockRepo.findOne.mockResolvedValue(user);
      mockRepo.save.mockResolvedValue(saved);

      await service.softDelete('1');

      expect(mockRepo.save).toHaveBeenCalledWith({ ...user, deletedAt: expect.any(Date) });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.softDelete('1')).rejects.toThrow('User not found');
    });

    it('should throw NotFoundException if user already deleted', async () => {
      const user = { id: '1', email: 'test@example.com', deletedAt: new Date() } as User;
      mockRepo.findOne.mockResolvedValue(user);
      await expect(service.softDelete('1')).rejects.toThrow('User already deleted');
    });
  });

  describe('bulkSoftDelete', () => {
    it('should delete all valid users and collect failures', async () => {
      const activeUser1 = { id: '1', email: 'a@example.com', deletedAt: null } as User;
      const activeUser2 = { id: '2', email: 'b@example.com', deletedAt: null } as User;
      const alreadyDeleted = { id: '3', email: 'c@example.com', deletedAt: new Date() } as User;

      mockRepo.findOne
        .mockResolvedValueOnce(activeUser1)
        .mockResolvedValueOnce(activeUser2)
        .mockResolvedValueOnce(alreadyDeleted);

      mockRepo.save
        .mockResolvedValueOnce({ ...activeUser1, deletedAt: new Date() })
        .mockResolvedValueOnce({ ...activeUser2, deletedAt: new Date() });

      const results = await service.bulkSoftDelete(['1', '2', '3']);

      expect(results.deleted).toEqual(['1', '2']);
      expect(results.failed).toEqual([
        { id: '3', reason: 'User already deleted' },
      ]);
    });

    it('should handle all failures gracefully', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const results = await service.bulkSoftDelete(['bad-1', 'bad-2']);

      expect(results.deleted).toEqual([]);
      expect(results.failed).toHaveLength(2);
    });

    it('should handle all successes', async () => {
      const user1 = { id: '1', deletedAt: null } as User;
      const user2 = { id: '2', deletedAt: null } as User;

      mockRepo.findOne
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      mockRepo.save
        .mockResolvedValueOnce({ ...user1, deletedAt: new Date() })
        .mockResolvedValueOnce({ ...user2, deletedAt: new Date() });

      const results = await service.bulkSoftDelete(['1', '2']);

      expect(results.deleted).toEqual(['1', '2']);
      expect(results.failed).toEqual([]);
    });
  });
});
