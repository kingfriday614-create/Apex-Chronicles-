import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Category, Tag, Author, Article } from '../../types';
import { RichEditor } from '../../components/RichEditor';
import { SeoPreview } from '../../components/SeoPreview';
import {
  Save,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Eye,
  X,
  Plus
} from 'lucide-react';

interface AdminArticleEditorPageProps {
  articleId?: string; // If provided, edit mode; else create mode
  onNavigateSection: (section: string) => void;
  onNavigatePublic: (path: string) => void;
}

export const AdminArticleEditorPage: React.FC<AdminArticleEditorPageProps> = ({
  articleId,
  onNavigateSection,
  onNavigatePublic
}) => {
  const isEditing = Boolean(articleId);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(!isEditing);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredImageAlt, setFeaturedImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled' | 'archived'>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [socialImage, setSocialImage] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Metadata catalogs
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // UI state
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaUploadOpen, setMediaUploadOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Auto-generate slug from title
  const generateSlug = (raw: string) => {
    return raw
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  useEffect(() => {
    // Load metadata catalogs
    Promise.all([
      api.getAdminCategories(),
      api.getAdminTags(),
      api.getAuthors()
    ]).then(([catRes, tagRes, authRes]) => {
      setCategories(catRes.categories);
      setAvailableTags(tagRes.tags);
      setAuthors(authRes.authors);
      if (!isEditing && authRes.authors.length > 0) {
        setAuthorId(authRes.authors[0].id);
      }
      if (!isEditing && catRes.categories.length > 0) {
        setCategoryId(catRes.categories[0].id);
      }
    }).catch(console.error);

    // If editing, load article details
    if (articleId) {
      setLoading(true);
      api.getAdminArticle(articleId)
        .then(({ article }) => {
          setTitle(article.title);
          setSlug(article.slug);
          setAutoSlug(false);
          setExcerpt(article.excerpt || '');
          setContent(article.content || '');
          setFeaturedImage(article.featured_image || '');
          setFeaturedImageAlt(article.featured_image_alt || '');
          setImageCaption(article.image_caption || '');
          setCategoryId(article.category_id || '');
          setAuthorId(article.author_id || '');
          setStatus(article.status || 'draft');
          setIsFeatured(Boolean(article.is_featured));
          setScheduledFor(article.scheduled_for ? article.scheduled_for.slice(0, 16) : '');
          setSeoTitle(article.seo_title || '');
          setSeoDescription(article.seo_description || '');
          setCanonicalUrl(article.canonical_url || '');
          setSocialImage(article.social_image || '');
          setSelectedTags((article.tags || []).map(t => t.id));
        })
        .catch((err) => {
          setErrorMessage(err.message || 'Failed to load article');
        })
        .finally(() => setLoading(false));
    }
  }, [articleId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      const generated = generateSlug(val);
      setSlug(generated);
    }
    if (!seoTitle || seoTitle.startsWith(title)) {
      setSeoTitle(val);
    }
  };

  const handleExcerptChange = (val: string) => {
    setExcerpt(val);
    if (!seoDescription || seoDescription.startsWith(excerpt)) {
      setSeoDescription(val.slice(0, 160));
    }
  };

  const handleCreateTag = async () => {
    if (!newTagInput.trim()) return;
    try {
      const res = await api.createAdminTag({ name: newTagInput.trim() });
      setAvailableTags(prev => [...prev, res.tag]);
      setSelectedTags(prev => [...prev, res.tag.id]);
      setNewTagInput('');
    } catch (err: any) {
      alert(`Could not create tag: ${err.message}`);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(true);
      const res = await api.uploadAdminMedia(file, featuredImageAlt || title);
      setFeaturedImage(res.media.url);
      if (!featuredImageAlt) setFeaturedImageAlt(res.media.original_name);
      setMediaUploadOpen(false);
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async (targetStatus?: 'draft' | 'published' | 'scheduled') => {
    const finalStatus = targetStatus || status;

    if (!title.trim() || !content.trim()) {
      setErrorMessage('Article headline and content body are required.');
      return;
    }

    if (finalStatus === 'scheduled' && !scheduledFor) {
      setErrorMessage('Please select a scheduled date and time.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const payload = {
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        excerpt: excerpt.trim() || title.trim(),
        content,
        featured_image: featuredImage.trim() || null,
        featured_image_alt: featuredImageAlt.trim() || title.trim(),
        image_caption: imageCaption.trim() || null,
        category_id: categoryId || null,
        author_id: authorId || null,
        status: finalStatus,
        is_featured: isFeatured ? 1 : 0,
        scheduled_for: finalStatus === 'scheduled' ? new Date(scheduledFor).toISOString() : null,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        canonical_url: canonicalUrl.trim() || null,
        social_image: socialImage.trim() || null,
        tags: selectedTags
      };

      if (isEditing && articleId) {
        await api.updateAdminArticle(articleId, payload);
        setStatus(finalStatus);
        setStatusMessage('Article successfully updated.');
      } else {
        const res = await api.createAdminArticle(payload);
        setStatus(finalStatus);
        setStatusMessage('Article created successfully!');
        // Transition to edit view
        setTimeout(() => {
          onNavigateSection(`articles_edit_${res.id}`);
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-stone-500">Loading article composition buffer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateSection('articles')}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded cursor-pointer"
            title="Back to articles list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
              {isEditing ? 'Edit Dispatch' : 'New Article'}
            </h1>
            <p className="text-xs text-stone-500 font-mono">
              Status: <span className="uppercase font-semibold text-stone-800">{status}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {slug && (
            <button
              type="button"
              onClick={() => onNavigatePublic(`/article/${slug}`)}
              className="px-3 py-2 bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-stone-500" />
              <span>Preview</span>
            </button>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saving ? 'Publishing...' : 'Publish Now'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-center gap-2 font-medium">
          <X className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Two-Column Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Article Title */}
          <div className="bg-white border border-stone-200 p-5 rounded shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-stone-600 mb-1">
                Headline / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 10 Ways to Save Money Every Month"
                className="w-full px-3 py-2 text-lg sm:text-xl font-editorial font-bold border border-stone-300 rounded focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-900 placeholder:text-stone-300"
              />
            </div>

            {/* Slug row with auto-generation toggle */}
            <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-stone-500 font-mono flex-1">
                <span className="shrink-0 text-stone-400">/article/</span>
                <input
                  type="text"
                  value={slug}
                  disabled={autoSlug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-slug"
                  className={`px-2 py-1 border border-stone-200 rounded font-mono text-xs text-stone-800 w-full max-w-sm ${
                    autoSlug ? 'bg-stone-50 text-stone-500' : 'bg-white'
                  }`}
                />
              </div>

              <label className="flex items-center gap-1.5 text-stone-600 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={(e) => {
                    setAutoSlug(e.target.checked);
                    if (e.target.checked) setSlug(generateSlug(title));
                  }}
                  className="rounded border-stone-300"
                />
                <span>Auto-sync with headline</span>
              </label>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white border border-stone-200 p-5 rounded shadow-sm">
            <label className="block text-xs font-semibold uppercase font-mono text-stone-600 mb-1">
              Article Excerpt / Deck
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => handleExcerptChange(e.target.value)}
              placeholder="A concise summary of the findings or narrative, displayed in card feeds and article headers..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-800"
            />
          </div>

          {/* Rich Content Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase font-mono text-stone-600">
                Body Narrative <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-stone-500">
                Markdown &amp; Semantic HTML
              </span>
            </div>
            <RichEditor
              value={content}
              onChange={setContent}
              onOpenMediaModal={() => setMediaUploadOpen(true)}
            />
          </div>

          {/* SEO & Search Engine Optimization Panel */}
          <div className="bg-white border border-stone-200 p-6 rounded shadow-sm space-y-4">
            <div className="border-b border-stone-100 pb-2">
              <h3 className="font-editorial text-lg font-bold text-stone-900">
                Search Engine Optimization &amp; Social Metadata
              </h3>
              <p className="text-xs text-stone-500">
                Configure meta descriptions, canonical URLs, and preview search snippets.
              </p>
            </div>

            {/* Google Result Live Preview */}
            <SeoPreview
              title={seoTitle || title}
              slug={slug}
              description={seoDescription || excerpt}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Custom SEO Title ({seoTitle.length}/60)
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to article headline"
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Canonical URL (Optional)
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>
            </div>

            <div className="text-xs font-sans">
              <label className="block text-stone-700 font-semibold mb-1">
                Custom SEO Meta Description ({seoDescription.length}/160)
              </label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Recommended 140-160 characters for maximum search engine snippet visibility..."
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Controls (Publishing, Category, Tags, Media) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Settings Box */}
          <div className="bg-white border border-stone-200 p-5 rounded shadow-sm space-y-4 text-xs">
            <h3 className="font-editorial text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
              Publication Settings
            </h3>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-300 rounded bg-white text-stone-800 cursor-pointer"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published (Public)</option>
                <option value="scheduled">Scheduled for Release</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {status === 'scheduled' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded space-y-1.5">
                <label className="block font-semibold text-blue-900 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Release Date &amp; Time</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white border border-blue-300 rounded text-stone-800"
                />
                <p className="text-[10px] text-blue-700">
                  Article automatically turns public when scheduled timestamp arrives.
                </p>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-800 pt-1">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded border-stone-300"
                />
                <span>Pin as Cover / Featured Story</span>
              </label>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Editorial Desk</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded bg-white text-stone-800 cursor-pointer"
              >
                <option value="">Unassigned Desk</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Bylined Author</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded bg-white text-stone-800 cursor-pointer"
              >
                <option value="">Editorial Staff</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.role_title || 'Writer'})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Image Box */}
          <div className="bg-white border border-stone-200 p-5 rounded shadow-sm space-y-3 text-xs">
            <h3 className="font-editorial text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
              Featured Image
            </h3>

            {featuredImage ? (
              <div className="space-y-2">
                <div className="relative rounded overflow-hidden aspect-[16/10] bg-stone-100 border border-stone-200">
                  <img src={featuredImage} alt={featuredImageAlt} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    className="absolute top-2 right-2 p-1 bg-stone-900/80 text-white rounded-full hover:bg-stone-900 cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <label className="block text-stone-600 mb-0.5">Image Alt Text (SEO)</label>
                  <input
                    type="text"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                    placeholder="Descriptive image alt text"
                    className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-0.5">Image Caption</label>
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="Editorial photo credit or caption"
                    className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-stone-300 p-6 rounded text-center space-y-2 bg-stone-50">
                  <ImageIcon className="w-8 h-8 mx-auto text-stone-400" />
                  <p className="text-stone-600">Select or upload a high-resolution hero photo</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded cursor-pointer hover:bg-stone-800">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-stone-600 mb-0.5">Or enter Image URL</label>
                  <input
                    type="url"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Topic Tags Box */}
          <div className="bg-white border border-stone-200 p-5 rounded shadow-sm space-y-3 text-xs">
            <h3 className="font-editorial text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
              Topic Tags
            </h3>

            {/* Quick add tag */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="New topic tag..."
                className="flex-1 px-2 py-1.5 border border-stone-300 rounded text-xs"
              />
              <button
                type="button"
                onClick={handleCreateTag}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded border border-stone-300 cursor-pointer font-medium"
              >
                Add
              </button>
            </div>

            {/* Tag selector */}
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pt-1">
              {availableTags.map((t) => {
                const isSelected = selectedTags.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`px-2 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-stone-900 text-white font-semibold'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
