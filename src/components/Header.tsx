import React, { useState } from 'react';
import { Search, Menu, X, Shield, ChevronDown, User, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const { settings, categories } = useSite();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoriesDropdown, setCategoriesDropdown] = useState(false);

  // Formatted current date
  const todayStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const navTo = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setCategoriesDropdown(false);
  };

  const handleLogout = async () => {
    await logout();
    navTo('/');
  };

  return (
    <header className="border-b border-stone-200 bg-stone-50/95 sticky top-0 z-40 backdrop-blur-sm">
      {/* Top utility bar */}
      <div className="border-b border-stone-200/60 text-xs text-stone-500 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <time className="font-mono text-[11px] text-stone-600">{todayStr}</time>
            <span className="hidden sm:inline text-stone-300">·</span>
            <span className="hidden sm:inline font-sans text-stone-600">Daily Global Edition</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-stone-600 hover:text-stone-900 transition-colors hidden lg:inline"
            >
              XML Sitemap
            </a>

            {/* Reader Account / Authentication Links */}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navTo('/account')}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
                  title="My Reader Account"
                >
                  <User className="w-3 h-3 text-stone-500" />
                  <span className="max-w-[100px] sm:max-w-none truncate">{user.name}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navTo('/login')}
                  className="flex items-center gap-1 text-[11px] font-medium text-stone-700 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3 h-3 text-stone-500" />
                  <span>Sign In</span>
                </button>
                <span className="text-stone-300">·</span>
                <button
                  onClick={() => navTo('/register')}
                  className="flex items-center gap-1 text-[11px] font-medium text-stone-900 hover:text-stone-700 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3 h-3 text-stone-700" />
                  <span>Register</span>
                </button>
              </div>
            )}

            <span className="text-stone-300 hidden sm:inline">|</span>

            {/* Admin Portal link */}
            <button
              onClick={() => navTo('/admin')}
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
                isAdmin
                  ? 'text-amber-800 bg-amber-100/70 hover:bg-amber-200/70 px-2 py-0.5 rounded'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Staff & Editorial Management Portal"
            >
              <Shield className={`w-3 h-3 ${isAdmin ? 'text-amber-700' : 'text-stone-500'}`} />
              <span>{isAdmin ? 'Admin Console' : 'Admin Portal'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-stone-700 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 rounded"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo / Brand Name */}
          <div className="flex-1 md:flex-initial text-center md:text-left">
            <button
              onClick={() => navTo('/')}
              className="inline-block text-left group focus:outline-none"
            >
              <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors leading-none">
                {settings?.site_name || 'Apex Chronicle'}
              </h1>
              <p className="hidden sm:block text-xs uppercase tracking-widest text-stone-600 font-sans mt-1">
                Insightful Journalism · Global Technology · Economic Strategy
              </p>
            </button>
          </div>

          {/* Search Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-200/50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400"
              aria-label="Search articles"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar Drawer */}
        {searchOpen && (
          <div className="mt-4 pt-3 border-t border-stone-200 animate-in fade-in slide-in-from-top-1 duration-150">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles by title, topic, or keyword..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:border-stone-600 focus:ring-1 focus:ring-stone-600 text-stone-900 placeholder:text-stone-600"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-stone-600 hover:text-stone-800"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Desktop Main Navigation Bar */}
      <nav className="hidden md:block border-t border-stone-200 bg-stone-100/60">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <ul className="flex items-center gap-6 text-sm font-medium text-stone-700">
            <li>
              <button
                onClick={() => navTo('/')}
                className={`py-3 inline-block transition-colors border-b-2 ${
                  currentPath === '/' ? 'border-stone-900 text-stone-900 font-semibold' : 'border-transparent hover:text-stone-900'
                }`}
              >
                Home
              </button>
            </li>
            <li>
              <button
                onClick={() => navTo('/articles')}
                className={`py-3 inline-block transition-colors border-b-2 ${
                  currentPath === '/articles' ? 'border-stone-900 text-stone-900 font-semibold' : 'border-transparent hover:text-stone-900'
                }`}
              >
                All Articles
              </button>
            </li>

            {/* Categories dropdown */}
            <li className="relative">
              <button
                onClick={() => setCategoriesDropdown(!categoriesDropdown)}
                className={`py-3 inline-flex items-center gap-1 transition-colors border-b-2 ${
                  currentPath.startsWith('/category') || currentPath === '/categories'
                    ? 'border-stone-900 text-stone-900 font-semibold'
                    : 'border-transparent hover:text-stone-900'
                }`}
              >
                <span>Categories</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {categoriesDropdown && (
                <div
                  onMouseLeave={() => setCategoriesDropdown(false)}
                  className="absolute top-full left-0 w-64 bg-white border border-stone-200 shadow-lg rounded-b-md py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <button
                    onClick={() => navTo('/categories')}
                    className="w-full text-left px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stone-600 hover:bg-stone-50 border-b border-stone-100"
                  >
                    View All Categories &rarr;
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => navTo(`/category/${cat.slug}`)}
                      className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 hover:text-stone-900 flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      {cat.article_count !== undefined && (
                        <span className="text-xs text-stone-500 font-mono">{cat.article_count}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </li>

            {/* Top 3 primary categories inline */}
            {categories.slice(0, 3).map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => navTo(`/category/${cat.slug}`)}
                  className={`py-3 inline-block transition-colors border-b-2 ${
                    currentPath === `/category/${cat.slug}`
                      ? 'border-stone-900 text-stone-900 font-semibold'
                      : 'border-transparent hover:text-stone-900'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}

            <li>
              <button
                onClick={() => navTo('/about')}
                className={`py-3 inline-block transition-colors border-b-2 ${
                  currentPath === '/about' ? 'border-stone-900 text-stone-900 font-semibold' : 'border-transparent hover:text-stone-900'
                }`}
              >
                About
              </button>
            </li>
            <li>
              <button
                onClick={() => navTo('/contact')}
                className={`py-3 inline-block transition-colors border-b-2 ${
                  currentPath === '/contact' ? 'border-stone-900 text-stone-900 font-semibold' : 'border-transparent hover:text-stone-900'
                }`}
              >
                Contact
              </button>
            </li>
          </ul>

          <div className="text-xs text-stone-500 italic">
            Independent &amp; Reader-Supported
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-stone-50 px-4 py-6 shadow-xl animate-in slide-in-from-top duration-200">
          <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news &amp; articles..."
              className="flex-1 px-3 py-2 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded"
            >
              Search
            </button>
          </form>

          <nav className="flex flex-col gap-2">
            <button
              onClick={() => navTo('/')}
              className={`text-left px-3 py-2 rounded text-base font-medium ${
                currentPath === '/' ? 'bg-stone-200 text-stone-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navTo('/articles')}
              className={`text-left px-3 py-2 rounded text-base font-medium ${
                currentPath === '/articles' ? 'bg-stone-200 text-stone-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              All Articles
            </button>
            <button
              onClick={() => navTo('/categories')}
              className={`text-left px-3 py-2 rounded text-base font-medium ${
                currentPath === '/categories' ? 'bg-stone-200 text-stone-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              All Categories
            </button>

            <div className="pl-4 py-1 flex flex-col gap-1 border-l-2 border-stone-200 my-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navTo(`/category/${cat.slug}`)}
                  className="text-left py-1 text-sm text-stone-600 hover:text-stone-900"
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => navTo('/about')}
              className={`text-left px-3 py-2 rounded text-base font-medium ${
                currentPath === '/about' ? 'bg-stone-200 text-stone-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              About
            </button>
            <button
              onClick={() => navTo('/contact')}
              className={`text-left px-3 py-2 rounded text-base font-medium ${
                currentPath === '/contact' ? 'bg-stone-200 text-stone-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              Contact
            </button>

            <div className="pt-4 mt-2 border-t border-stone-200 space-y-2">
              {user ? (
                <>
                  <button
                    onClick={() => navTo('/account')}
                    className="w-full flex items-center justify-between py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-sm font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-stone-600" />
                      <span>My Account ({user.name})</span>
                    </span>
                    <span className="text-xs font-mono text-stone-500">{user.role}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 text-stone-600 hover:text-rose-600 rounded text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navTo('/login')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 border border-stone-300 text-stone-800 hover:bg-stone-100 rounded text-sm font-medium"
                  >
                    <LogIn className="w-4 h-4 text-stone-600" />
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => navTo('/register')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-900 text-white hover:bg-stone-800 rounded text-sm font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => navTo('/admin')}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded text-sm font-medium cursor-pointer ${
                  isAdmin
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{isAdmin ? 'Admin Console' : 'Admin Portal'}</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
