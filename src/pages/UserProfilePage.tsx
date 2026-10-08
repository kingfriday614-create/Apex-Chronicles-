import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';
import { User, Lock, CheckCircle2, AlertCircle, LogOut, BookOpen, Shield } from 'lucide-react';

interface UserProfilePageProps {
  onNavigate: (path: string) => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onNavigate }) => {
  const { user, isAdmin, updateProfile, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  React.useEffect(() => {
    updatePageSeo({
      title: 'My Reader Account – Apex Chronicle',
      description: 'Manage your reader account profile, credentials, and settings.',
      ogType: 'website'
    });
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="font-editorial text-2xl font-bold text-stone-900 mb-3">
          Sign In Required
        </h2>
        <p className="text-xs text-stone-600 mb-6">
          Please sign in to view your reader profile.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (name.trim().length < 2) {
      setProfileError('Name must be at least 2 characters long.');
      return;
    }

    try {
      setSavingProfile(true);
      await updateProfile({ name: name.trim() });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update name.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please provide your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password confirmation does not match.');
      return;
    }

    try {
      setChangingPassword(true);
      await updateProfile({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: 'My Account' }]} onNavigate={onNavigate} className="mb-6" />

      {/* Account Overview Card */}
      <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-stone-900 text-amber-400 font-editorial font-bold text-2xl flex items-center justify-center shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-editorial text-2xl font-bold text-stone-900">
                {user.name}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${
                isAdmin ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'
              }`}>
                {isAdmin ? 'Administrator' : 'Reader Account'}
              </span>
            </div>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {isAdmin && (
            <button
              onClick={() => onNavigate('/admin')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold rounded cursor-pointer transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white border border-stone-200 p-6 rounded shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <User className="w-4 h-4 text-stone-700" />
            <h2 className="font-editorial text-lg font-bold text-stone-900">
              Profile Details
            </h2>
          </div>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Profile updated successfully.</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateName} className="space-y-3 text-xs font-sans">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Email Address (Permanent Identifier)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded font-mono text-stone-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-stone-600 mt-0.5 block">
                Email addresses are tied to your primary identity.
              </span>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Assigned Role
              </label>
              <input
                type="text"
                disabled
                value={user.role === 'superadmin' ? 'Primary Administrator (Super Admin)' : user.role === 'admin' ? 'Staff Administrator' : 'Standard Reader (USER)'}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded font-mono text-stone-600 text-xs cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {savingProfile ? 'Saving...' : 'Update Name'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white border border-stone-200 p-6 rounded shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Lock className="w-4 h-4 text-stone-700" />
            <h2 className="font-editorial text-lg font-bold text-stone-900">
              Security &amp; Password
            </h2>
          </div>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password updated securely.</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs font-sans">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                New Password (min. 8 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full py-2 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {changingPassword ? 'Verifying...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => onNavigate('/articles')}
          className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer font-medium"
        >
          <BookOpen className="w-4 h-4" />
          <span>Return to Reading Editorial Articles &rarr;</span>
        </button>
      </div>
    </div>
  );
};
