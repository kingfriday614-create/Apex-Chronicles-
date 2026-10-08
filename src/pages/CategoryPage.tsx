import React, { useState, useEffect } from 'react';
import { Category, Article } from '../types';
import { api } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { AdPlacement } from '../components/AdPlacement';
import { updatePageSeo } from '../utils/seo';

interface CategoryPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ slug, onNavigate }) => {
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const catRes = await api.getCategory(slug);
        setCategory(catRes.category);

        const artRes = await api.getArticles({ category: slug, limit: 24 });
        setArticles(artRes.articles);

        // Update SEO metadata
        updatePageSeo({
          title: `${catRes.category.name} – Apex Chronicle`,
          description: catRes.category.description || `Read the latest ${catRes.category.name} news and in-depth reporting from Apex Chronicle.`,
          canonicalUrl: `${window.location.origin}/category/${slug}`,
          ogType: 'website',
          jsonLd: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            'name': catRes.category.name,
            'description': catRes.category.description || '',
            'url': `${window.location.origin}/category/${slug}`,
            'breadcrumb': {
              '@type': 'BreadcrumbList',
              'itemListElement': [
                {
                  '@type': 'ListItem',
                  'position': 1,
                  'name': 'Home',
                  'item': window.location.origin
                },
                {
                  '@type': 'ListItem',
                  'position': 2,
                  'name': 'Categories',
                  'item': `${window.location.origin}/categories`
                },
                {
                  '@type': 'ListItem',
                  'position': 3,
                  'name': catRes.category.name,
                  'item': `${window.location.origin}/category/${slug}`
                }
              ]
            }
          }
        });
      } catch (err: any) {
        setError(err.message || 'Category not found');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-stone-500">Loading desk archive...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-20 text-center">
        <h2 className="font-editorial text-3xl font-bold text-stone-900 mb-3">Desk Not Found</h2>
        <p className="text-stone-600 mb-6">The category &quot;{slug}&quot; could not be located in our archive.</p>
        <button
          onClick={() => onNavigate('/categories')}
          className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded cursor-pointer"
        >
          View All Categories
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Categories', path: '/categories' },
          { label: category.name }
        ]}
        onNavigate={onNavigate}
        className="mb-6"
      />

      {/* Category Masthead Header */}
      <header className="pb-8 border-b border-stone-200 mb-8 relative">
        <span className="text-xs font-mono uppercase tracking-widest text-stone-500 block mb-2">
          Editorial Desk
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-stone-600 max-w-2xl text-sm sm:text-base leading-relaxed">
            {category.description}
          </p>
        )}

        <div className="mt-4 text-xs font-mono text-stone-500">
          {articles.length} published {articles.length === 1 ? 'article' : 'articles'} in this section
        </div>
      </header>

      {/* Category Header Ad Slot */}
      <AdPlacement slotKey="category_page" />

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="py-16 text-center border border-stone-200 rounded bg-stone-50">
          <p className="text-stone-600">No articles have been filed under this desk yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} onNavigate={onNavigate} variant="standard" />
          ))}
        </div>
      )}
    </div>
  );
};
