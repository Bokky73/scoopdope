import {
  buildLearningPath,
  computeCompletion,
  deriveStudentLevel,
  getRecommendations,
  nextDifficulty,
  normalizeLevel,
  recommendNextCourses,
} from './learning-path.logic';
import { CourseSummary, DifficultyLevel } from './learning-path.types';

const beginnerA: CourseSummary = {
  id: 'b1',
  title: 'Intro to Blockchain',
  level: 'beginner',
  prerequisiteIds: [],
  isPublished: true,
};
const beginnerB: CourseSummary = {
  id: 'b2',
  title: 'Wallets 101',
  level: 'beginner',
  prerequisiteIds: [],
  isPublished: true,
};
const intermediateA: CourseSummary = {
  id: 'i1',
  title: 'Smart Contracts',
  level: 'intermediate',
  prerequisiteIds: ['b1'],
  isPublished: true,
};
const intermediateB: CourseSummary = {
  id: 'i2',
  title: 'DeFi Basics',
  level: 'intermediate',
  prerequisiteIds: ['b1', 'b2'],
  isPublished: true,
};
const advancedA: CourseSummary = {
  id: 'a1',
  title: 'Protocol Design',
  level: 'advanced',
  prerequisiteIds: ['i1'],
  isPublished: true,
};

const allCourses = [beginnerA, beginnerB, intermediateA, intermediateB, advancedA];

describe('learning-path.logic', () => {
  describe('normalizeLevel', () => {
    it('maps known values and common variants', () => {
      expect(normalizeLevel('beginner')).toBe('beginner');
      expect(normalizeLevel('INTERMEDIATE')).toBe('intermediate');
      expect(normalizeLevel('Adv')).toBe('advanced');
      expect(normalizeLevel('basic')).toBe('beginner');
      expect(normalizeLevel('garbage')).toBe('beginner');
    });
  });

  describe('nextDifficulty', () => {
    it('steps through tiers', () => {
      expect(nextDifficulty('beginner')).toBe('intermediate');
      expect(nextDifficulty('intermediate')).toBe('advanced');
      expect(nextDifficulty('advanced')).toBeNull();
    });
  });

  describe('deriveStudentLevel', () => {
    it('returns highest completed tier', () => {
      expect(deriveStudentLevel(allCourses, new Set(['b1', 'i1']))).toBe('intermediate');
      expect(deriveStudentLevel(allCourses, new Set(['b1']))).toBe('beginner');
      expect(deriveStudentLevel(allCourses, new Set([]))).toBe('beginner');
    });
  });

  describe('recommendNextCourses', () => {
    it('suggests intermediate courses after beginner completion (unlocked only)', () => {
      const recs = recommendNextCourses({
        courses: allCourses,
        completedIds: new Set(['b1']),
        enrolledIds: new Set(),
        currentLevel: 'beginner',
      });
      // b2 is beginner & unlocked, i1 is intermediate & unlocked (prereq b1 done)
      const ids = recs.map((r) => r.id);
      expect(ids).toContain('b2');
      expect(ids).toContain('i1');
      // i2 locked (needs b2) and a1 locked (needs i1) are excluded
      expect(ids).not.toContain('i2');
      expect(ids).not.toContain('a1');
      // intermediate tier preferred
      expect(recs[0].id).toBe('i1');
    });

    it('only surfaces unlocked courses', () => {
      const recs = recommendNextCourses({
        courses: allCourses,
        completedIds: new Set(),
        enrolledIds: new Set(),
        currentLevel: 'beginner',
      });
      // nothing is unlocked for a fresh beginner except b1/b2 (no prereqs)
      const ids = recs.map((r) => r.id);
      expect(ids).toContain('b1');
      expect(ids).toContain('b2');
      // intermediate requires beginner prereqs -> locked -> excluded
      expect(ids).not.toContain('i1');
    });

    it('excludes already-completed and enrolled courses', () => {
      const recs = recommendNextCourses({
        courses: allCourses,
        completedIds: new Set(['b1']),
        enrolledIds: new Set(['i1']),
        currentLevel: 'beginner',
      });
      const ids = recs.map((r) => r.id);
      expect(ids).not.toContain('b1');
      expect(ids).not.toContain('i1');
      expect(ids).toContain('b2');
    });
  });

  describe('buildLearningPath', () => {
    it('orders by difficulty then prerequisite depth', () => {
      const path = buildLearningPath(allCourses);
      expect(path.map((p) => p.id)).toEqual(['b1', 'b2', 'i1', 'i2', 'a1']);
    });
  });

  describe('computeCompletion', () => {
    it('computes percentage of path completed', () => {
      const path = buildLearningPath(allCourses).map((p) => p.id);
      expect(computeCompletion(path, new Set(['b1', 'b2']))).toBe(40);
      expect(computeCompletion(path, new Set([]))).toBe(0);
      expect(computeCompletion(path, new Set(path))).toBe(100);
    });
  });

  describe('getRecommendations', () => {
    it('returns recommendations, learning path, completion and derived level', () => {
      const res = getRecommendations({
        courses: allCourses,
        completedCourseIds: ['b1'],
      });
      expect(res.currentLevel).toBe('beginner');
      expect(res.completionPercentage).toBe(20); // 1 of 5
      expect(res.recommendations.map((r) => r.id)).toContain('i1');
      expect(res.learningPath.map((p) => p.id)).toEqual(['b1', 'b2', 'i1', 'i2', 'a1']);
    });
  });
});
