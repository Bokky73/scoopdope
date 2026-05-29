import { ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  const mockService = {
    findById: jest.fn(),
    update: jest.fn(),
  };
  let controller: UsersController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersController(mockService as any);
  });

  it('findOne should return a user', async () => {
    const user = { id: '1', email: 'u@example.com' };
    mockService.findById.mockResolvedValue(user);

    await expect(controller.findOne('1')).resolves.toEqual(user);
    expect(mockService.findById).toHaveBeenCalledWith('1');
  });

  it('update should update when same user id', async () => {
    const dto = { username: 'TestUser' };
    mockService.update.mockResolvedValue({ id: '1', ...dto });

    await expect(controller.update('1', dto, { user: { id: '1' } })).resolves.toEqual({
      id: '1',
      ...dto,
    });
    expect(mockService.update).toHaveBeenCalledWith('1', dto);
  });

  it('update should throw ForbiddenException for different user', async () => {
    await expect(controller.update('1', { username: 'X' }, { user: { id: '2' } })).rejects.toThrow(
      ForbiddenException
    );
  });
});
