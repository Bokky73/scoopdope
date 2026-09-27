'use client';
import { useEffect, useRef, useState } from 'react';
import { adminApi, AdminUser } from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';

type UserStatus = 'active' | 'suspended' | 'deactivated' | 'banned';
type UserRole = 'student' | 'instructor' | 'admin';

export function UserTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ userId: string; action: string; userName: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [changeRole, setChangeRole] = useState<{ userId: string; newRole: UserRole } | null>(null);

  function load(p: number, q: string, role?: string, status?: string) {
    setLoading(true);
    adminApi.getUsers(p, q || undefined, role || undefined, status || undefined)
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load users');
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(page, search, roleFilter, statusFilter); }, [page]);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(1); load(1, value, roleFilter, statusFilter); }, 300);
  }

  function handleFilterChange(type: 'role' | 'status', value: string) {
    if (type === 'role') setRoleFilter(value);
    else setStatusFilter(value);
    setPage(1);
    load(1, search, type === 'role' ? value : roleFilter, type === 'status' ? value : statusFilter);
  }

  async function handleConfirmedAction() {
    if (!confirmAction) return;
    
    setLoading(true);
    try {
      let user: AdminUser;
      if (confirmAction.action === 'delete') {
        await adminApi.deleteUser(confirmAction.userId);
        setUsers(u => u.filter(x => x.id !== confirmAction.userId));
        setSuccess(`User "${confirmAction.userName}" has been deleted.`);
      } else if (confirmAction.action === 'suspend') {
        user = await adminApi.suspendUser(confirmAction.userId);
        setUsers(u => u.map(x => x.id === user.id ? user : x));
        setSuccess(`User "${confirmAction.userName}" has been suspended.`);
      } else if (confirmAction.action === 'deactivate') {
        user = await adminApi.deactivateUser(confirmAction.userId);
        setUsers(u => u.map(x => x.id === user.id ? user : x));
        setSuccess(`User "${confirmAction.userName}" has been deactivated.`);
      } else if (confirmAction.action === 'ban') {
        user = await adminApi.banUser(confirmAction.userId);
        setUsers(u => u.map(x => x.id === user.id ? user : x));
        setSuccess(`User "${confirmAction.userName}" has been banned.`);
      }
      setConfirmAction(null);
    } catch (err) {
      setError((err as any).message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChangeConfirmed() {
    if (!changeRole) return;
    
    setLoading(true);
    try {
      const user = await adminApi.changeUserRole(changeRole.userId, changeRole.newRole);
      setUsers(u => u.map(x => x.id === user.id ? user : x));
      setSuccess(`Role updated to ${changeRole.newRole}.`);
      setChangeRole(null);
    } catch (err) {
      setError((err as any).message || 'Failed to update role.');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(total / 20);
  const limit = 20;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name/Email</label>
          <input
            type="search"
            placeholder="Search…"
            className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search users"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roleFilter}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            disabled={loading}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="instructor">Instructor</option>
            <option value="student">Student</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            className="border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={loading}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th scope="col" className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
              <th scope="col" className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
              <th scope="col" className="py-3 px-4 text-left font-semibold text-gray-700">Role</th>
              <th scope="col" className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
              <th scope="col" className="py-3 px-4 text-left font-semibold text-gray-700">Joined</th>
              <th scope="col" className="py-3 px-4 text-right font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                  {loading ? 'Loading users...' : 'No users found'}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{user.displayName}</p>
                      {!user.isVerified && <p className="text-xs text-orange-600 mt-1">Unverified</p>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <select
                      className="border rounded px-2 py-1 text-xs font-medium"
                      value={user.role}
                      onChange={(e) => setChangeRole({ userId: user.id, newRole: e.target.value as UserRole })}
                      disabled={loading || changeRole?.userId === user.id}
                      aria-label={`Role for ${user.displayName}`}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                    {changeRole?.userId === user.id && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleRoleChangeConfirmed}
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          disabled={loading}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setChangeRole(null)}
                          className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 
                      user.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                      user.status === 'deactivated' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex gap-2 justify-end">
                      {user.status === 'active' && (
                        <>
                          <button
                            onClick={() => setConfirmAction({ userId: user.id, action: 'suspend', userName: user.displayName })}
                            className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            disabled={loading}
                          >
                            Suspend
                          </button>
                          <button
                            onClick={() => setConfirmAction({ userId: user.id, action: 'ban', userName: user.displayName })}
                            className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            disabled={loading}
                          >
                            Ban
                          </button>
                        </>
                      )}
                      {user.status !== 'active' && (
                        <button
                          onClick={() => setConfirmAction({ userId: user.id, action: 'delete', userName: user.displayName })}
                          className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      )}
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
          Showing {users.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
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

      {/* Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to {confirmAction.action} <strong>{confirmAction.userName}</strong>?
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

      {/* Role Change Confirmation */}
      {changeRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Role Change</h3>
            <p className="text-gray-700 mb-6">
              Change role to <strong>{changeRole.newRole}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setChangeRole(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleRoleChangeConfirmed}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
