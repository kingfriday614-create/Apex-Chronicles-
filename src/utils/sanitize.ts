import DOMPurify from 'dompurify';

/**
 * Robust HTML sanitizer designed specifically for editorial articles,
 * rich content, and hyperlinked media in Apex Chronicle.
 * 
 * Guarantees that valid hyperlinks (e.g., <a href="...">View All →</a>)
 * are strictly preserved while stripping malicious scripts, event handlers,
 * and dangerous protocols.
 */

// Safe fallback sanitizer for SSR / Node environments without DOM
function fallbackSanitize(html: string): string {
  if (!html) return '';
  return html
    // Strip script and iframe tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Strip inline on* event handlers (e.g. onclick, onerror)
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Strip dangerous javascript: and vbscript: URIs in href or src
    .replace(/(href|src)\s*=\s*["']?\s*(?:javascript|vbscript|data(?!\s*:\s*image)):[^"'>]*/gi, '$1="#"');
}

export function sanitizeArticleContent(htmlContent: string): string {
  if (!htmlContent) return '';

  try {
    let purifier: any = null;
    if (typeof window !== 'undefined') {
      if (typeof (DOMPurify as any).sanitize === 'function') {
        purifier = DOMPurify;
      } else if (typeof DOMPurify === 'function') {
        purifier = (DOMPurify as any)(window);
      }
    }

    if (purifier && typeof purifier.sanitize === 'function') {
      return purifier.sanitize(htmlContent, {
        ALLOWED_TAGS: [
          'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'strong', 'b', 'em', 'i', 'u', 's', 'strike',
          'blockquote', 'ul', 'ol', 'li',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'pre', 'code', 'hr', 'br',
          'img', 'figure', 'figcaption',
          'span', 'div', 'button', 'mark', 'sub', 'sup'
        ],
        ALLOWED_ATTR: [
          'href', 'target', 'rel', 'class', 'className',
          'style', 'id', 'alt', 'src', 'title', 'download',
          'aria-label', 'aria-hidden', 'width', 'height', 'loading'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$)|#|\/)/i,
        ADD_ATTR: ['target', 'rel'],
        FORCE_BODY: false
      });
    }
  } catch (err) {
    console.warn('DOMPurify instance failed, using fallback sanitizer:', err);
  }

  return fallbackSanitize(htmlContent);
}
