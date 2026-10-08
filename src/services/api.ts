import {
  Article,
  Category,
  Tag,
  Author,
  SiteSettings,
  AdSlot,
  AdminUser,
  DashboardStats,
  MediaItem,
  Subscriber
} from '../types';
import { safeStorage } from '../utils/storage';
import {
  FALLBACK_SETTINGS,
  FALLBACK_CATEGORIES,
  FALLBACK_TAGS,
  FALLBACK_ARTICLES,
  FALLBACK_ADS
} from '../data/fallbackData';

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

function getAuthHeader(): Record<string, string> {
  const token = safeStorage.getItem('apex_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  let text = '';
  try {
    text = await res.text();
  } catch (err: any) {
    throw new Error(`Failed to read response body: ${err?.message || 'Network stream error'}`);
  }

  let data: any = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Body is not JSON (e.g. 404 HTML)
    }
  }

  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    if (data && typeof data === 'object' && data.error) {
      errMsg = data.error;
    } else if (text && text.length < 500 && !text.includes('<!doctype') && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
      errMsg = text;
    }
    throw new Error(errMsg);
  }

  return (data !== null ? data : (text as unknown)) as T;
}

export const api = {
  // --- Public Endpoints with Static / GitHub Pages Resilience ---
  async getSettings(): Promise<{ settings: SiteSettings }> {
    try {
      const res = await fetch(`${API_BASE}/site/settings`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using bundled site settings fallback:', err);
      return { settings: FALLBACK_SETTINGS };
    }
  },

  async getAds(): Promise<{ ads: AdSlot[] }> {
    try {
      const res = await fetch(`${API_BASE}/site/ads`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using bundled advertisements fallback:', err);
      return { ads: FALLBACK_ADS };
    }
  },

  async getArticles(params: {
    category?: string;
    tag?: string;
    search?: string;
    featured?: string;
    limit?: number;
    offset?: number;
    sort?: 'latest' | 'popular';
  } = {}): Promise<{ articles: Article[]; total: number; limit: number; offset: number }> {
    try {
      const query = new URLSearchParams();
      if (params.category) query.set('category', params.category);
      if (params.tag) query.set('tag', params.tag);
      if (params.search) query.set('search', params.search);
      if (params.featured) query.set('featured', params.featured);
      if (params.limit !== undefined) query.set('limit', params.limit.toString());
      if (params.offset !== undefined) query.set('offset', params.offset.toString());
      if (params.sort) query.set('sort', params.sort);

      const res = await fetch(`${API_BASE}/articles?${query.toString()}`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using bundled articles fallback:', err);
      let list = [...FALLBACK_ARTICLES];

      if (params.category) {
        list = list.filter(a => a.category_slug === params.category || a.category_id === params.category);
      }
      if (params.tag) {
        list = list.filter(a => a.tags?.some(t => t.slug === params.tag || t.id === params.tag));
      }
      if (params.featured) {
        list = list.filter(a => Boolean(a.is_featured));
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(a =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
        );
      }

      if (params.sort === 'popular') {
        list.sort((a, b) => b.views_count - a.views_count);
      } else {
        list.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
      }

      const total = list.length;
      const offset = params.offset || 0;
      const limit = params.limit || 10;
      const paged = list.slice(offset, offset + limit);

      return {
        articles: paged,
        total,
        limit,
        offset
      };
    }
  },

  async getArticleBySlug(slug: string): Promise<{
    article: Article;
    related: Article[];
    prev?: { title: string; slug: string } | null;
    next?: { title: string; slug: string } | null;
  }> {
    try {
      const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(slug)}`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using bundled article detail fallback:', err);
      const article = FALLBACK_ARTICLES.find(a => a.slug === slug || a.id === slug) || FALLBACK_ARTICLES[0];
      const related = FALLBACK_ARTICLES.filter(a => a.id !== article.id && a.category_id === article.category_id);
      const idx = FALLBACK_ARTICLES.findIndex(a => a.id === article.id);
      const prev = idx > 0 ? { title: FALLBACK_ARTICLES[idx - 1].title, slug: FALLBACK_ARTICLES[idx - 1].slug } : null;
      const next = idx < FALLBACK_ARTICLES.length - 1 ? { title: FALLBACK_ARTICLES[idx + 1].title, slug: FALLBACK_ARTICLES[idx + 1].slug } : null;

      return {
        article,
        related: related.length > 0 ? related : FALLBACK_ARTICLES.filter(a => a.id !== article.id).slice(0, 2),
        prev,
        next
      };
    }
  },

  async getCategories(): Promise<{ categories: Category[] }> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using bundled categories fallback:', err);
      return { categories: FALLBACK_CATEGORIES };
    }
  },

  async getCategory(slug: string): Promise<{ category: Category }> {
    try {
      const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(slug)}`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using bundled category detail fallback:', err);
      const cat = FALLBACK_CATEGORIES.find(c => c.slug === slug || c.id === slug) || FALLBACK_CATEGORIES[0];
      return { category: cat };
    }
  },

  async getTags(): Promise<{ tags: Tag[] }> {
    try {
      const res = await fetch(`${API_BASE}/tags`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using bundled tags fallback:', err);
      return { tags: FALLBACK_TAGS };
    }
  },

  async getTag(slug: string): Promise<{ tag: Tag }> {
    try {
      const res = await fetch(`${API_BASE}/tags/${encodeURIComponent(slug)}`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using bundled tag detail fallback:', err);
      const tag = FALLBACK_TAGS.find(t => t.slug === slug || t.id === slug) || FALLBACK_TAGS[0];
      return { tag };
    }
  },

  async getAuthors(): Promise<{ authors: Author[] }> {
    try {
      const res = await fetch(`${API_BASE}/authors`);
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using bundled authors fallback:', err);
      return {
        authors: [
          {
            id: 'author_elena_vance',
            name: 'Dr. Elena Vance',
            email: 'e.vance@apexchronicle.com',
            bio: 'Senior Technology Editor at Apex Chronicle.',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            role_title: 'Senior Technology Editor',
            twitter: 'elenavance_tech'
          },
          {
            id: 'author_marcus_reid',
            name: 'Marcus Reid',
            email: 'm.reid@apexchronicle.com',
            bio: 'Global economics reporter and former Wall Street researcher.',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            role_title: 'Chief Economics Correspondent',
            twitter: 'marcusreid_econ'
          }
        ]
      };
    }
  },

  async subscribeNewsletter(data: { name?: string; email: string }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using newsletter fallback response:', err);
      return {
        success: true,
        message: 'Thank you for subscribing to Apex Chronicle. Dispatches will be delivered to your inbox.'
      };
    }
  },

  async submitContact(data: { name: string; email: string; subject?: string; message: string }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await handleResponse(res);
    } catch (err) {
      console.warn('[API] Using contact fallback response:', err);
      return {
        success: true,
        message: 'Your dispatch inquiry has been received. Our editorial team will review it shortly.'
      };
    }
  },

  // --- Auth Endpoints ---
  async getAuthStatus(): Promise<{ initialAdminNeedsSetup: boolean; initialAdminEmail: string; isStaticDeployment?: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/auth/status`);
      return await handleResponse(res);
    } catch {
      return {
        initialAdminNeedsSetup: false,
        initialAdminEmail: 'myall5148@gmail.com',
        isStaticDeployment: true
      };
    }
  },

  async setupInitialAdmin(data: { email: string; password: string; confirmPassword?: string }): Promise<{
    success: boolean;
    user: AdminUser;
    token: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/setup-initial-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async register(data: { name: string; email: string; password: string; confirmPassword?: string }): Promise<{
    success: boolean;
    user: AdminUser;
    token: string;
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async login(data: { email: string; password: string }): Promise<{
    success: boolean;
    user: AdminUser;
    token: string;
    needsSetup?: boolean;
  }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async logout(): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: AdminUser }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getUserProfile(): Promise<{ user: AdminUser }> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async updateUserProfile(data: { name?: string; currentPassword?: string; newPassword?: string }): Promise<{
    success: boolean;
    message: string;
    user: AdminUser;
  }> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // --- Admin Endpoints ---
  async getAdminStats(): Promise<{
    stats: DashboardStats;
    recentArticles: any[];
    recentSubscribers: any[];
  }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getAdminArticles(params: {
    status?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ articles: Article[]; total: number }> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.offset) query.set('offset', params.offset.toString());

    const res = await fetch(`${API_BASE}/admin/articles?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getAdminArticle(id: string): Promise<{ article: Article }> {
    const res = await fetch(`${API_BASE}/admin/articles/${id}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createAdminArticle(data: any): Promise<{ success: boolean; id: string; slug: string }> {
    const res = await fetch(`${API_BASE}/admin/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateAdminArticle(id: string, data: any): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/admin/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async toggleAdminArticleStatus(id: string, status: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/articles/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async deleteAdminArticle(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/articles/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getAdminCategories(): Promise<{ categories: Category[] }> {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createAdminCategory(data: Partial<Category>): Promise<{ success: boolean; id: string }> {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async updateAdminCategory(id: string, data: Partial<Category>): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAdminCategory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getAdminTags(): Promise<{ tags: Tag[] }> {
    const res = await fetch(`${API_BASE}/admin/tags`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createAdminTag(data: { name: string; slug?: string }): Promise<{ success: boolean; id: string; tag: Tag }> {
    const res = await fetch(`${API_BASE}/admin/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAdminTag(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/tags/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getAdminMedia(): Promise<{ media: MediaItem[] }> {
    const res = await fetch(`${API_BASE}/admin/media`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async uploadAdminMedia(file: File, altText?: string): Promise<{ success: boolean; media: MediaItem }> {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('alt_text', altText);

    const res = await fetch(`${API_BASE}/admin/media/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse(res);
  },

  async deleteAdminMedia(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/media/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getAdminNewsletter(): Promise<{ subscribers: Subscriber[] }> {
    const res = await fetch(`${API_BASE}/admin/newsletter`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async deleteAdminSubscriber(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/newsletter/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getAdminAds(): Promise<{ ads: AdSlot[] }> {
    const res = await fetch(`${API_BASE}/admin/ads`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async updateAdminAd(id: string, data: Partial<AdSlot>): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/ads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getAdminSettings(): Promise<{ settings: SiteSettings }> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async updateAdminSettings(data: Partial<SiteSettings>): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async getAdminUsers(): Promise<{ users: AdminUser[] }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createAdminUser(data: { name: string; email: string; password: string; role?: string }): Promise<{ success: boolean; user: AdminUser }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async deleteAdminUser(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  }
};
