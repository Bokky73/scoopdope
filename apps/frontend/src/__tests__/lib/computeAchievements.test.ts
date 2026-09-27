import { describe, it, expect } from 'vitest';
import { computeAchievements } from '@/app/profile/computeAchievements';
import type { ProgressRecord } from '@/app/profile/types';

const noProgress: ProgressRecord[] = [];

const inProgressRecord: ProgressRecord = {
  id: '1',
  courseId: 'c1',
  progressPct: 50,
  updatedAt: new Date().toISOString(),
};

const completedRecord: ProgressRecord = {
  id: '2',
  courseId: 'c2',
  progressPct: 100,
  updatedAt: new Date().toISOString(),
};

describe('computeAchievements', () => {
  it('always returns exactly 5 badges', () => {
    const result = computeAchievements({ credentialCount: 0, bstBalance: 0, progressRecords: [] });
    expect(result).toHaveLength(5);
  });

  it('returns badges with distinct IDs', () => {
    const result = computeAchievements({ credentialCount: 3, bstBalance: 100, progressRecords: [] });
    const ids = result.map((b) => b.id);
    expect(new Set(ids).size).toBe(5);
  });

  describe('first-step badge', () => {
    it('is NOT earned with 0 credentials', () => {
      const result = computeAchievements({ credentialCount: 0, bstBalance: 0, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'first-step')?.earned).toBe(false);
    });

    it('IS earned with 1 credential', () => {
      const result = computeAchievements({ credentialCount: 1, bstBalance: 0, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'first-step')?.earned).toBe(true);
    });

    it('IS earned with more than 1 credential', () => {
      const result = computeAchievements({ credentialCount: 10, bstBalance: 0, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'first-step')?.earned).toBe(true);
    });
  });

  describe('course-collector badge', () => {
    it('is NOT earned with fewer than 5 credentials', () => {
      const result = computeAchievements({ credentialCount: 4, bstBalance: 0, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'course-collector')?.earned).toBe(false);
    });

    it('IS earned with exactly 5 credentials', () => {
      const result = computeAchievements({ credentialCount: 5, bstBalance: 0, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'course-collector')?.earned).toBe(true);
    });

    it('IS earned with more than 5 credentials', () => {
      const result = computeAchievements({ credentialCount: 20, bstBalance: 0, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'course-collector')?.earned).toBe(true);
    });
  });

  describe('token-earner badge', () => {
    it('is NOT earned with 0 BST', () => {
      const result = computeAchievements({ credentialCount: 0, bstBalance: 0, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'token-earner')?.earned).toBe(false);
    });

    it('IS earned with positive BST balance', () => {
      const result = computeAchievements({ credentialCount: 0, bstBalance: 1, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'token-earner')?.earned).toBe(true);
    });

    it('IS earned with a large BST balance', () => {
      const result = computeAchievements({ credentialCount: 0, bstBalance: 9999, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'token-earner')?.earned).toBe(true);
    });
  });

  describe('high-achiever badge', () => {
    it('is NOT earned with balance < 500', () => {
      const result = computeAchievements({ credentialCount: 0, bstBalance: 499, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'high-achiever')?.earned).toBe(false);
    });

    it('IS earned with exactly 500 BST', () => {
      const result = computeAchievements({ credentialCount: 0, bstBalance: 500, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'high-achiever')?.earned).toBe(true);
    });

    it('IS earned with more than 500 BST', () => {
      const result = computeAchievements({ credentialCount: 0, bstBalance: 1000, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'high-achiever')?.earned).toBe(true);
    });
  });

  describe('dedicated-learner badge', () => {
    it('is NOT earned with no progress records', () => {
      const result = computeAchievements({ credentialCount: 0, bstBalance: 0, progressRecords: noProgress });
      expect(result.find((b) => b.id === 'dedicated-learner')?.earned).toBe(false);
    });

    it('is NOT earned when all courses are at 0%', () => {
      const records: ProgressRecord[] = [
        { id: '1', courseId: 'c1', progressPct: 0, updatedAt: '' },
      ];
      const result = computeAchievements({ credentialCount: 0, bstBalance: 0, progressRecords: records });
      expect(result.find((b) => b.id === 'dedicated-learner')?.earned).toBe(false);
    });

    it('is NOT earned when all courses are completed (100%)', () => {
      const result = computeAchievements({ credentialCount: 0, bstBalance: 0, progressRecords: [completedRecord] });
      expect(result.find((b) => b.id === 'dedicated-learner')?.earned).toBe(false);
    });

    it('IS earned when at least one course is in-progress', () => {
      const result = computeAchievements({ credentialCount: 0, bstBalance: 0, progressRecords: [inProgressRecord] });
      expect(result.find((b) => b.id === 'dedicated-learner')?.earned).toBe(true);
    });

    it('IS earned when mixed records include an in-progress one', () => {
      const result = computeAchievements({
        credentialCount: 0,
        bstBalance: 0,
        progressRecords: [completedRecord, inProgressRecord],
      });
      expect(result.find((b) => b.id === 'dedicated-learner')?.earned).toBe(true);
    });
  });
});
