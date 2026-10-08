/**
 * Intelligent base-aware routing and navigation utility for Apex Chronicle.
 * Supports:
 * 1. Standard root hosting (http://localhost:3000/, https://apexchronicle.com/)
 * 2. GitHub Pages project subpaths (https://username.github.io/repo-name/)
 * 3. Client-side hash routing fallback (https://username.github.io/repo-name/#/articles)
 * 4. GitHub Pages 404.html redirect parameter restoration (?/articles or ?p=/articles)
 */

const KNOWN_TOP_LEVEL_ROUTES = new Set([
  'admin',
  'articles',
  'categories',
  'category',
  'tag',
  'article',
  'search',
  'about',
  'contact',
  'privacy',
  'terms',
  'login',
  'signin',
  'register',
  'signup',
  'account',
  'profile',
  'access-denied',
  'latest'
]);

/**
 * Detects the repository or subdirectory prefix if hosted on GitHub Pages or subfolder.
 * e.g., for "/apex-chronicle/article/foo" returns "/apex-chronicle"
 * e.g., for "/apex-chronicle/" returns "/apex-chronicle"
 * e.g., for "/articles" returns ""
 * e.g., for "/" returns ""
 */
export function getBasePrefix(): string {
  if (typeof window === 'undefined') return '';

  const pathname = window.location.pathname.replace(/\/+$/, '');
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return '';
  }

  // If the first segment is already a known app route, there is no subfolder prefix
  if (KNOWN_TOP_LEVEL_ROUTES.has(segments[0].toLowerCase())) {
    return '';
  }

  // Otherwise, the first segment is the repo/subdirectory name
  return `/${segments[0]}`;
}

/**
 * Parses the current internal application route from:
 * 1. URL Hash (#/article/slug or #/admin)
 * 2. GitHub Pages SPA redirect query (?/article/slug or ?p=/article/slug)
 * 3. Normal Pathname (stripping any repository prefix)
 */
export function getCurrentAppRoute(): string {
  if (typeof window === 'undefined') return '/';

  // 1. Check for Hash route
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/')) {
    return hash.substring(1);
  } else if (hash && hash.startsWith('#!/')) {
    return hash.substring(2);
  }

  // 2. Check for SPA redirect query parameter (e.g. from GitHub Pages 404.html)
  const search = window.location.search;
  if (search) {
    const params = new URLSearchParams(search);
    const pParam = params.get('p') || params.get('path');
    if (pParam) {
      return pParam.startsWith('/') ? pParam : `/${pParam}`;
    }

    // Handles ?/articles redirect pattern
    if (search.startsWith('?/')) {
      const redirectedPath = search.substring(1).split('&')[0];
      return redirectedPath.startsWith('/') ? redirectedPath : `/${redirectedPath}`;
    }
  }

  // 3. Extract route from pathname
  const rawPath = window.location.pathname;
  const basePrefix = getBasePrefix();

  let route = rawPath;
  if (basePrefix && route.startsWith(basePrefix)) {
    route = route.slice(basePrefix.length);
  }

  // Clean trailing slashes unless root
  if (route.length > 1 && route.endsWith('/')) {
    route = route.slice(0, -1);
  }

  return route || '/';
}

/**
 * Construct full URL path including base prefix
 */
export function getFullPath(route: string): string {
  const cleanRoute = route.startsWith('/') ? route : `/${route}`;
  const base = getBasePrefix();
  return `${base}${cleanRoute}`;
}
