import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';
import { LogIn, AlertCircle, Lock, Mail, Shield } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, initialAdminNeedsSetup, initialAdminEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    updatePageSeo({
      title: 'Sign In – Apex Chronicle',
      description: 'Sign in to your Apex Chronicle reader account or editorial staff console.',
      ogType: 'website'
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide your email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email.trim(), password);

      if (res.needsSetup) {
        onNavigate('/admin/login');
        return;
      }

      if (res.success && res.user) {
        // If administrator, direct to admin console; otherwise to reader account profile
        if (res.user.role === 'admin' || res.user.role === 'superadmin') {
          onNavigate('/admin');
        } else {
          onNavigate('/account');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Breadcrumb items={[{ label: 'Sign In' }]} onNavigate={onNavigate} className="mb-6" />

      <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto rounded-full bg-stone-900 text-white flex items-center justify-center mb-3">
            <LogIn className="w-5 h-5" />
          </div>
          <h1 className="font-editorial text-2xl font-bold text-stone-900">
            Sign In to Apex Chronicle
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Access your reader profile or editorial dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900 text-sm"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div>
            New reader?{' '}
            <button
              onClick={() => onNavigate('/register')}
              className="text-stone-900 font-semibold underline underline-offset-2 hover:text-stone-700 cursor-pointer"
            >
              Register here
            </button>
          </div>

          <button
            onClick={() => onNavigate('/admin')}
            className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            <Shield className="w-3 h-3 text-stone-400" />
            <span>Staff Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
