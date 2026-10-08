import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  Image as ImageIcon,
  Mail,
  Megaphone,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  PlusCircle
} from 'lucide-react';

interface AdminLayoutProps {
  currentSection: string;
  onNavigateSection: (section: string) => void;
  onNavigatePublic: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  onNavigateSection,
  onNavigatePublic,
  children
}) => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'articles', label: 'Articles', icon: FileText },
    { key: 'categories', label: 'Categories', icon: FolderTree },
    { key: 'tags', label: 'Tags', icon: Tag },
    { key: 'media', label: 'Media Library', icon: ImageIcon },
    { key: 'newsletter', label: 'Newsletter', icon: Mail },
    { key: 'ads', label: 'Advertisements', icon: Megaphone },
    { key: 'users', label: 'Admin Users', icon: Users },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNav = (key: string) => {
    onNavigateSection(key);
    setMobileSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    onNavigateSection('login');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row font-sans text-stone-900">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-stone-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <span className="font-editorial font-bold text-lg">Apex Chronicle Admin</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 text-stone-300 hover:text-white rounded"
          aria-label="Toggle admin sidebar"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-stone-900 text-stone-300 flex flex-col z-40 transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Masthead */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <h2 className="font-editorial text-lg font-bold text-white tracking-tight">
                Apex Chronicle
              </h2>
            </div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-stone-500 mt-0.5">
              Editorial CMS Console
            </p>
          </div>
        </div>

        {/* Quick New Article Action */}
        <div className="p-3">
          <button
            onClick={() => handleNav('articles_new')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded transition-colors shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Article</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto" aria-label="Admin Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.key || (item.key === 'articles' && currentSection.startsWith('articles_'));

            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-stone-800 text-white font-semibold'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card & Bottom Controls */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/60 space-y-2">
          {user && (
            <div className="px-3 py-2 rounded bg-stone-900 border border-stone-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                  {user.name}
                </span>
                {user.is_initial_admin === 1 && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-amber-400/20 text-amber-300 rounded">
                    Primary
                  </span>
                )}
              </div>
              <span className="text-[11px] text-stone-500 block truncate">
                {user.email}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-1 text-xs">
            <button
              onClick={() => onNavigatePublic('/')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors"
              title="View public website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Site</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 py-1.5 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded transition-colors"
              title="Sign out of console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
