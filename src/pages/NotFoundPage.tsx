import React, { useEffect } from 'react';
import { updatePageSeo } from '../utils/seo';
import { Compass, Home, BookOpen, Search } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    updatePageSeo({
      title: '404 Page Not Found – Apex Chronicle',
      description: 'The requested article or page could not be found.',
      ogType: 'website'
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
        <Compass className="w-8 h-8" />
      </div>

      <span className="font-mono text-xs uppercase tracking-widest text-stone-500 block mb-2">
        Error 404
      </span>

      <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
        Dispatch Not Found
      </h1>

      <p className="font-serif text-stone-600 text-lg leading-relaxed mb-8 max-w-lg mx-auto">
        The URL you requested could not be located in our archives. The article may have been reorganized, renamed, or withdrawn by the editorial desk.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Front Page</span>
        </button>

        <button
          onClick={() => onNavigate('/articles')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-300 text-stone-800 text-xs font-semibold rounded hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <BookOpen className="w-4 h-4" />
          <span>All Articles</span>
        </button>

        <button
          onClick={() => onNavigate('/search')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-300 text-stone-800 text-xs font-semibold rounded hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Search Archive</span>
        </button>
      </div>
    </div>
  );
};
