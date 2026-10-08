import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';
import { UserPlus, AlertCircle, CheckCircle2, Lock, Mail, User } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    updatePageSeo({
      title: 'Create Account – Apex Chronicle',
      description: 'Join the Apex Chronicle reader community to save stories, customize topics, and participate in discussion.',
      ogType: 'website'
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Please provide your full name (at least 2 characters).');
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(name.trim(), email.trim(), password, confirmPassword);
      if (res.success) {
        onNavigate('/account');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Breadcrumb items={[{ label: 'Register' }]} onNavigate={onNavigate} className="mb-6" />

      <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 mx-auto rounded-full bg-stone-900 text-white flex items-center justify-center mb-3">
            <UserPlus className="w-5 h-5" />
          </div>
          <h1 className="font-editorial text-2xl font-bold text-stone-900">
            Create Reader Account
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Optional reader membership for dispatches and community access.
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
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Email Address <span className="text-rose-500">*</span>
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
              Password (min. 8 characters) <span className="text-rose-500">*</span>
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

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
          Already have a reader account?{' '}
          <button
            onClick={() => onNavigate('/login')}
            className="text-stone-900 font-semibold underline underline-offset-2 hover:text-stone-700 cursor-pointer"
          >
            Sign In here
          </button>
        </div>
      </div>
    </div>
  );
};
