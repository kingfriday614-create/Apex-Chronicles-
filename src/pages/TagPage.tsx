import React, { useState, useEffect } from 'react';
import { Tag, Article } from '../types';
import { api } from '../services/api';
import { ArticleCard } from '../components/ArticleCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { updatePageSeo } from '../utils/seo';
import { Tag as TagIcon } from 'lucide-react';

interface TagPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const TagPage: React.FC<TagPageProps> = ({ slug, onNavigate }) => {
  const [tag, setTag] = useState<Tag | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTagData = async () => {
      try {
        setLoading(true);
        const tagRes = await api.getTag(slug);
        setTag(tagRes.tag);

        const artRes = await api.getArticles({ tag: slug, limit: 20 });
        setArticles(artRes.articles);

        updatePageSeo({
          title: `#${tagRes.tag.name} – Tagged Articles | Apex Chronicle`,
          description: `All reports, dispatches, and analyses filed under #${tagRes.tag.name}.`,
          canonicalUrl: `${window.location.origin}/tag/${slug}`,
          ogType: 'website'
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTagData();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-stone-500">Loading tagged articles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      <Breadcrumb
        items={[
          { label: 'Topics', path: '/categories' },
          { label: tag ? `#${tag.name}` : `#${slug}` }
        ]}
        onNavigate={onNavigate}
        className="mb-6"
      />

      <header className="pb-8 border-b border-stone-200 mb-8">
        <div className="flex items-center gap-2 text-stone-500 mb-2">
          <TagIcon className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-widest">Topic Tag Archive</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-3">
          #{tag?.name || slug}
        </h1>
        <p className="text-stone-600 text-sm">
          {articles.length} {articles.length === 1 ? 'article' : 'articles'} cataloged with this subject tag.
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="py-16 text-center border border-stone-200 rounded bg-stone-50">
          <p className="text-stone-600">No published articles found for this tag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((art) => (
            <ArticleCard key={art.id} article={art} onNavigate={onNavigate} variant="standard" />
          ))}
        </div>
      )}
    </div>
  );
};
