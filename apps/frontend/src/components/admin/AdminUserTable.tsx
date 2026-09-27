'use client';
import { useEffect, useRef, useState } from 'react';
import { fetchAdminUsers, changeUserRole, banUser, AdminUser } from '@/lib/admin-api';
import { Search, Shield, Ban, MoreHorizontal } from 'lucide-react';

export function AdminUserTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function load(p: number, q: string, role: string) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers({ page: p, search: q || undefined, role: role || undefined });
      setUsers(data.data);
      setTotal(data.meta.total);
    } catch (err) {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page, search, roleFilter); }, [page, roleFilter]);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); load(1, value, roleFilter); }, 300);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    const prevUsers = [...users];
    setUsers((u) => u.map((x) => x.id === userId ? { ...x, role: newRole } : x));
    setActionMenu(null);
    try {
      await changeUserRole(userId, newRole);
    } catch {
      setUsers(prevUsers);
      setError('Failed to update role. Please try again.');
    }
  }

  async function handleBanToggle(userId: string, currentStatus: boolean) {
    const prevUsers = [...users];
    setUsers((u) => u.map((x) => x.id === userId ? { ...x, isBanned: !currentStatus } : x));
    setActionMenu(null);
    try {
      await banUser(userId, !currentStatus);
    } catch {
      setUsers(prevUsers);
      setError('Failed to update ban status. Please try again.');
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
            placeholder="Search by name or email…"
            className="border rounded-lg pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          aria-label="Filter by role"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="INSTRUCTOR">Instructor</option>
          <option value="STUDENT">Student</option>
        </select>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {loading ? (
        <div className="border rounded-lg p-8 text-center text-gray-500">Loading users...</div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-gray-500">
                  <th scope="col" className="py-3 px-4 font-medium">Name</th>
                  <th scope="col" className="py-3 px-4 font-medium">Email</th>
                  <th scope="col" className="py-3 px-4 font-medium">Role</th>
                  <th scope="col" className="py-3 px-4 font-medium">Status</th>
                  <th scope="col" className="py-3 px-4 font-medium">Created</th>
                  <th scope="col" className="py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{user.username}</td>
                    <td className="py-3 px-4 text-gray-500">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium">
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        user.isBanned 
                          ? 'bg-red-100 text-red-700' 
                          : user.isVerified 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.isBanned ? 'Banned' : user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                          aria-label="Actions"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {actionMenu === user.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-10 w-48">
                            <button
                              onClick={() => handleRoleChange(user.id, 'ADMIN')}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              Make Admin
                            </button>
                            <button
                              onClick={() => handleRoleChange(user.id, 'INSTRUCTOR')}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              Make Instructor
                            </button>
                            <button
                              onClick={() => handleRoleChange(user.id, 'STUDENT')}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                            >
                              Make Student
                            </button>
                            <hr className="my-1" />
                            <button
                              onClick={() => handleBanToggle(user.id, user.isBanned)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                                user.isBanned ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {user.isBanned ? 'Unban User' : 'Ban User'}
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
    </div>
  );
}
