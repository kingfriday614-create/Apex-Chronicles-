import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdminUser } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Shield, PlusCircle, Trash2, KeyRound, UserCheck, X } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('admin');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers();
      setUsers(res.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.createAdminUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });
      setName('');
      setEmail('');
      setPassword('');
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (targetUser: AdminUser) => {
    if (targetUser.is_initial_admin === 1) {
      alert('The designated primary administrator cannot be removed.');
      return;
    }

    if (!confirm(`Revoke administrator access for "${targetUser.name}" (${targetUser.email})?`)) {
      return;
    }

    try {
      await api.deleteAdminUser(targetUser.id);
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            Staff &amp; Administrator Accounts
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Role-based access control governing editorial dispatch publishing and site administration.
          </p>
        </div>

        <button
          onClick={() => { setModalOpen(true); setError(null); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Add Administrator</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
            <p className="text-sm font-mono text-stone-500">Retrieving staff registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-mono text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Administrator</th>
                  <th className="py-3 px-3 font-medium">Email</th>
                  <th className="py-3 px-3 font-medium">Role</th>
                  <th className="py-3 px-3 font-medium">Privilege Classification</th>
                  <th className="py-3 px-3 font-medium">Registered</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {users.map((u) => {
                  const isPrimary = u.is_initial_admin === 1;

                  return (
                    <tr key={u.id} className={isPrimary ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-stone-50'}>
                      <td className="py-3 px-4 font-semibold text-stone-900 flex items-center gap-2">
                        {isPrimary ? (
                          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <UserCheck className="w-4 h-4 text-stone-400 shrink-0" />
                        )}
                        <span>{u.name}</span>
                        {currentUser?.id === u.id && (
                          <span className="text-[10px] font-mono text-stone-500 italic">(You)</span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono text-stone-800">
                        {u.email}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono uppercase text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {isPrimary ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 font-mono">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Primary Administrator (Super Admin)</span>
                          </span>
                        ) : (
                          <span className="text-stone-500 text-[11px]">Staff Member</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-stone-500 font-mono text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isPrimary ? (
                          <span className="text-[11px] font-mono text-stone-600 italic">Protected</span>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="text-stone-400 hover:text-rose-600 p-1 rounded"
                            title="Revoke administrator access"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Administrator Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-editorial text-lg font-bold text-stone-900">
                Add New Staff Administrator
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-4 text-xs font-sans">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="s.jenkins@organization.com"
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Initial Password (min. 8 chars) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Passwords are cryptographic hashes using bcrypt (10 rounds). They are never stored in plaintext.
                </p>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded bg-white text-xs cursor-pointer"
                >
                  <option value="admin">Administrator (Full publishing &amp; settings permissions)</option>
                  <option value="editor">Editor (Article drafting &amp; media editing)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-stone-900 text-white rounded font-semibold hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Provision Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
