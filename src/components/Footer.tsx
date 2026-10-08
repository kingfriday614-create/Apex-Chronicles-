import React from 'react';
import { Twitter, Linkedin, Facebook, Mail, Shield, ArrowUp } from 'lucide-react';
import { useSite } from '../context/SiteContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings, categories } = useSite();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-editorial text-2xl font-bold text-white tracking-tight">
              {settings?.site_name || 'Apex Chronicle'}
            </h2>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              {settings?.site_description ||
                'An independent digital publication delivering rigorous investigative reporting, macroeconomic trends, and technological analysis.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings?.social_twitter && (
                <a
                  href={settings.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 rounded transition-colors"
                  aria-label="X / Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings?.social_linkedin && (
                <a
                  href={settings.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 rounded transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings?.social_facebook && (
                <a
                  href={settings.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 rounded transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="p-2 bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 rounded transition-colors"
                  aria-label="Email Editorial Desk"
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Categories directory */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-200 mb-4 font-mono">
              Editorial Desks
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`/category/${cat.slug}`)}
                    className="hover:text-white transition-colors"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Publication Links */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-200 mb-4 font-mono">
              Publication
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
                  Front Page
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/articles')} className="hover:text-white transition-colors">
                  All Articles
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                  About Editorial Desk
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                  Contact &amp; Press
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/categories')} className="hover:text-white transition-colors">
                  Categories Archive
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-stone-200 mb-4 font-mono">
              Legal &amp; Feeds
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  XML Sitemap
                </a>
              </li>
              <li>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Robots.txt
                </a>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/admin')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-stone-500 pt-2"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Access</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            {settings?.footer_copyright || '© 2026 Apex Chronicle Media Group. All rights reserved.'}
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
