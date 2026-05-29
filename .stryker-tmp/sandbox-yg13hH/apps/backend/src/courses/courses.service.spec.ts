import { CoursesService } from './courses.service';
import { Course } from './course.entity';

describe('CoursesService', () => {
  const mockRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  let service: CoursesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CoursesService(mockRepo as unknown as any);
  });

  it('findAll should query published courses', async () => {
    const expected: Course[] = [{ id: '1', title: 'A', isPublished: true } as Course];
    mockRepo.find.mockResolvedValue(expected);

    await expect(service.findAll()).resolves.toEqual(expected);
    expect(mockRepo.find).toHaveBeenCalledWith({ where: { isPublished: true } });
  });

  it('findOne should query by id', async () => {
    const expected = { id: '1', title: 'A' } as Course;
    mockRepo.findOne.mockResolvedValue(expected);

    await expect(service.findOne('1')).resolves.toEqual(expected);
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('create should build and save course', async () => {
    const payload: Partial<Course> = { title: 'New Course' };
    const created = { id: '1', title: 'New Course' } as Course;
    mockRepo.create.mockReturnValue(created);
    mockRepo.save.mockResolvedValue(created);

    await expect(service.create(payload)).resolves.toEqual(created);
    expect(mockRepo.create).toHaveBeenCalledWith(payload);
    expect(mockRepo.save).toHaveBeenCalledWith(created);
  });
});
