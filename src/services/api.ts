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

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('apex_auth_token');
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
      // Body is not JSON
    }
  }

  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    if (data && typeof data === 'object' && data.error) {
      errMsg = data.error;
    } else if (text && text.length < 500) {
      errMsg = text;
    }
    throw new Error(errMsg);
  }

  return (data !== null ? data : (text as unknown)) as T;
}

export const api = {
  // --- Public Endpoints ---
  async getSettings(): Promise<{ settings: SiteSettings }> {
    const res = await fetch(`${API_BASE}/site/settings`);
    return handleResponse(res);
  },

  async getAds(): Promise<{ ads: AdSlot[] }> {
    const res = await fetch(`${API_BASE}/site/ads`);
    return handleResponse(res);
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
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.tag) query.set('tag', params.tag);
    if (params.search) query.set('search', params.search);
    if (params.featured) query.set('featured', params.featured);
    if (params.limit !== undefined) query.set('limit', params.limit.toString());
    if (params.offset !== undefined) query.set('offset', params.offset.toString());
    if (params.sort) query.set('sort', params.sort);

    const res = await fetch(`${API_BASE}/articles?${query.toString()}`);
    return handleResponse(res);
  },

  async getArticleBySlug(slug: string): Promise<{
    article: Article;
    related: Article[];
    prev?: { title: string; slug: string } | null;
    next?: { title: string; slug: string } | null;
  }> {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(slug)}`);
    return handleResponse(res);
  },

  async getCategories(): Promise<{ categories: Category[] }> {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse(res);
  },

  async getCategory(slug: string): Promise<{ category: Category }> {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(slug)}`);
    return handleResponse(res);
  },

  async getTags(): Promise<{ tags: Tag[] }> {
    const res = await fetch(`${API_BASE}/tags`);
    return handleResponse(res);
  },

  async getTag(slug: string): Promise<{ tag: Tag }> {
    const res = await fetch(`${API_BASE}/tags/${encodeURIComponent(slug)}`);
    return handleResponse(res);
  },

  async getAuthors(): Promise<{ authors: Author[] }> {
    const res = await fetch(`${API_BASE}/authors`);
    return handleResponse(res);
  },

  async subscribeNewsletter(data: { name?: string; email: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async submitContact(data: { name: string; email: string; subject?: string; message: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // --- Auth Endpoints ---
  async getAuthStatus(): Promise<{ initialAdminNeedsSetup: boolean; initialAdminEmail: string }> {
    const res = await fetch(`${API_BASE}/auth/status`);
    return handleResponse(res);
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
