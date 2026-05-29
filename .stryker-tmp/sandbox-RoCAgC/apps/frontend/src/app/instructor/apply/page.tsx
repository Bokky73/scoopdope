// @ts-nocheck
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface FormState {
  bio: string;
  expertise: string;
  motivation: string;
  linkedinUrl: string;
  portfolioUrl: string;
  agreementAccepted: boolean;
}

const INITIAL: FormState = {
  bio: '',
  expertise: '',
  motivation: '',
  linkedinUrl: '',
  portfolioUrl: '',
  agreementAccepted: false,
};

export default function InstructorApplyPage() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.agreementAccepted) {
      setError('You must accept the instructor agreement to apply.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/v1/instructor-applications', {
        bio: form.bio,
        expertise: form.expertise,
        motivation: form.motivation,
        linkedinUrl: form.linkedinUrl || undefined,
        portfolioUrl: form.portfolioUrl || undefined,
        agreementAccepted: form.agreementAccepted,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? 'Failed to submit application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <ProtectedRoute>
        <main className="max-w-xl mx-auto p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Application Submitted!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Our team will review your application and get back to you within 3–5 business days.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Become an Instructor
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Share your knowledge and earn BST tokens. Fill out the form below and our team will
          review your application.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Professional Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.bio}
              onChange={set('bio')}
              required
              minLength={50}
              rows={4}
              placeholder="Tell us about your background and experience (min. 50 characters)"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Areas of Expertise <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.expertise}
              onChange={set('expertise')}
              required
              minLength={20}
              rows={2}
              placeholder="e.g. Stellar blockchain, Soroban smart contracts, DeFi"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Why do you want to teach on scoopdope? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.motivation}
              onChange={set('motivation')}
              required
              minLength={50}
              rows={4}
              placeholder="Describe your motivation and what courses you plan to create (min. 50 characters)"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={form.linkedinUrl}
                onChange={set('linkedinUrl')}
                placeholder="https://linkedin.com/in/..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Portfolio / Website URL
              </label>
              <input
                type="url"
                value={form.portfolioUrl}
                onChange={set('portfolioUrl')}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Instructor Agreement</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              By applying, you agree to create original, high-quality educational content, respect
              intellectual property rights, and abide by the scoopdope community guidelines and
              content policies.
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.agreementAccepted}
                onChange={set('agreementAccepted')}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                I have read and agree to the Instructor Agreement{' '}
                <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !form.agreementAccepted}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </main>
    </ProtectedRoute>
  );
}
