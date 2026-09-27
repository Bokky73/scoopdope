import {
  CourseSummary,
  DifficultyLevel,
  LearningPathRequest,
  LearningPathResponse,
  RecommendedCourse,
} from './learning-path.types';

export const DIFFICULTY_RANK: Record<DifficultyLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const KNOWN_LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];

/**
 * Normalize an arbitrary level string into a known DifficultyLevel.
 * Falls back to 'beginner' for anything unrecognized.
 */
export function normalizeLevel(level: string | undefined | null): DifficultyLevel {
  const lvl = (level || '').toString().trim().toLowerCase();
  if ((KNOWN_LEVELS as string[]).includes(lvl)) {
    return lvl as DifficultyLevel;
  }
  if (lvl.includes('inter')) return 'intermediate';
  if (lvl.includes('adv')) return 'advanced';
  if (lvl.includes('begin') || lvl === 'basic') return 'beginner';
  return 'beginner';
}

export function difficultyRank(level: DifficultyLevel): number {
  return DIFFICULTY_RANK[level];
}

/** Next difficulty tier after the given level, or null at the top tier. */
export function nextDifficulty(level: DifficultyLevel): DifficultyLevel | null {
  const rank = DIFFICULTY_RANK[level];
  if (rank >= 3) return null;
  return rank === 1 ? 'intermediate' : 'advanced';
}

export function prerequisitesSatisfied(
  course: CourseSummary,
  completedIds: Set<string>,
): boolean {
  const prereqs = course.prerequisiteIds ?? [];
  return prereqs.every((p) => completedIds.has(p));
}

/** A course is unlocked when all of its prerequisites are completed. */
export function isUnlocked(course: CourseSummary, completedIds: Set<string>): boolean {
  return prerequisitesSatisfied(course, completedIds);
}

/** Highest difficulty level among the student's completed courses. */
export function deriveStudentLevel(
  courses: CourseSummary[],
  completedIds: Set<string>,
): DifficultyLevel {
  let highest: DifficultyLevel = 'beginner';
  for (const c of courses) {
    if (completedIds.has(c.id)) {
      const lvl = normalizeLevel(c.level);
      if (difficultyRank(lvl) > difficultyRank(highest)) highest = lvl;
    }
  }
  return highest;
}

export interface RecommendOptions {
  courses: CourseSummary[];
  completedIds: Set<string>;
  enrolledIds: Set<string>;
  currentLevel: DifficultyLevel;
}

/**
 * Recommend the next available courses for a student.
 * Only unlocked (prerequisites met) courses are surfaced, ordered by how well
 * they match the student's next difficulty tier.
 */
export function recommendNextCourses(opts: RecommendOptions): RecommendedCourse[] {
  const { courses, completedIds, enrolledIds, currentLevel } = opts;
  const target = nextDifficulty(currentLevel) ?? currentLevel;

  const candidates = courses.filter((c) => {
    if (c.isDeleted) return false;
    if (c.isPublished === false) return false;
    if (completedIds.has(c.id)) return false;
    if (enrolledIds.has(c.id)) return false;
    return true;
  });

  return candidates
    .map((course) => {
      const level = normalizeLevel(course.level);
      const unlocked = prerequisitesSatisfied(course, completedIds);
      const reasons: string[] = [];
      const targetMatch = level === target;
      if (targetMatch) reasons.push(`Matches your next difficulty level (${target})`);
      else if (level === currentLevel)
        reasons.push(`Continue at your level (${currentLevel})`);
      if (unlocked) reasons.push('All prerequisites completed (unlocked)');

      return { course, level, unlocked, targetMatch, rank: difficultyRank(level), reasons };
    })
    // Acceptance: recommendations only show unlocked courses.
    .filter((x) => x.unlocked)
    .sort((a, b) => {
      if (a.targetMatch !== b.targetMatch) return a.targetMatch ? -1 : 1;
      if (a.rank !== b.rank) return a.rank - b.rank;
      return a.course.title.localeCompare(b.course.title);
    })
    .map((x) => ({
      id: x.course.id,
      title: x.course.title,
      level: x.level,
      reasons: x.reasons,
      unlocked: x.unlocked,
    }));
}

/**
 * Build the full learning path: every published course ordered by difficulty
 * tier, then by prerequisite depth within a tier.
 */
export function buildLearningPath(
  courses: CourseSummary[],
): { id: string; title: string; level: DifficultyLevel }[] {
  return courses
    .filter((c) => !c.isDeleted && c.isPublished !== false)
    .slice()
    .sort((a, b) => {
      const ra = difficultyRank(normalizeLevel(a.level));
      const rb = difficultyRank(normalizeLevel(b.level));
      if (ra !== rb) return ra - rb;
      const da = (a.prerequisiteIds ?? []).length;
      const db = (b.prerequisiteIds ?? []).length;
      if (da !== db) return da - db;
      return a.title.localeCompare(b.title);
    })
    .map((c) => ({ id: c.id, title: c.title, level: normalizeLevel(c.level) }));
}

/** Percentage (0-100) of the learning path the student has completed. */
export function computeCompletion(pathIds: string[], completedIds: Set<string>): number {
  if (pathIds.length === 0) return 0;
  const done = pathIds.filter((id) => completedIds.has(id)).length;
  return Math.round((done / pathIds.length) * 100);
}

export function getRecommendations(req: LearningPathRequest): LearningPathResponse {
  const completedIds = new Set(req.completedCourseIds ?? []);
  const enrolledIds = new Set(req.enrolledCourseIds ?? []);
  const currentLevel = req.currentLevel
    ? normalizeLevel(req.currentLevel)
    : deriveStudentLevel(req.courses, completedIds);

  const recommendations = recommendNextCourses({
    courses: req.courses,
    completedIds,
    enrolledIds,
    currentLevel,
  });
  const learningPath = buildLearningPath(req.courses);
  const completionPercentage = computeCompletion(
    learningPath.map((p) => p.id),
    completedIds,
  );

  return {
    recommendations,
    learningPath,
    completionPercentage,
    currentLevel,
  };
}
