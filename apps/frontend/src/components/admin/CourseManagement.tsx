'use client';
import { useEffect, useRef, useState } from 'react';
import { adminApi, AdminCourse } from '@/lib/adminApi';

type CourseStatus = 'draft' | 'pending' | 'published' | 'archived';

export function CourseManagement() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [instructorFilter, setInstructorFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ courseId: string; action: string; courseTitle: string } | null>(null);
  const [courseStats, setCourseStats] = useState<{ courseId: string; stats: any } | null>(null);

  function load(p: number, status?: string, instructor?: string) {
    setLoading(true);
    adminApi.getCourses(p, status || undefined, instructor || undefined)
      .then((data) => {
        setCourses(data.courses);
        setTotal(data.total);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load courses');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(page, statusFilter, instructorFilter); }, [page]);

  function handleFilterChange(type: 'status' | 'instructor', value: string) {
    if (type === 'status') setStatusFilter(value);
    else setInstructorFilter(value);
    setPage(1);
    load(1, type === 'status' ? value : statusFilter, type === 'instructor' ? value : instructorFilter);
  }

  async function handleConfirmedAction() {
    if (!confirmAction) return;
    
    setLoading(true);
    try {
      let course: AdminCourse;
      if (confirmAction.action === 'approve') {
        course = await adminApi.approveCourse(confirmAction.courseId);
        setCourses(c => c.map(x => x.id === course.id ? course : x));
        setSuccess(`Course "${confirmAction.courseTitle}" has been approved.`);
      } else if (confirmAction.action === 'archive') {
        course = await adminApi.archiveCourse(confirmAction.courseId);
        setCourses(c => c.map(x => x.id === course.id ? course : x));
        setSuccess(`Course "${confirmAction.courseTitle}" has been archived.`);
      } else if (confirmAction.action === 'unarchive') {
        course = await adminApi.unarchiveCourse(confirmAction.courseId);
        setCourses(c => c.map(x => x.id === course.id ? course : x));
        setSuccess(`Course "${confirmAction.courseTitle}" has been unarchived.`);
      } else if (confirmAction.action === 'delete') {
        await adminApi.deleteCourse(confirmAction.courseId);
        setCourses(c => c.filter(x => x.id !== confirmAction.courseId));
        setSuccess(`Course "${confirmAction.courseTitle}" has been deleted.`);
      }
      setConfirmAction(null);
    } catch (err) {
      setError((err as any).message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadCourseStats(courseId: string) {
    try {
      const stats = await adminApi.getCourseStats(courseId);
      setCourseStats({ courseId, stats });
    } catch (err) {
      setError('Failed to load course stats');
    }
  }

  const totalPages = Math.ceil(total / 20);
  const limit = 20;

  const getStatusBadgeClass = (status: CourseStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={loading}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
          <input
            type="text"
            placeholder="Filter by instructor…"
            className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={instructorFilter}
            onChange={(e) => handleFilterChange('instructor', e.target.value)}
            disabled={loading}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th scope="col" className="py-3 px-4 text-left font-semibold text-gray-700">Title</th>
              <th scope="col" className="py-3 px-4 text-left font-semibold text-gray-700">Instructor</th>
              <th scope="col" className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              <th scope="col" className="py-3 px-4 text-center font-semibold text-gray-700">Enrollments</th>
              <th scope="col" className="py-3 px-4 text-center font-semibold text-gray-700">Rating</th>
              <th scope="col" className="py-3 px-4 text-left font-semibold text-gray-700">Created</th>
              <th scope="col" className="py-3 px-4 text-right font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 px-4 text-center text-gray-500">
                  {loading ? 'Loading courses...' : 'No courses found'}
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{course.title}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{course.instructorName}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeClass(course.status as CourseStatus)}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">{course.enrollmentCount}</td>
                  <td className="py-3 px-4 text-center text-gray-600">
                    {course.averageRating ? `${course.averageRating.toFixed(1)}/5` : 'No ratings'}
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end flex-wrap">
                      {course.status === 'pending' && (
                        <button
                          onClick={() => setConfirmAction({ courseId: course.id, action: 'approve', courseTitle: course.title })}
                          className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          disabled={loading}
                        >
                          Approve
                        </button>
                      )}

                      {course.status === 'published' && (
                        <button
                          onClick={() => setConfirmAction({ courseId: course.id, action: 'archive', courseTitle: course.title })}
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          disabled={loading}
                        >
                          Archive
                        </button>
                      )}

                      {course.status === 'archived' && (
                        <>
                          <button
                            onClick={() => setConfirmAction({ courseId: course.id, action: 'unarchive', courseTitle: course.title })}
                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            disabled={loading}
                          >
                            Unarchive
                          </button>
                          <button
                            onClick={() => setConfirmAction({ courseId: course.id, action: 'delete', courseTitle: course.title })}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => loadCourseStats(course.id)}
                        className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                        disabled={loading}
                      >
                        Stats
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {courses.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} courses
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Stats Modal */}
      {courseStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Course Statistics</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Enrollments:</span>
                <span className="font-medium">{courseStats.stats.enrollmentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completions:</span>
                <span className="font-medium">{courseStats.stats.completionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Rating:</span>
                <span className="font-medium">
                  {courseStats.stats.averageRating ? `${courseStats.stats.averageRating.toFixed(1)}/5` : 'No ratings yet'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setCourseStats(null)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to {confirmAction.action} <strong>{confirmAction.courseTitle}</strong>?
              {confirmAction.action === 'delete' && ' This action cannot be undone.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedAction}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmAction.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
