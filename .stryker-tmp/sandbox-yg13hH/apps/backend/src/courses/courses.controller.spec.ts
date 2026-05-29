import { CoursesController } from './courses.controller';

describe('CoursesController', () => {
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };
  let controller: CoursesController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CoursesController(mockService as any);
  });

  it('findAll should return list of courses', async () => {
    const courses = [{ id: '1' }];
    mockService.findAll.mockResolvedValue(courses);

    await expect(controller.findAll()).resolves.toEqual(courses);
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne should return a course by id', async () => {
    const course = { id: '1' };
    mockService.findOne.mockResolvedValue(course);

    await expect(controller.findOne('1')).resolves.toEqual(course);
    expect(mockService.findOne).toHaveBeenCalledWith('1');
  });
});
