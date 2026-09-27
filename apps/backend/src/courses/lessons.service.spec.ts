import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LessonsService } from './lessons.service';
import { Lesson } from './lesson.entity';
import { SearchService } from '../search/search.service';
import { TranscribeService } from './transcribe.service';

describe('LessonsService — Reorder Functionality', () => {
  let service: LessonsService;
  let repo: jest.Mocked<Repository<Lesson>>;
  let searchService: jest.Mocked<SearchService>;
  let transcribeService: jest.Mocked<TranscribeService>;

  const MODULE_ID = 'module-123';

  function mockLesson(overrides: Partial<Lesson> = {}): Lesson {
    return {
      id: `lesson-${Math.random()}`,
      moduleId: MODULE_ID,
      title: 'Test Lesson',
      content: 'Test content',
      order: 0,
      videoUrl: null,
      transcript: null,
      transcriptSrt: null,
      transcriptionJobName: null,
      durationMinutes: 0,
      assignments: [],
      createdAt: new Date(),
      ...overrides,
    } as Lesson;
  }

  beforeEach(async () => {
    const mockRepo: Partial<jest.Mocked<Repository<Lesson>>> = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    };

    const mockSearchService: Partial<jest.Mocked<SearchService>> = {
      indexLesson: jest.fn().mockResolvedValue(undefined),
      deleteFromIndex: jest.fn().mockResolvedValue(undefined),
    };

    const mockTranscribeService: Partial<jest.Mocked<TranscribeService>> = {
      startTranscription: jest.fn(),
      getTranscriptionResult: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        { provide: getRepositoryToken(Lesson), useValue: mockRepo },
        { provide: SearchService, useValue: mockSearchService },
        { provide: TranscribeService, useValue: mockTranscribeService },
      ],
    }).compile();

    service = module.get(LessonsService);
    repo = module.get(getRepositoryToken(Lesson));
    searchService = module.get(SearchService);
    transcribeService = module.get(TranscribeService);
  });

  describe('reorder — lesson reordering with order field update', () => {
    it('throws NotFoundException when lesson ID does not exist in module', async () => {
      const lesson1 = mockLesson({ id: 'lesson-1', order: 0 });
      const lesson2 = mockLesson({ id: 'lesson-2', order: 1 });

      repo.find.mockResolvedValue([lesson1, lesson2]);

      await expect(
        service.reorder(MODULE_ID, ['lesson-1', 'nonexistent-lesson', 'lesson-2'])
      ).rejects.toThrow(NotFoundException);
    });

    it('reorders lessons with new sequential order values starting from 0', async () => {
      const lesson1 = mockLesson({ id: 'lesson-1', order: 0, title: 'First' });
      const lesson2 = mockLesson({ id: 'lesson-2', order: 1, title: 'Second' });
      const lesson3 = mockLesson({ id: 'lesson-3', order: 2, title: 'Third' });

      repo.find
        .mockResolvedValueOnce([lesson1, lesson2, lesson3]) // Initial fetch
        .mockResolvedValueOnce([lesson3, lesson2, lesson1]); // After reorder

      const saves: Lesson[] = [];
      repo.save.mockImplementation((lesson) => {
        saves.push(lesson as Lesson);
        return Promise.resolve(lesson as Lesson);
      });

      const result = await service.reorder(MODULE_ID, ['lesson-3', 'lesson-2', 'lesson-1']);

      // Verify saves were called with correct order
      expect(saves).toHaveLength(3);
      expect(saves[0]).toMatchObject({ id: 'lesson-3', order: 0 });
      expect(saves[1]).toMatchObject({ id: 'lesson-2', order: 1 });
      expect(saves[2]).toMatchObject({ id: 'lesson-1', order: 2 });

      // Verify result is returned in order
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('lesson-3');
      expect(result[1].id).toBe('lesson-2');
      expect(result[2].id).toBe('lesson-1');
    });

    it('supports partial reordering with a subset of lesson IDs', async () => {
      const lesson1 = mockLesson({ id: 'lesson-1', order: 0, title: 'First' });
      const lesson2 = mockLesson({ id: 'lesson-2', order: 1, title: 'Second' });
      const lesson3 = mockLesson({ id: 'lesson-3', order: 2, title: 'Third' });

      repo.find
        .mockResolvedValueOnce([lesson1, lesson2, lesson3]) // Initial fetch
        .mockResolvedValueOnce([lesson2, lesson1, lesson3]); // After partial reorder

      const saves: Lesson[] = [];
      repo.save.mockImplementation((lesson) => {
        saves.push(lesson as Lesson);
        return Promise.resolve(lesson as Lesson);
      });

      // Only reorder lesson-2 and lesson-1, leave lesson-3 unchanged
      const result = await service.reorder(MODULE_ID, ['lesson-2', 'lesson-1']);

      // Only the specified lessons should be saved with new order values
      expect(saves).toHaveLength(2);
      expect(saves[0]).toMatchObject({ id: 'lesson-2', order: 0 });
      expect(saves[1]).toMatchObject({ id: 'lesson-1', order: 1 });

      // Result returns all lessons in order
      expect(result).toHaveLength(3);
    });

    it('reorders single lesson correctly', async () => {
      const lesson1 = mockLesson({ id: 'lesson-1', order: 0, title: 'First' });

      repo.find
        .mockResolvedValueOnce([lesson1]) // Initial fetch
        .mockResolvedValueOnce([lesson1]); // After reorder

      const saves: Lesson[] = [];
      repo.save.mockImplementation((lesson) => {
        saves.push(lesson as Lesson);
        return Promise.resolve(lesson as Lesson);
      });

      const result = await service.reorder(MODULE_ID, ['lesson-1']);

      expect(saves).toHaveLength(1);
      expect(saves[0]).toMatchObject({ id: 'lesson-1', order: 0 });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('lesson-1');
    });

    it('throws NotFoundException with descriptive message when lesson not found in module', async () => {
      const lesson1 = mockLesson({ id: 'lesson-1', order: 0 });
      const lesson2 = mockLesson({ id: 'lesson-2', order: 1 });

      repo.find.mockResolvedValue([lesson1, lesson2]);

      const nonexistentId = 'nonexistent-lesson';

      await expect(service.reorder(MODULE_ID, [nonexistentId, 'lesson-1'])).rejects.toThrow(
        `Lesson ${nonexistentId} not found in module ${MODULE_ID}`
      );
    });

    it('maintains lessons in sorted order in the returned result', async () => {
      const lesson1 = mockLesson({ id: 'lesson-1', order: 0 });
      const lesson2 = mockLesson({ id: 'lesson-2', order: 1 });
      const lesson3 = mockLesson({ id: 'lesson-3', order: 2 });

      repo.find
        .mockResolvedValueOnce([lesson1, lesson2, lesson3]) // Initial fetch
        .mockResolvedValueOnce([
          { ...lesson2, order: 0 },
          { ...lesson3, order: 1 },
          { ...lesson1, order: 2 },
        ]); // After reorder, sorted

      repo.save.mockImplementation((lesson) => Promise.resolve(lesson as Lesson));

      const result = await service.reorder(MODULE_ID, ['lesson-2', 'lesson-3', 'lesson-1']);

      // Results should be returned sorted by order field
      expect(result[0].order).toBe(0);
      expect(result[1].order).toBe(1);
      expect(result[2].order).toBe(2);
    });
  });

  describe('reorder — integration with other methods', () => {
    it('does not trigger transcription during reorder', async () => {
      const lesson1 = mockLesson({
        id: 'lesson-1',
        order: 0,
        videoUrl: 'http://example.com/video.mp4',
      });

      repo.find.mockResolvedValueOnce([lesson1]).mockResolvedValueOnce([lesson1]);

      repo.save.mockImplementation((lesson) => Promise.resolve(lesson as Lesson));

      await service.reorder(MODULE_ID, ['lesson-1']);

      // Verify transcription was not triggered
      expect(transcribeService.startTranscription).not.toHaveBeenCalled();
    });

    it('does not index lessons during reorder', async () => {
      const lesson1 = mockLesson({ id: 'lesson-1', order: 0 });

      repo.find.mockResolvedValueOnce([lesson1]).mockResolvedValueOnce([lesson1]);

      repo.save.mockImplementation((lesson) => Promise.resolve(lesson as Lesson));

      await service.reorder(MODULE_ID, ['lesson-1']);

      // Verify search index was not updated during reorder
      expect(searchService.indexLesson).not.toHaveBeenCalled();
    });
  });
});
