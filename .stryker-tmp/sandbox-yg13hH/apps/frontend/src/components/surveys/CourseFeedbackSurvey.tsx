'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface Question {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'mcq';
  options?: string[];
  required: boolean;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  allowAnonymous: boolean;
  questions: Question[];
}

interface Props {
  survey: Survey;
  onSubmitted?: () => void;
}

export function CourseFeedbackSurvey({ survey, onSubmitted }: Props) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setAnswer(questionId: string, value: string | number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/v1/surveys/${survey.id}/responses`, { answers, isAnonymous });
      setSubmitted(true);
      onSubmitted?.();
    } catch {
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-6 text-center space-y-2">
        <p className="text-2xl">🎉</p>
        <p className="font-semibold text-green-700 dark:text-green-300">Thank you for your feedback!</p>
        <p className="text-sm text-green-600 dark:text-green-400">Your response helps improve this course.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{survey.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{survey.description}</p>
      </div>

      {survey.questions.map((q) => (
        <div key={q.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {q.text}
            {q.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {q.type === 'rating' && (
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAnswer(q.id, n)}
                  className={`w-9 h-9 rounded-full text-sm font-medium border transition-colors ${
                    answers[q.id] === n
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-400'
                  }`}
                  aria-label={`Score ${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {q.type === 'text' && (
            <textarea
              rows={3}
              value={(answers[q.id] as string) ?? ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              required={q.required}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {q.type === 'mcq' && q.options && (
            <div className="space-y-1">
              {q.options.map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswer(q.id, opt)}
                    required={q.required}
                    className="accent-blue-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}

      {survey.allowAnonymous && (
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="accent-blue-600"
          />
          Submit anonymously
        </label>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium py-2 px-4 transition-colors"
      >
        {submitting ? 'Submitting…' : 'Submit Feedback'}
      </button>
    </form>
  );
}
