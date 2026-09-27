'use client';
import { useEffect, useRef, useState } from 'react';
import { fetchAdminCourses, togglePublish, deleteCourse, AdminCourse } from '@/lib/admin-api';
import { Search, Eye, EyeOff, Trash2, Edit, MoreHorizontal } from 'lucide-react';

export function AdminCourseTable() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminCourse | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load(p: number, q: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCourses({ page: p, search: q || undefined });
      setCourses(data.data);
      setTotal(data.total);
    } catch (err) {
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page, search); }, [page]);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); load(1, value); }, 300);
  }

  async function handleTogglePublish(courseId: string, currentStatus: boolean) {
    const prevCourses = [...courses];
    setCourses((c) => c.map((x) => x.id === courseId ? { ...x, isPublished: !currentStatus } : x));
    setActionMenu(null);
    try {
      await togglePublish(courseId, !currentStatus);
    } catch {
      setCourses(prevCourses);
      setError('Failed to update course status. Please try again.');
    }
  }

  async function handleDelete(course: AdminCourse) {
    setDeleteConfirm(null);
    setActionMenu(null);
    try {
      await deleteCourse(course.id);
      setCourses((c) => c.filter((x) => x.id !== course.id));
      setTotal((t) => t - 1);
    } catch {
      setError('Failed to delete course. Please try again.');
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search courses by title…"
            className="border rounded-lg pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search courses"
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {loading ? (
        <div className="border rounded-lg p-8 text-center text-gray-500">Loading courses...</div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-500">
                  <th scope="col" className="py-3 px-4 font-medium">Title</th>
                  <th scope="col" className="py-3 px-4 font-medium">Level</th>
                  <th scope="col" className="py-3 px-4 font-medium">Duration</th>
                  <th scope="col" className="py-3 px-4 font-medium">Status</th>
                  <th scope="col" className="py-3 px-4 font-medium">Created</th>
                  <th scope="col" className="py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{course.title}</td>
                    <td className="py-3 px-4 text-gray-500 capitalize">{course.level}</td>
                    <td className="py-3 px-4 text-gray-500">{course.durationHours}h</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        course.isPublished 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === course.id ? null : course.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {actionMenu === course.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 w-48">
                            <button
                              onClick={() => handleTogglePublish(course.id, course.isPublished)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              {course.isPublished ? (
                                <>
                                  <EyeOff className="w-4 h-4" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye className="w-4 h-4" />
                                  Publish
                                </>
                              )}
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={() => { setDeleteConfirm(course); setActionMenu(null); }}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex gap-2 items-center justify-center text-sm">
              <button
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="px-4">
                Page {page} of {totalPages}
              </span>
              <button
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h2 className="font-semibold text-lg">Delete Course</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
