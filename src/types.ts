export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  sort_order?: number;
  article_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  article_count?: number;
}

export interface Author {
  id: string;
  name: string;
  email?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  role_title?: string | null;
  twitter?: string | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string | null;
  featured_image_alt?: string | null;
  image_caption?: string | null;
  author_id?: string | null;
  author_name?: string | null;
  author_avatar?: string | null;
  author_role?: string | null;
  author_bio?: string | null;
  author_twitter?: string | null;
  category_id?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  is_featured: number | boolean;
  published_at?: string | null;
  scheduled_for?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  social_image?: string | null;
  views_count: number;
  tags?: Tag[];
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  url: string;
  alt_text?: string;
  created_at: string;
}

export interface Subscriber {
  id: string;
  name?: string | null;
  email: string;
  status: string;
  subscribed_at: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_description: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  site_url: string;
  default_seo_title?: string | null;
  default_seo_description?: string | null;
  social_facebook?: string | null;
  social_twitter?: string | null;
  social_instagram?: string | null;
  social_linkedin?: string | null;
  social_youtube?: string | null;
  default_share_image?: string | null;
  footer_copyright?: string | null;
  contact_email?: string | null;
  analytics_id?: string | null;
  updated_at?: string;
}

export interface AdSlot {
  id: string;
  slot_key: string;
  name: string;
  description?: string;
  is_enabled: number | boolean;
  ad_html?: string | null;
  label?: string | null;
  display_target: 'all' | 'desktop' | 'mobile';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'editor' | 'user';
  is_initial_admin: number;
  created_at: string;
  updated_at?: string;
}

export type AppUser = AdminUser;

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  scheduledArticles: number;
  totalCategories: number;
  totalTags: number;
  totalSubscribers: number;
  totalViews: number;
}
