'use client';
import { useEffect, useState } from 'react';
import { adminApi, PendingCourse } from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';

export function CourseApprovalList() {
  const [courses, setCourses] = useState<PendingCourse[]>([]);
  const [rejectTarget, setRejectTarget] = useState<PendingCourse | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getPendingCourses().then(setCourses);
  }, []);

  async function handleApprove(course: PendingCourse) {
    setError(null);
    try {
      await adminApi.approveCourse(course.id);
      setCourses((c) => c.filter((x) => x.id !== course.id));
    } catch {
      setError(`Failed to approve "${course.title}". Please try again.`);
    }
  }

  async function handleReject() {
    if (!rejectTarget || !rejectReason.trim()) return;
    setError(null);
    const target = rejectTarget;
    setRejectTarget(null);
    try {
      await adminApi.rejectCourse(target.id, rejectReason);
      setCourses((c) => c.filter((x) => x.id !== target.id));
      setRejectReason('');
    } catch {
      setError(`Failed to reject "${target.title}". Please try again.`);
    }
  }

  if (courses.length === 0) {
    return <p className="text-gray-500 text-sm">No courses pending approval.</p>;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {courses.map((course) => (
        <div key={course.id} className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{course.title}</p>
            <p className="text-sm text-gray-500">{course.instructorName} · Submitted {new Date(course.submittedAt).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleApprove(course)}>Approve</Button>
            <Button variant="outline" onClick={() => { setRejectTarget(course); setRejectReason(''); }}>Reject</Button>
          </div>
        </div>
      ))}

      {rejectTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h2 className="font-semibold text-lg">Reject &ldquo;{rejectTarget.title}&rdquo;</h2>
            <textarea
              className="w-full border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Reason for rejection (required)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button disabled={!rejectReason.trim()} onClick={handleReject}>Confirm Rejection</Button>
              <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
