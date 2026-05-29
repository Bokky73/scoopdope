'use client';
import { useEffect, useRef, useState } from 'react';
import { adminApi, AdminUser } from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';

export function UserTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmBan, setConfirmBan] = useState<AdminUser | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function load(p: number, q: string) {
    adminApi.getUsers(p, q || undefined).then((data) => {
      setUsers(data.users);
      setTotal(data.total);
    });
  }

  useEffect(() => { load(page, search); }, [page]);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); load(1, value); }, 300);
  }

  async function handleBan(user: AdminUser) {
    const prev = [...users];
    setUsers((u) => u.map((x) => x.id === user.id ? { ...x, status: 'banned' } : x));
    setConfirmBan(null);
    try {
      await adminApi.banUser(user.id);
    } catch {
      setUsers(prev);
      setError('Failed to ban user. Please try again.');
    }
  }

  async function handleRoleChange(user: AdminUser, role: AdminUser['role']) {
    const prev = [...users];
    setUsers((u) => u.map((x) => x.id === user.id ? { ...x, role } : x));
    try {
      await adminApi.updateUserRole(user.id, role);
    } catch {
      setUsers(prev);
      setError('Failed to update role. Please try again.');
    }
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search by name or email…"
        className="border rounded-lg px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        aria-label="Search users"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4">{user.displayName}</td>
                <td className="py-2 pr-4 text-gray-500">{user.email}</td>
                <td className="py-2 pr-4">
                  <select
                    className="border rounded px-1 py-0.5 text-xs"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value as AdminUser['role'])}
                    aria-label={`Role for ${user.displayName}`}
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-2 pr-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-2">
                  {user.status === 'active' && (
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => setConfirmBan(user)}
                    >
                      Ban
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex gap-2 items-center text-sm">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span>{page} / {totalPages}</span>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {confirmBan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4">
            <h2 className="font-semibold text-lg">Ban {confirmBan.displayName}?</h2>
            <p className="text-sm text-gray-600">This will prevent the user from accessing the platform.</p>
            <div className="flex gap-3">
              <Button onClick={() => handleBan(confirmBan)}>Confirm Ban</Button>
              <Button variant="outline" onClick={() => setConfirmBan(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
