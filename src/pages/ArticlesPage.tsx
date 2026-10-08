import React, { useState, useEffect } from 'react';
import { Article, Category } from '../types';
import { api } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';

interface ArticlesPageProps {
  onNavigate: (path: string) => void;
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({ onNavigate }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    updatePageSeo({
      title: 'All Articles – Apex Chronicle Archive',
      description: 'Browse the complete archive of investigative reporting, technology analyses, and market dispatches from Apex Chronicle.',
      ogType: 'website'
    });

    api.getCategories().then(res => setCategories(res.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const offset = (page - 1) * limit;
        const res = await api.getArticles({
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          sort,
          limit,
          offset
        });

        setArticles(res.articles);
        setTotal(res.total);
      } catch (err) {
        console.error('Failed to load articles', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [selectedCategory, sort, page]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <Breadcrumb items={[{ label: 'All Articles' }]} onNavigate={onNavigate} className="mb-6" />

      <header className="pb-8 border-b border-stone-200 mb-8">
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3">
          Editorial Archive
        </h1>
        <p className="text-stone-600 max-w-2xl text-sm sm:text-base leading-relaxed">
          Comprehensive collection of published dispatches, investigations, essays, and field reports.
        </p>

        {/* Filter bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-stone-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500 mr-1">Filter Desk:</span>
            <button
              onClick={() => { setSelectedCategory('all'); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              All Desks
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500">Order:</span>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as any); setPage(1); }}
              className="bg-white border border-stone-300 text-stone-800 text-xs px-2.5 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-stone-600 font-sans cursor-pointer"
            >
              <option value="latest">Chronological (Newest)</option>
              <option value="popular">Most Read</option>
            </select>
          </div>
        </div>
      </header>

      {/* Articles Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
          <p className="text-sm font-mono text-stone-500">Retrieving articles...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-16 text-center border border-stone-200 rounded bg-stone-50">
          <h3 className="font-editorial text-xl font-bold text-stone-800 mb-2">No articles found</h3>
          <p className="text-sm text-stone-600 mb-4">No published articles match the current filter selection.</p>
          <button
            onClick={() => { setSelectedCategory('all'); setPage(1); }}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} onNavigate={onNavigate} variant="standard" />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-8 border-t border-stone-200 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-stone-300 bg-white text-xs font-semibold rounded disabled:opacity-40 hover:bg-stone-50 cursor-pointer"
          >
            &larr; Previous
          </button>

          <span className="text-xs font-mono text-stone-600">
            Page {page} of {totalPages} ({total} total)
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-stone-300 bg-white text-xs font-semibold rounded disabled:opacity-40 hover:bg-stone-50 cursor-pointer"
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
