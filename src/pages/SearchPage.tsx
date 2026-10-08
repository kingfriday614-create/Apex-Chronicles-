import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { api } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { AdPlacement } from '../components/AdPlacement';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';
import { Search as SearchIcon } from 'lucide-react';

interface SearchPageProps {
  initialQuery?: string;
  onNavigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onNavigate }) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [results, setResults] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
    setSearchTerm(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setTotal(0);
      setSearched(false);
      return;
    }

    const runSearch = async () => {
      try {
        setLoading(true);
        setSearched(true);
        const res = await api.getArticles({ search: searchTerm.trim(), limit: 30 });
        setResults(res.articles);
        setTotal(res.total);

        updatePageSeo({
          title: `Search: "${searchTerm}" – Apex Chronicle`,
          description: `Search results for query "${searchTerm}" on Apex Chronicle news archive.`,
          ogType: 'website'
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchTerm(query.trim());
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <Breadcrumb items={[{ label: 'Search' }]} onNavigate={onNavigate} className="mb-6" />

      {/* Header & Search Bar */}
      <header className="pb-8 border-b border-stone-200 mb-8 max-w-3xl">
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
          Search the Archives
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keywords, companies, topics..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {searched && (
          <div className="mt-4 text-xs font-mono text-stone-500">
            {loading ? (
              <span>Scanning archive...</span>
            ) : (
              <span>
                Found <strong>{total}</strong> {total === 1 ? 'dispatch' : 'dispatches'} matching &quot;{searchTerm}&quot;
              </span>
            )}
          </div>
        )}
      </header>

      {/* Search Page Ad Placement */}
      <AdPlacement slotKey="search_page" />

      {/* Results List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
          <p className="text-sm font-mono text-stone-500">Searching records...</p>
        </div>
      ) : searched && results.length === 0 ? (
        <div className="py-16 text-center border border-stone-200 rounded bg-stone-50 max-w-2xl mx-auto space-y-3">
          <h3 className="font-editorial text-xl font-bold text-stone-800">
            No matching dispatches found
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            We could not find any published articles matching &quot;{searchTerm}&quot;. Please verify the spelling or try broader terms such as &quot;technology&quot;, &quot;energy&quot;, or &quot;markets&quot;.
          </p>
          <div className="pt-2 flex justify-center gap-2">
            <button
              onClick={() => onNavigate('/articles')}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded cursor-pointer"
            >
              Browse All Articles
            </button>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-stone-200 max-w-4xl">
          {results.map((art) => (
            <ArticleCard key={art.id} article={art} onNavigate={onNavigate} variant="horizontal" />
          ))}
        </div>
      )}
    </div>
  );
};
