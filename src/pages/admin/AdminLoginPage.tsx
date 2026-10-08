import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, KeyRound, Lock, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigatePublic: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigatePublic
}) => {
  const {
    login,
    setupInitialAdmin,
    initialAdminNeedsSetup,
    initialAdminEmail
  } = useAuth();

  const [isSetupMode, setIsSetupMode] = useState(initialAdminNeedsSetup);
  const [email, setEmail] = useState(initialAdminEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.needsSetup) {
        setIsSetupMode(true);
        setError('Initial administrator activation required. Please establish your master password below.');
      } else if (res.success) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);

    try {
      const success = await setupInitialAdmin(password, confirmPassword);
      if (success) {
        onLoginSuccess();
      } else {
        setError('Failed to activate administrator account. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Setup error. Please verify requirements.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-stone-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="w-12 h-12 mx-auto bg-amber-500 text-stone-950 rounded-lg flex items-center justify-center mb-4 shadow-lg">
          <Shield className="w-6 h-6" />
        </div>

        <h1 className="font-editorial text-3xl font-bold text-white tracking-tight">
          Apex Chronicle
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-stone-400 mt-1">
          Editorial &amp; Administrative Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-stone-800 border border-stone-700 py-8 px-6 shadow-2xl rounded-lg sm:px-10">
          {isSetupMode ? (
            /* First-Time Setup Flow */
            <div className="space-y-6">
              <div className="border-b border-stone-700 pb-4">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-1">
                  <KeyRound className="w-4 h-4" />
                  <span>Initial Administrator Setup</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Welcome to the Apex Chronicle publication suite. You are claiming master administrator privileges for{' '}
                  <strong className="text-white">{initialAdminEmail}</strong>.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSetupSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Designated Administrator Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={initialAdminEmail}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded text-stone-400 cursor-not-allowed font-mono text-xs"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Reserved initial administrator address specified in system policy.
                  </p>
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Set Master Password (min. 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Confirm Master Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded transition-colors shadow flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{loading ? 'Activating Account...' : 'Activate & Sign In'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Standard Admin Login Flow */
            <div className="space-y-6">
              <div className="border-b border-stone-700 pb-3">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-stone-400" />
                  <span>Credential Verification</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Access requires authorized staff administrator credentials.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="myall5148@gmail.com"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-stone-300 font-medium mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-stone-200 text-stone-900 text-xs font-bold rounded transition-colors shadow flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{loading ? 'Authenticating...' : 'Sign In to Console'}</span>
                  </button>
                </div>
              </form>

              {initialAdminNeedsSetup && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSetupMode(true)}
                    className="text-xs text-amber-400 hover:underline cursor-pointer"
                  >
                    Initial admin account not activated yet? Click here to set up.
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 border-t border-stone-700 pt-4 text-center">
            <button
              onClick={() => onNavigatePublic('/')}
              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Newspaper</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
