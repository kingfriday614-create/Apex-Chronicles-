/**
 * Safe date parsing and formatting utility.
 * Handles ISO strings and SQLite 'YYYY-MM-DD HH:MM:SS' strings across all mobile WebKit
 * and Safari engines without throwing RangeError.
 */

export function parseSafeDate(dateInput?: string | null): Date | null {
  if (!dateInput) return null;

  try {
    // If SQLite date format "YYYY-MM-DD HH:MM:SS", convert space to 'T' and add 'Z' if needed
    let sanitized = dateInput.trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(sanitized)) {
      sanitized = sanitized.replace(' ', 'T') + 'Z';
    }

    const d = new Date(sanitized);
    if (isNaN(d.getTime())) {
      // Secondary attempt with standard parse
      const direct = new Date(dateInput);
      return isNaN(direct.getTime()) ? null : direct;
    }
    return d;
  } catch {
    return null;
  }
}

export function formatArticleDate(
  dateInput?: string | null,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  },
  fallback = 'Recent'
): string {
  const d = parseSafeDate(dateInput);
  if (!d) return fallback;

  try {
    return new Intl.DateTimeFormat('en-US', options).format(d);
  } catch {
    return fallback;
  }
}
