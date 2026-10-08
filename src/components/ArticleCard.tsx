import React from 'react';
import { Article } from '../types';
import { ArrowRight } from 'lucide-react';
import { formatArticleDate } from '../utils/date';

interface ArticleCardProps {
  article: Article;
  onNavigate: (path: string) => void;
  variant?: 'hero' | 'standard' | 'horizontal' | 'compact';
  priority?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  onNavigate,
  variant = 'standard',
  priority = false
}) => {
  const formattedDate = formatArticleDate(article.published_at, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const readTimeEst = Math.max(1, Math.ceil((article.content || '').split(/\s+/).length / 200));

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(`/article/${article.slug}`);
  };

  // 1. HERO VARIANT (Dominant editorial cover story)
  if (variant === 'hero') {
    return (
      <article className="group grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-12 border-b border-stone-200">
        <div className="lg:col-span-7 overflow-hidden rounded bg-stone-100">
          <a href={`/article/${article.slug}`} onClick={handleClick} className="block overflow-hidden">
            <img
              src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'}
              alt={article.featured_image_alt || article.title}
              loading={priority ? 'eager' : 'lazy'}
              className="w-full aspect-[16/10] object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
            />
          </a>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
          {/* Clean unboxed metadata kicker */}
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-500">
            {article.category_name && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(`/category/${article.category_slug}`);
                }}
                className="font-semibold text-stone-900 hover:text-stone-600 transition-colors"
              >
                {article.category_name}
              </button>
            )}
            <span aria-hidden="true" className="text-stone-300">·</span>
            <time dateTime={article.published_at || undefined}>{formattedDate}</time>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{readTimeEst} min read</span>
          </div>

          <a href={`/article/${article.slug}`} onClick={handleClick} className="block">
            <h2 className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 group-hover:text-stone-700 leading-[1.15] tracking-tight transition-colors">
              {article.title}
            </h2>
          </a>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed line-clamp-3">
            {article.excerpt}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
            <div className="flex items-center gap-3">
              {article.author_avatar && (
                <img
                  src={article.author_avatar}
                  alt={article.author_name || 'Author'}
                  className="w-8 h-8 rounded-full object-cover border border-stone-200"
                />
              )}
              <div className="text-xs">
                <span className="font-medium text-stone-900 block">{article.author_name || 'Editorial Staff'}</span>
                <span className="text-stone-500 block">{article.author_role || 'Staff Writer'}</span>
              </div>
            </div>

            <a
              href={`/article/${article.slug}`}
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer group shadow-xs"
            >
              <span>Read Full Dispatch</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </article>
    );
  }

  // 2. HORIZONTAL VARIANT (Feed style with side thumbnail)
  if (variant === 'horizontal') {
    return (
      <article className="group flex flex-col sm:flex-row gap-5 py-6 border-b border-stone-200">
        <div className="w-full sm:w-48 sm:h-32 shrink-0 overflow-hidden rounded bg-stone-100">
          <a href={`/article/${article.slug}`} onClick={handleClick} className="block h-full">
            <img
              src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80'}
              alt={article.featured_image_alt || article.title}
              loading="lazy"
              className="w-full h-full aspect-[16/10] sm:aspect-auto object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </a>
        </div>

        <div className="flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 font-mono">
              {article.category_name && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(`/category/${article.category_slug}`);
                  }}
                  className="font-semibold uppercase tracking-wider text-stone-800 hover:text-stone-600 transition-colors"
                >
                  {article.category_name}
                </button>
              )}
              <span aria-hidden="true" className="text-stone-300">·</span>
              <time dateTime={article.published_at || undefined}>{formattedDate}</time>
            </div>

            <a href={`/article/${article.slug}`} onClick={handleClick} className="block">
              <h3 className="font-editorial text-lg sm:text-xl font-bold text-stone-900 group-hover:text-stone-700 leading-snug transition-colors">
                {article.title}
              </h3>
            </a>

            <p className="text-stone-600 text-xs sm:text-sm mt-1 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="text-xs text-stone-500 pt-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>By {article.author_name || 'Staff'}</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span>{readTimeEst} min read</span>
            </div>
            <a
              href={`/article/${article.slug}`}
              onClick={handleClick}
              className="inline-flex items-center gap-1 font-semibold text-stone-900 hover:text-stone-600 transition-colors cursor-pointer group"
            >
              <span>Read More</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </article>
    );
  }

  // 3. COMPACT VARIANT (Text-first for sidebars)
  if (variant === 'compact') {
    return (
      <article className="group py-3.5 border-b border-stone-200/80 last:border-b-0">
        <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500 mb-1">
          {article.category_name && (
            <span className="font-semibold text-stone-800 uppercase tracking-wider">
              {article.category_name}
            </span>
          )}
          <span aria-hidden="true" className="text-stone-300">·</span>
          <time dateTime={article.published_at || undefined}>{formattedDate}</time>
        </div>

        <a href={`/article/${article.slug}`} onClick={handleClick} className="block">
          <h4 className="font-editorial text-sm sm:text-base font-semibold text-stone-900 group-hover:text-stone-700 leading-snug transition-colors">
            {article.title}
          </h4>
        </a>
      </article>
    );
  }

  // 4. STANDARD CARD (Grid layout)
  return (
    <article className="group flex flex-col justify-between">
      <div>
        <div className="overflow-hidden rounded bg-stone-100 mb-3.5">
          <a href={`/article/${article.slug}`} onClick={handleClick} className="block">
            <img
              src={article.featured_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80'}
              alt={article.featured_image_alt || article.title}
              loading="lazy"
              className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            />
          </a>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-500 mb-2">
          {article.category_name && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(`/category/${article.category_slug}`);
              }}
              className="font-semibold text-stone-900 hover:text-stone-600 transition-colors"
            >
              {article.category_name}
            </button>
          )}
          <span aria-hidden="true" className="text-stone-300">·</span>
          <time dateTime={article.published_at || undefined}>{formattedDate}</time>
        </div>

        <a href={`/article/${article.slug}`} onClick={handleClick} className="block mb-2">
          <h3 className="font-editorial text-lg sm:text-xl font-bold text-stone-900 group-hover:text-stone-700 leading-snug transition-colors line-clamp-2">
            {article.title}
          </h3>
        </a>

        <p className="text-stone-600 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
          {article.excerpt}
        </p>
      </div>

      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span>By {article.author_name || 'Staff'}</span>
        <a
          href={`/article/${article.slug}`}
          onClick={handleClick}
          className="inline-flex items-center gap-1 font-semibold text-stone-900 hover:text-stone-600 transition-colors cursor-pointer group"
        >
          <span>Read More</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </article>
  );
};
