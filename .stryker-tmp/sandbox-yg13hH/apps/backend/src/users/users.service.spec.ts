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
    service = new UsersService(mockRepo as unknown as any);
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
});
