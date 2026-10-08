import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { api } from '../services/api';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';
import { ArrowRight } from 'lucide-react';

interface CategoriesDirectoryPageProps {
  onNavigate: (path: string) => void;
}

export const CategoriesDirectoryPage: React.FC<CategoriesDirectoryPageProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updatePageSeo({
      title: 'Editorial Desks & Categories – Apex Chronicle',
      description: 'Explore the complete index of reporting sections, specialized topics, and editorial bureaus at Apex Chronicle.',
      ogType: 'website'
    });

    api.getCategories()
      .then(res => setCategories(res.categories))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <Breadcrumb items={[{ label: 'Categories' }]} onNavigate={onNavigate} className="mb-6" />

      <header className="pb-8 border-b border-stone-200 mb-10">
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3">
          Editorial Desks &amp; Topics
        </h1>
        <p className="text-stone-600 max-w-2xl text-sm sm:text-base leading-relaxed">
          Navigate our specialized departments covering science, international markets, semiconductors, culture, and governance.
        </p>
      </header>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
          <p className="text-sm font-mono text-stone-500">Loading editorial directories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/category/${cat.slug}`)}
              className="group border border-stone-200 bg-white p-6 rounded hover:border-stone-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {cat.image_url && (
                  <div className="aspect-[16/9] rounded overflow-hidden mb-4 bg-stone-100">
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-editorial text-xl font-bold text-stone-900 group-hover:text-stone-700 transition-colors">
                    {cat.name}
                  </h2>
                  {cat.article_count !== undefined && (
                    <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                      {cat.article_count} {cat.article_count === 1 ? 'article' : 'articles'}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed mb-4">
                  {cat.description || 'Specialized dispatches and analytical essays.'}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 group-hover:text-stone-700 transition-colors">
                  View All {cat.name} →
                </span>
                <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  Browse Desk
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
