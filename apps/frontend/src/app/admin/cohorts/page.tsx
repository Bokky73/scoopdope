'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cohortsApi, Cohort, CohortMember, CreateCohortPayload } from '@/lib/cohortsApi';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function AdminCohortsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Cohort | null>(null);
  const [members, setMembers] = useState<CohortMember[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [addUserId, setAddUserId] = useState('');
  const [exporting, setExporting] = useState(false);

  const [form, setForm] = useState<CreateCohortPayload>({
    courseId: '',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    maxMembers: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') router.replace('/dashboard');
  }, [user, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      cohortsApi.listAll().then(setCohorts).finally(() => setLoading(false));
    }
  }, [user]);

  async function openCohort(cohort: Cohort) {
    const full = await cohortsApi.getCohort(cohort.id);
    setSelected(full);
    setMembers(full.members ?? []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await cohortsApi.createCohort({
        ...form,
        maxMembers: Number(form.maxMembers),
      });
      setCohorts((prev) => [created, ...prev]);
      setShowCreateForm(false);
      setForm({ courseId: '', name: '', description: '', startDate: '', endDate: '', maxMembers: 0 });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !addUserId.trim()) return;
    const member = await cohortsApi.addMember(selected.id, addUserId.trim());
    setMembers((prev) => [...prev, member]);
    setAddUserId('');
  }

  async function handleRemoveMember(userId: string) {
    if (!selected) return;
    await cohortsApi.removeMember(selected.id, userId);
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  }

  async function handleExport() {
    if (!selected) return;
    setExporting(true);
    try {
      await cohortsApi.exportAnalytics(selected.id, selected.name);
    } finally {
      setExporting(false);
    }
  }

  if (!user || user.role !== 'admin') return null;

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Cohort Management
        </h1>
        <Button onClick={() => setShowCreateForm((v) => !v)}>
          {showCreateForm ? 'Cancel' : 'New Cohort'}
        </Button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="border rounded-xl p-5 space-y-4 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
          aria-label="Create new cohort"
        >
          <h2 className="font-semibold text-gray-900 dark:text-white">Create Cohort</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'cohort-name', label: 'Name', key: 'name', type: 'text', required: true },
              { id: 'cohort-courseId', label: 'Course ID', key: 'courseId', type: 'text', required: true },
              { id: 'cohort-start', label: 'Start Date', key: 'startDate', type: 'date', required: true },
              { id: 'cohort-end', label: 'End Date', key: 'endDate', type: 'date', required: true },
              { id: 'cohort-max', label: 'Max Members (0 = unlimited)', key: 'maxMembers', type: 'number', required: false },
            ].map(({ id, label, key, type, required }) => (
              <div key={key} className="space-y-1">
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </label>
                <input
                  id={id}
                  type={type}
                  required={required}
                  value={String(form[key as keyof CreateCohortPayload] ?? '')}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div className="space-y-1 sm:col-span-2">
              <label htmlFor="cohort-desc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="cohort-desc"
                rows={2}
                value={form.description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Cohort'}
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort list */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            All Cohorts ({cohorts.length})
          </h2>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ))
          ) : cohorts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 py-4 text-center text-sm">No cohorts yet.</p>
          ) : (
            cohorts.map((cohort) => (
              <button
                key={cohort.id}
                onClick={() => openCohort(cohort)}
                className={`w-full text-left border rounded-lg p-3 transition hover:shadow-sm space-y-0.5 ${
                  selected?.id === cohort.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-white dark:bg-gray-900 dark:border-gray-700'
                }`}
              >
                <p className="font-medium text-sm text-gray-900 dark:text-white">{cohort.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(cohort.startDate).toLocaleDateString()} – {new Date(cohort.endDate).toLocaleDateString()}
                  {' · '}{cohort.members?.length ?? 0} members
                </p>
              </button>
            ))
          )}
        </div>

        {/* Cohort detail */}
        {selected ? (
          <div className="border rounded-xl p-5 space-y-4 bg-white dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">{selected.name}</h2>
                {selected.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{selected.description}</p>
                )}
              </div>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                aria-label="Export analytics CSV"
              >
                {exporting ? 'Exporting…' : '⬇ Export CSV'}
              </button>
            </div>

            {/* Add member */}
            <form onSubmit={handleAddMember} className="flex gap-2">
              <input
                type="text"
                placeholder="User ID to add…"
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="User ID to add to cohort"
              />
              <Button type="submit" disabled={!addUserId.trim()}>Add</Button>
            </form>

            {/* Member list */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Members ({members.length})
              </p>
              {members.length === 0 ? (
                <p className="text-sm text-gray-400">No members yet.</p>
              ) : (
                members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between border rounded-lg px-3 py-2 dark:border-gray-700"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {m.user?.username ?? m.user?.email ?? m.userId}
                      </p>
                      <p className="text-xs text-gray-400">
                        Progress: {m.progressPercentage.toFixed(0)}% · Joined {new Date(m.enrolledAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(m.userId)}
                      className="text-xs text-red-500 hover:text-red-700"
                      aria-label={`Remove ${m.user?.username ?? m.userId} from cohort`}
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="border rounded-xl p-8 text-center text-gray-400 dark:border-gray-700">
            Select a cohort to manage members
          </div>
        )}
      </div>
    </main>
  );
}
