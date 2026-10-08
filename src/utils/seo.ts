interface SeoConfig {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  section?: string;
  tags?: string[];
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export function updatePageSeo(config: SeoConfig) {
  const defaultSiteName = 'Apex Chronicle';
  const fullTitle = config.title
    ? (config.title.includes(defaultSiteName) ? config.title : `${config.title} | ${defaultSiteName}`)
    : 'Apex Chronicle – Digital News & Editorial Publication';

  // 1. Document Title
  document.title = fullTitle;

  // 2. Helper to set or create meta tags
  const setMeta = (name: string, content: string, isProperty = false) => {
    if (!content) return;
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.content = content;
  };

  // 3. Helper for links (canonical)
  const setCanonical = (href: string) => {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = href;
  };

  const currentUrl = config.canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

  // 4. Update core meta
  if (config.description) {
    setMeta('description', config.description);
    setMeta('og:description', config.description, true);
    setMeta('twitter:description', config.description);
  }

  setMeta('og:title', fullTitle, true);
  setMeta('twitter:title', fullTitle);
  setMeta('og:type', config.ogType || 'website', true);
  setMeta('og:site_name', defaultSiteName, true);
  setMeta('og:url', currentUrl, true);
  setMeta('twitter:card', 'summary_large_image');

  if (currentUrl) {
    setCanonical(currentUrl);
  }

  if (config.ogImage) {
    setMeta('og:image', config.ogImage, true);
    setMeta('twitter:image', config.ogImage);
  }

  if (config.ogType === 'article') {
    if (config.publishedTime) setMeta('article:published_time', config.publishedTime, true);
    if (config.modifiedTime) setMeta('article:modified_time', config.modifiedTime, true);
    if (config.authorName) setMeta('article:author', config.authorName, true);
    if (config.section) setMeta('article:section', config.section, true);
  }

  // 5. Schema.org JSON-LD Structured Data
  let scriptEl = document.getElementById('apex-jsonld') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'apex-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  if (config.jsonLd) {
    scriptEl.text = JSON.stringify(config.jsonLd);
  } else {
    // Default WebSite & Organization schema
    scriptEl.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${window.location.origin}/#organization`,
          'name': 'Apex Chronicle',
          'url': window.location.origin,
          'logo': `${window.location.origin}/logo.png`,
          'description': 'An independent digital publication providing in-depth reporting, global technology analysis, and cultural commentary.'
        },
        {
          '@type': 'WebSite',
          '@id': `${window.location.origin}/#website`,
          'url': window.location.origin,
          'name': 'Apex Chronicle',
          'publisher': { '@id': `${window.location.origin}/#organization` },
          'potentialAction': {
            '@type': 'SearchAction',
            'target': `${window.location.origin}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }
      ]
    });
  }
}
