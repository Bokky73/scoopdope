import { CoursesController } from './courses.controller';

describe('CoursesController', () => {
  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findOneForViewer: jest.fn(),
    submitForReview: jest.fn(),
    approveCourse: jest.fn(),
    archiveCourse: jest.fn(),
  };
  let controller: CoursesController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CoursesController(mockService as any);
  });

  it('findAll should return list of courses', async () => {
    const courses = [{ id: '1' }];
    mockService.findAll.mockResolvedValue(courses);

    await expect(controller.findAll({})).resolves.toEqual(courses);
    expect(mockService.findAll).toHaveBeenCalledWith({});
  });

  it('findOne should delegate to findOneForViewer with the current user', async () => {
    const course = { id: '1' };
    const req = { user: { id: 'u1', role: 'student' } };
    mockService.findOneForViewer.mockResolvedValue(course);

    await expect(controller.findOne('1', req)).resolves.toEqual(course);
    expect(mockService.findOneForViewer).toHaveBeenCalledWith('1', req.user);
  });

  it('submitForReview should pass the acting user to the service', async () => {
    const req = { user: { id: 'instr-1', role: 'instructor' } };
    mockService.submitForReview.mockResolvedValue({ id: '1', status: 'pending_review' });

    await expect(controller.submitForReview('1', req)).resolves.toEqual({
      id: '1',
      status: 'pending_review',
    });
    expect(mockService.submitForReview).toHaveBeenCalledWith('1', req.user);
  });

  it('approve should delegate to approveCourse', async () => {
    mockService.approveCourse.mockResolvedValue({ id: '1', status: 'published' });

    await expect(controller.approve('1')).resolves.toEqual({ id: '1', status: 'published' });
    expect(mockService.approveCourse).toHaveBeenCalledWith('1');
  });

  it('archive should pass the acting user to the service', async () => {
    const req = { user: { id: 'instr-1', role: 'instructor' } };
    mockService.archiveCourse.mockResolvedValue({ id: '1', status: 'archived' });

    await expect(controller.archive('1', req)).resolves.toEqual({ id: '1', status: 'archived' });
    expect(mockService.archiveCourse).toHaveBeenCalledWith('1', req.user);
  });
});
