import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { getCurrentAppRoute, getFullPath } from './utils/navigation';

// Public Components & Pages
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { CategoryPage } from './pages/CategoryPage';
import { CategoriesDirectoryPage } from './pages/CategoriesDirectoryPage';
import { TagPage } from './pages/TagPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { SearchPage } from './pages/SearchPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';

// Admin Components & Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminArticlesPage } from './pages/admin/AdminArticlesPage';
import { AdminArticleEditorPage } from './pages/admin/AdminArticleEditorPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminTagsPage } from './pages/admin/AdminTagsPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminNewsletterPage } from './pages/admin/AdminNewsletterPage';
import { AdminAdsPage } from './pages/admin/AdminAdsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState(getCurrentAppRoute());
  const [adminSection, setAdminSection] = useState('dashboard');

  // Handle URL changes & browser history (both popstate and hashchange)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getCurrentAppRoute());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    try {
      const full = getFullPath(path);
      window.history.pushState({}, '', full);
    } catch {
      // Fallback to hash if pushState fails in certain restricted iframe environments
      window.location.hash = '#' + path;
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- ADMIN ROUTING ---
  if (currentPath.startsWith('/admin')) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white">
          <div className="text-center space-y-3">
            <div className="inline-block w-8 h-8 border-2 border-stone-600 border-t-amber-400 rounded-full animate-spin" />
            <p className="text-xs font-mono text-stone-400">Verifying administrator security clearance...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return (
        <AdminLoginPage
          onLoginSuccess={() => setAdminSection('dashboard')}
          onNavigatePublic={navigateTo}
        />
      );
    }

    // STRICT ADMIN VERIFICATION: ONLY designated administrator (myall5148@gmail.com) and authorized admin roles
    const isAuthorizedAdmin =
      user.email.toLowerCase() === 'myall5148@gmail.com' ||
      user.role === 'superadmin' ||
      user.role === 'admin';

    if (!isAuthorizedAdmin) {
      return <AccessDeniedPage onNavigate={navigateTo} />;
    }

    // Render Admin Section inside AdminLayout
    const renderAdminContent = () => {
      if (adminSection === 'dashboard') {
        return <AdminDashboardPage onNavigateSection={setAdminSection} onNavigatePublic={navigateTo} />;
      }
      if (adminSection === 'articles') {
        return <AdminArticlesPage onNavigateSection={setAdminSection} onNavigatePublic={navigateTo} />;
      }
      if (adminSection === 'articles_new') {
        return <AdminArticleEditorPage onNavigateSection={setAdminSection} onNavigatePublic={navigateTo} />;
      }
      if (adminSection.startsWith('articles_edit_')) {
        const id = adminSection.replace('articles_edit_', '');
        return <AdminArticleEditorPage articleId={id} onNavigateSection={setAdminSection} onNavigatePublic={navigateTo} />;
      }
      if (adminSection === 'categories') {
        return <AdminCategoriesPage onNavigatePublic={navigateTo} />;
      }
      if (adminSection === 'tags') {
        return <AdminTagsPage onNavigatePublic={navigateTo} />;
      }
      if (adminSection === 'media') {
        return <AdminMediaPage />;
      }
      if (adminSection === 'newsletter') {
        return <AdminNewsletterPage />;
      }
      if (adminSection === 'ads') {
        return <AdminAdsPage />;
      }
      if (adminSection === 'users') {
        return <AdminUsersPage />;
      }
      if (adminSection === 'settings') {
        return <AdminSettingsPage />;
      }
      return <AdminDashboardPage onNavigateSection={setAdminSection} onNavigatePublic={navigateTo} />;
    };

    return (
      <AdminLayout
        currentSection={adminSection}
        onNavigateSection={setAdminSection}
        onNavigatePublic={navigateTo}
      >
        {renderAdminContent()}
      </AdminLayout>
    );
  }

  // --- PUBLIC ROUTING ---
  const renderPublicPage = () => {
    // 1. Home
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={navigateTo} />;
    }

    // 2. All Articles
    if (currentPath === '/articles' || currentPath === '/latest') {
      return <ArticlesPage onNavigate={navigateTo} />;
    }

    // 3. Categories Directory
    if (currentPath === '/categories') {
      return <CategoriesDirectoryPage onNavigate={navigateTo} />;
    }

    // 4. Individual Category
    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '').split('/')[0];
      return <CategoryPage slug={slug} onNavigate={navigateTo} />;
    }

    // 5. Individual Tag
    if (currentPath.startsWith('/tag/')) {
      const slug = currentPath.replace('/tag/', '').split('/')[0];
      return <TagPage slug={slug} onNavigate={navigateTo} />;
    }

    // 6. Individual Article
    if (currentPath.startsWith('/article/')) {
      const slug = currentPath.replace('/article/', '').split('/')[0];
      return <ArticleDetailPage slug={slug} onNavigate={navigateTo} />;
    }

    // 7. Search Results
    if (currentPath.startsWith('/search')) {
      const params = new URLSearchParams(window.location.search);
      const query = params.get('q') || '';
      return <SearchPage initialQuery={query} onNavigate={navigateTo} />;
    }

    // 8. Static Pages
    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigateTo} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage onNavigate={navigateTo} />;
    }
    if (currentPath === '/privacy') {
      return <PrivacyPage onNavigate={navigateTo} />;
    }
    if (currentPath === '/terms') {
      return <TermsPage onNavigate={navigateTo} />;
    }

    // 9. Reader Account & Authentication
    if (currentPath === '/login' || currentPath === '/signin') {
      return <LoginPage onNavigate={navigateTo} />;
    }
    if (currentPath === '/register' || currentPath === '/signup') {
      return <RegisterPage onNavigate={navigateTo} />;
    }
    if (currentPath === '/account' || currentPath === '/profile') {
      return <UserProfilePage onNavigate={navigateTo} />;
    }
    if (currentPath === '/access-denied') {
      return <AccessDeniedPage onNavigate={navigateTo} />;
    }

    // 10. 404 Fallback
    return <NotFoundPage onNavigate={navigateTo} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-white">
      <Header currentPath={currentPath} onNavigate={navigateTo} />
      <main className="flex-1">
        {renderPublicPage()}
      </main>
      <Footer onNavigate={navigateTo} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <AppContent />
      </SiteProvider>
    </AuthProvider>
  );
}
