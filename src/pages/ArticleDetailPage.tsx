import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { api } from '../services/api';
import { Breadcrumb } from '../components/Breadcrumb';
import { AdPlacement } from '../components/AdPlacement';
import { NewsletterBox } from '../components/NewsletterBox';
import { ArticleCard } from '../components/ArticleCard';
import { updatePageSeo } from '../utils/seo';
import { sanitizeArticleContent } from '../utils/sanitize';
import {
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  Check,
  Share2,
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface ArticleDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ slug, onNavigate }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [prev, setPrev] = useState<{ title: string; slug: string } | null>(null);
  const [next, setNext] = useState<{ title: string; slug: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.getArticleBySlug(slug);
        const art = data.article;
        setArticle(art);
        setRelated(data.related || []);
        setPrev(data.prev || null);
        setNext(data.next || null);

        // Calculate full URLs and structured data
        const articleUrl = `${window.location.origin}/article/${art.slug}`;
        const imageUrl = art.featured_image || `${window.location.origin}/og-image.jpg`;

        // Update Full SEO & NewsArticle JSON-LD
        updatePageSeo({
          title: art.seo_title || art.title,
          description: art.seo_description || art.excerpt,
          canonicalUrl: art.canonical_url || articleUrl,
          ogType: 'article',
          ogImage: art.social_image || imageUrl,
          publishedTime: art.published_at || undefined,
          modifiedTime: art.updated_at || undefined,
          authorName: art.author_name || 'Apex Chronicle Staff',
          section: art.category_name || 'General',
          tags: (art.tags || []).map(t => t.name),
          jsonLd: {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'NewsArticle',
                '@id': `${articleUrl}#article`,
                'isPartOf': {
                  '@type': 'WebSite',
                  '@id': `${window.location.origin}/#website`,
                  'name': 'Apex Chronicle',
                  'url': window.location.origin
                },
                'headline': art.title,
                'description': art.excerpt,
                'url': articleUrl,
                'mainEntityOfPage': articleUrl,
                'datePublished': art.published_at || art.created_at,
                'dateModified': art.updated_at || art.published_at,
                'inLanguage': 'en-US',
                'image': {
                  '@type': 'ImageObject',
                  'url': imageUrl,
                  'caption': art.image_caption || art.featured_image_alt || art.title
                },
                'author': {
                  '@type': 'Person',
                  'name': art.author_name || 'Apex Chronicle Staff',
                  'jobTitle': art.author_role || 'Staff Writer'
                },
                'publisher': {
                  '@type': 'Organization',
                  'name': 'Apex Chronicle',
                  'url': window.location.origin,
                  'logo': {
                    '@type': 'ImageObject',
                    'url': `${window.location.origin}/logo.png`
                  }
                },
                'articleSection': art.category_name || 'General',
                'keywords': (art.tags || []).map(t => t.name).join(', ')
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${articleUrl}#breadcrumb`,
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
                    'name': art.category_name || 'Articles',
                    'item': art.category_slug ? `${window.location.origin}/category/${art.category_slug}` : `${window.location.origin}/articles`
                  },
                  {
                    '@type': 'ListItem',
                    'position': 3,
                    'name': art.title,
                    'item': articleUrl
                  }
                ]
              }
            ]
          }
        });
      } catch (err: any) {
        setError(err.message || 'Article could not be found or is not published');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share && article) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-stone-500">Retrieving article dispatch...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-editorial text-3xl font-bold text-stone-900 mb-3">
          Dispatch Unavailable
        </h1>
        <p className="text-stone-600 mb-6">
          {error || 'This article is either in draft status or has moved to an archived location.'}
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 cursor-pointer"
        >
          Return to Front Page
        </button>
      </div>
    );
  }

  const wordCount = (article.content || '').split(/\s+/).length;
  const readTimeEst = Math.max(1, Math.ceil(wordCount / 200));

  const pubDateFormatted = article.published_at
    ? new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date(article.published_at))
    : 'Recently';

  const updatedDateFormatted = article.updated_at && article.published_at && article.updated_at !== article.published_at
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(new Date(article.updated_at))
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          ...(article.category_name && article.category_slug
            ? [{ label: article.category_name, path: `/category/${article.category_slug}` }]
            : []),
          { label: article.title }
        ]}
        onNavigate={onNavigate}
        className="mb-6"
      />

      {/* Article Top Advertisement */}
      <AdPlacement slotKey="article_top" />

      {/* Semantic Article Tag */}
      <article className="mt-4">
        <header className="space-y-4 pb-8 border-b border-stone-200">
          {/* Category Kicker */}
          {article.category_name && (
            <div className="text-xs font-mono font-semibold uppercase tracking-widest text-stone-800">
              <button
                onClick={() => onNavigate(`/category/${article.category_slug}`)}
                className="hover:underline underline-offset-4 cursor-pointer"
              >
                {article.category_name}
              </button>
            </div>
          )}

          {/* Article Headline */}
          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 leading-[1.12] tracking-tight">
            {article.title}
          </h1>

          {/* Subtitle / Excerpt */}
          {article.excerpt && (
            <p className="font-serif text-lg sm:text-xl text-stone-600 leading-relaxed italic">
              {article.excerpt}
            </p>
          )}

          {/* Author & Byline Metadata Strip */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-stone-100">
            <div className="flex items-center gap-3">
              {article.author_avatar ? (
                <img
                  src={article.author_avatar}
                  alt={article.author_name || 'Author'}
                  className="w-11 h-11 rounded-full object-cover border border-stone-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm">
                  {(article.author_name || 'A')[0]}
                </div>
              )}

              <div>
                <div className="text-sm font-semibold text-stone-900">
                  {article.author_name || 'Apex Chronicle Staff'}
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-2 font-mono">
                  <span>{article.author_role || 'Staff Correspondent'}</span>
                  {article.author_twitter && (
                    <>
                      <span aria-hidden="true">·</span>
                      <a
                        href={`https://x.com/${article.author_twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-stone-800 underline underline-offset-2"
                      >
                        @{article.author_twitter}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-xs text-stone-500 font-mono space-y-1 sm:text-right">
              <div className="flex items-center sm:justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <time dateTime={article.published_at || undefined}>{pubDateFormatted}</time>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{readTimeEst} min read ({wordCount} words)</span>
              </div>
              {updatedDateFormatted && (
                <div className="text-[11px] text-stone-600">Updated: {updatedDateFormatted}</div>
              )}
            </div>
          </div>

          {/* Social Sharing Toolbar */}
          <div className="pt-4 flex items-center justify-between gap-2 border-t border-stone-100">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-600">
              Share Dispatch:
            </span>

            <div className="flex items-center gap-1.5">
              <button
                onClick={shareOnTwitter}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                title="Share on X (Twitter)"
                aria-label="Share on X"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                title="Share on LinkedIn"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </button>
              <button
                onClick={shareOnFacebook}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer"
                title="Share on Facebook"
                aria-label="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer relative"
                title="Copy link"
                aria-label="Copy link to article"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <LinkIcon className="w-4 h-4" />}
                {copied && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] px-2 py-0.5 rounded font-mono whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
              <button
                onClick={handleNativeShare}
                className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors cursor-pointer sm:hidden"
                title="Share via device"
                aria-label="Share via device"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {article.featured_image && (
          <figure className="my-8">
            <img
              src={article.featured_image}
              alt={article.featured_image_alt || article.title}
              className="w-full aspect-[16/10] object-cover rounded shadow-sm bg-stone-100"
              loading="eager"
            />
            {article.image_caption && (
              <figcaption className="text-xs text-stone-500 font-mono mt-2.5 text-center leading-normal">
                {article.image_caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article Body Content */}
        <div
          className="font-editorial text-base sm:text-lg text-stone-900 leading-[1.8] space-y-6 my-10 article-body"
          onClick={(e) => {
            const anchor = (e.target as HTMLElement).closest('a');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href) return;

            // Handle internal SPA navigation smoothly for relative links
            if (href.startsWith('/') && !href.startsWith('//')) {
              e.preventDefault();
              onNavigate(href);
            } else if (href.startsWith('#')) {
              // Smooth anchor scroll if applicable
              const targetEl = document.getElementById(href.slice(1));
              if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth' });
              }
            } else if (href.startsWith('http://') || href.startsWith('https://')) {
              // External link: ensure it opens securely
              if (!anchor.getAttribute('target')) {
                anchor.setAttribute('target', '_blank');
              }
              if (!anchor.getAttribute('rel')) {
                anchor.setAttribute('rel', 'noopener noreferrer');
              }
            }
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(article.content) }} />
        </div>

        {/* In-Article Advertisement Placement */}
        <AdPlacement slotKey="article_middle" />

        {/* Tags Section */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-8 pb-4 border-t border-stone-200">
            <span className="text-xs font-mono uppercase tracking-wider text-stone-500 block mb-2.5">
              Related Topics:
            </span>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onNavigate(`/tag/${t.slug}`)}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs rounded transition-colors font-mono cursor-pointer"
                >
                  #{t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Box */}
        {article.author_name && (
          <section
            aria-labelledby="author-bio-heading"
            className="my-10 p-6 bg-stone-100/70 border border-stone-200 rounded flex flex-col sm:flex-row gap-5 items-start sm:items-center"
          >
            {article.author_avatar && (
              <img
                src={article.author_avatar}
                alt={article.author_name}
                className="w-16 h-16 rounded-full object-cover shrink-0 border border-stone-300"
              />
            )}
            <div className="space-y-1.5 flex-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                About the Correspondent
              </span>
              <h3 id="author-bio-heading" className="font-editorial text-xl font-bold text-stone-900">
                {article.author_name}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {article.author_bio || `${article.author_name} is a contributing editor specializing in investigations and market dispatches for Apex Chronicle.`}
              </p>
              {article.author_twitter && (
                <a
                  href={`https://x.com/${article.author_twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-stone-800 font-semibold hover:underline pt-1"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>Follow @{article.author_twitter}</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Previous & Next Navigation */}
        {(prev || next) && (
          <nav aria-label="Previous and Next Stories" className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-8 border-y border-stone-200 my-10">
            {prev ? (
              <button
                onClick={() => onNavigate(`/article/${prev.slug}`)}
                className="p-4 border border-stone-200 rounded hover:border-stone-400 text-left group transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1 text-[11px] font-mono text-stone-500 uppercase tracking-wider mb-1">
                  <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                  <span>Previous Story</span>
                </span>
                <span className="font-editorial text-sm sm:text-base font-bold text-stone-900 group-hover:text-stone-700 line-clamp-2">
                  {prev.title}
                </span>
              </button>
            ) : <div />}

            {next ? (
              <button
                onClick={() => onNavigate(`/article/${next.slug}`)}
                className="p-4 border border-stone-200 rounded hover:border-stone-400 text-right group transition-colors cursor-pointer sm:col-start-2"
              >
                <span className="flex items-center justify-end gap-1 text-[11px] font-mono text-stone-500 uppercase tracking-wider mb-1">
                  <span>Next Story</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="font-editorial text-sm sm:text-base font-bold text-stone-900 group-hover:text-stone-700 line-clamp-2">
                  {next.title}
                </span>
              </button>
            ) : null}
          </nav>
        )}

        {/* Post-Article Advertisement Placement */}
        <AdPlacement slotKey="article_bottom" />

        {/* Related Articles Section */}
        {related.length > 0 && (
          <section className="my-12" aria-labelledby="related-coverage-heading">
            <h3 id="related-coverage-heading" className="font-editorial text-2xl font-bold text-stone-900 pb-3 border-b border-stone-200 mb-6">
              Related Coverage &amp; Follow-up Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((art) => (
                <ArticleCard key={art.id} article={art} onNavigate={onNavigate} variant="standard" />
              ))}
            </div>
          </section>
        )}

        {/* Newsletter In-Article Box */}
        <div className="my-12">
          <NewsletterBox />
        </div>
      </article>
    </div>
  );
};
