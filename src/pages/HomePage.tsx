import React, { useState, useEffect } from 'react';
import { Article, Category } from '../types';
import { api } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { AdPlacement } from '../components/AdPlacement';
import { NewsletterBox } from '../components/NewsletterBox';
import { updatePageSeo } from '../utils/seo';
import { TrendingUp, Flame, ArrowRight, Compass } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    // Set SEO metadata on homepage
    updatePageSeo({
      title: 'Apex Chronicle – Digital News & Editorial Publication',
      description: 'In-depth investigations, authoritative technology coverage, economic trends, and cultural essays from award-winning journalists.',
      ogType: 'website'
    });

    const loadHomeData = async () => {
      try {
        setLoading(true);

        const [featRes, popRes, latestRes, catRes] = await Promise.all([
          api.getArticles({ featured: '1', limit: 1 }),
          api.getArticles({ sort: 'popular', limit: 4 }),
          api.getArticles({ limit: 6, offset: 0 }),
          api.getCategories()
        ]);

        const hero = featRes.articles[0] || latestRes.articles[0] || null;
        setFeaturedArticle(hero);

        // Filter popular to avoid exact hero duplicate if possible
        const filteredPopular = popRes.articles.filter(a => a.id !== hero?.id).slice(0, 3);
        setPopularArticles(filteredPopular);

        // Filter latest
        setLatestArticles(latestRes.articles);
        setHasMore(latestRes.total > latestRes.articles.length);
        setCategories(catRes.categories);
      } catch (err) {
        console.error('Failed to load home page content', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const offset = (nextPage - 1) * 6;
      const res = await api.getArticles({ limit: 6, offset });

      setLatestArticles(prev => [...prev, ...res.articles]);
      setPage(nextPage);
      setHasMore(latestArticles.length + res.articles.length < res.total);
    } catch (err) {
      console.error('Failed to load more articles', err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-stone-500">Retrieving front page editorial feed...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
      {/* Homepage Top Ad Slot */}
      <AdPlacement slotKey="homepage_top" />

      {/* Hero / Cover Article */}
      {featuredArticle && (
        <section className="my-8" aria-label="Cover Story">
          <ArticleCard
            article={featuredArticle}
            onNavigate={onNavigate}
            variant="hero"
            priority={true}
          />
        </section>
      )}

      {/* Popular / Trending Section */}
      {popularArticles.length > 0 && (
        <section className="my-12" aria-labelledby="trending-stories-heading">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-stone-700" />
              <h2 id="trending-stories-heading" className="font-editorial text-xl sm:text-2xl font-bold text-stone-900">
                Trending Dispatches
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/articles?sort=popular')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-900 hover:text-white border border-stone-200 hover:border-stone-900 rounded transition-all cursor-pointer shadow-xs group"
              title="View all trending dispatches"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularArticles.map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                onNavigate={onNavigate}
                variant="standard"
              />
            ))}
          </div>
        </section>
      )}

      {/* Mid-Feed Advertisement Slot */}
      <AdPlacement slotKey="homepage_middle" />

      {/* Main Grid: Latest Feed + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 my-12">
        {/* Main Feed Column */}
        <main className="lg:col-span-8">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-stone-700" />
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-stone-900">
                Latest Reports &amp; Essays
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/articles')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-900 hover:text-white border border-stone-200 hover:border-stone-900 rounded transition-all cursor-pointer shadow-xs group"
              title="View all latest articles"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="divide-y divide-stone-200">
            {latestArticles.map((art) => (
              <ArticleCard
                key={art.id}
                article={art}
                onNavigate={onNavigate}
                variant="horizontal"
              />
            ))}
          </div>

          {/* Feed Actions / View All Archive */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full sm:w-auto px-6 py-2.5 bg-white border border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold rounded hover:bg-stone-50 hover:border-stone-400 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loadingMore ? 'Loading Older Dispatches...' : 'Load More in Feed'}
              </button>
            )}
            <button
              onClick={() => onNavigate('/articles')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-stone-900 text-white text-xs sm:text-sm font-semibold rounded hover:bg-stone-800 transition-colors cursor-pointer shadow-xs group"
              title="View all articles in catalog"
            >
              <span>View All Articles Archive</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </main>

        {/* Sidebar Column */}
        <aside className="lg:col-span-4 space-y-10" aria-label="Sidebar">
          {/* Universal Sidebar Ad */}
          <AdPlacement slotKey="sidebar" />

          {/* Newsletter Subscription Box */}
          <NewsletterBox />

          {/* Editorial Desks / Categories Box */}
          <div className="border border-stone-200 bg-white p-6 rounded">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-stone-700" />
                <h3 className="font-editorial text-lg font-bold text-stone-900">
                  Editorial Desks
                </h3>
              </div>
              <button
                onClick={() => onNavigate('/categories')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer group"
                title="View all categories"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onNavigate(`/category/${cat.slug}`)}
                    className="w-full flex items-center justify-between text-sm text-stone-700 hover:text-stone-900 group transition-colors cursor-pointer text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {cat.name}
                    </span>
                    {cat.article_count !== undefined && (
                      <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        {cat.article_count}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About Editorial Mission snippet */}
          <div className="border border-stone-200 bg-stone-100/40 p-6 rounded text-xs text-stone-600 space-y-2">
            <h4 className="font-mono font-semibold uppercase tracking-wider text-stone-800">
              Editorial Standards
            </h4>
            <p className="leading-relaxed">
              Apex Chronicle adheres to the Society of Professional Journalists Code of Ethics. Our coverage is independent, factual, and free from undisclosed commercial influence.
            </p>
            <button
              onClick={() => onNavigate('/about')}
              className="text-stone-900 font-semibold underline underline-offset-2 hover:text-stone-700 cursor-pointer block pt-1"
            >
              Read our mission &rarr;
            </button>
          </div>
        </aside>
      </div>

      {/* Featured Editorial Desks Section Showcase */}
      {categories.length > 0 && (
        <section className="my-14 border-t border-stone-200 pt-10" aria-labelledby="desks-showcase-heading">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-8">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-stone-700" />
              <h2 id="desks-showcase-heading" className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
                Explore Specialized Desks
              </h2>
            </div>
            <button
              onClick={() => onNavigate('/categories')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-900 hover:text-white border border-stone-300 hover:border-stone-900 rounded transition-all cursor-pointer shadow-xs group"
              title="View all editorial desks"
            >
              <span>View All Desks</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((cat) => (
              <div
                key={cat.id}
                className="group border border-stone-200 bg-white p-6 rounded hover:border-stone-400 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-500">
                      BUREAU
                    </span>
                    {cat.article_count !== undefined && (
                      <span className="text-xs font-mono text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                        {cat.article_count} {cat.article_count === 1 ? 'dispatch' : 'dispatches'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-editorial text-xl font-bold text-stone-900 group-hover:text-stone-700 transition-colors mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed mb-6">
                    {cat.description || 'Specialized coverage, investigations, and analytical essays.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <button
                    onClick={() => onNavigate(`/category/${cat.slug}`)}
                    className="w-full inline-flex items-center justify-between px-3.5 py-2 bg-stone-50 hover:bg-stone-900 text-stone-800 hover:text-white border border-stone-200 hover:border-stone-900 rounded text-xs font-semibold transition-all cursor-pointer group/btn"
                    title={`View All ${cat.name} Articles`}
                  >
                    <span>View All {cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pre-Footer Homepage Ad */}
      <AdPlacement slotKey="homepage_bottom" />
    </div>
  );
};
