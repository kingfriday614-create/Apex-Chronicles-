import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Home, User, LogOut } from 'lucide-react';

interface AccessDeniedPageProps {
  onNavigate: (path: string) => void;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-stone-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white border border-stone-200 py-8 px-6 shadow-xl rounded-lg sm:px-10 text-center space-y-4">
          <div className="w-14 h-14 mx-auto bg-rose-100 text-rose-700 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="font-mono text-xs uppercase tracking-widest text-rose-700 font-semibold block">
            HTTP 403 Forbidden
          </span>

          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            Access Denied
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Your account (<strong className="text-stone-900 font-mono">{user?.email || 'authenticated user'}</strong>) is registered with standard reader privileges. The administrative publication console is private and restricted strictly to designated editorial administrators (<strong>myall5148@gmail.com</strong>).
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-2 justify-center text-xs">
            <button
              onClick={() => onNavigate('/')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-900 text-white font-semibold rounded hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Public Homepage</span>
            </button>

            <button
              onClick={() => onNavigate('/account')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
            </button>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out &amp; Switch Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
