/**
 * Shared quiz-related types.
 * @module quiz.types
 */

/** A single answer option for a quiz question */
export interface QuizAnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

/** A single quiz question */
export interface QuizQuestion {
  id: string;
  quizId: string;
  text: string;
  order: number;
  answers: QuizAnswerOption[];
}

/** Quiz metadata */
export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description: string | null;
  passingScore: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for submitting a quiz attempt.
 */
export interface SubmitQuizAttemptDto {
  quizId: string;
  /** Map of questionId → answerId */
  answers: Record<string, string>;
}

/**
 * Result of a quiz attempt.
 */
export interface QuizAttemptResult {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}
