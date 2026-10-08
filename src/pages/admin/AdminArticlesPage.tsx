import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Article, Category } from '../../types';
import {
  PlusCircle,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  FileText,
  Archive,
  RefreshCw
} from 'lucide-react';

interface AdminArticlesPageProps {
  onNavigateSection: (section: string) => void;
  onNavigatePublic: (path: string) => void;
}

export const AdminArticlesPage: React.FC<AdminArticlesPageProps> = ({
  onNavigateSection,
  onNavigatePublic
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const [artRes, catRes] = await Promise.all([
        api.getAdminArticles({
          status: statusFilter === 'all' ? undefined : statusFilter,
          category: categoryFilter === 'all' ? undefined : categoryFilter,
          search: searchTerm.trim() || undefined,
          limit: 50
        }),
        api.getAdminCategories()
      ]);

      setArticles(artRes.articles);
      setTotal(artRes.total);
      setCategories(catRes.categories);
    } catch (err) {
      console.error('Failed to load admin articles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticles();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await api.toggleAdminArticleStatus(id, nextStatus);
      setArticles(prev => prev.map(a => (a.id === id ? { ...a, status: nextStatus as any } : a)));
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteAdminArticle(id);
      setArticles(prev => prev.filter(a => a.id !== id));
      setTotal(t => t - 1);
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & New Article Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            Article Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Total {total} stories recorded across all editorial production stages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateSection('articles_new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Create Article</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white border border-stone-200 p-4 rounded shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or slug..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-600"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded border border-stone-300 cursor-pointer"
          >
            Filter
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-stone-300 text-xs px-2.5 py-1.5 rounded focus:outline-none text-stone-800 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-stone-300 text-xs px-2.5 py-1.5 rounded focus:outline-none text-stone-800 cursor-pointer"
          >
            <option value="all">All Desks</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={fetchArticles}
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded border border-stone-200"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-stone-200 rounded shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
            <p className="text-sm font-mono text-stone-500">Retrieving article registry...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <h3 className="font-editorial text-lg font-bold text-stone-800">No articles found</h3>
            <p className="text-xs text-stone-600 mb-4">No stories match your current filter settings.</p>
            <button
              onClick={() => onNavigateSection('articles_new')}
              className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded cursor-pointer"
            >
              Compose First Article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-mono text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Story Title</th>
                  <th className="py-3 px-3 font-medium">Desk</th>
                  <th className="py-3 px-3 font-medium">Author</th>
                  <th className="py-3 px-3 font-medium">Status</th>
                  <th className="py-3 px-3 font-medium text-right">Views</th>
                  <th className="py-3 px-3 font-medium">Published / Scheduled</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-stone-50 transition-colors">
                    {/* Title with thumbnail preview */}
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex items-center gap-3">
                        {art.featured_image ? (
                          <img
                            src={art.featured_image}
                            alt=""
                            className="w-12 h-8 rounded object-cover shrink-0 bg-stone-100 border border-stone-200"
                          />
                        ) : (
                          <div className="w-12 h-8 rounded bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center text-stone-400">
                            <FileText className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <button
                            onClick={() => onNavigateSection(`articles_edit_${art.id}`)}
                            className="font-editorial font-bold text-stone-900 text-sm hover:text-stone-700 truncate block text-left cursor-pointer"
                          >
                            {art.title}
                          </button>
                          <span className="text-[11px] font-mono text-stone-600 block truncate">
                            /article/{art.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Desk */}
                    <td className="py-3 px-3 text-stone-600 whitespace-nowrap font-mono text-[11px]">
                      {art.category_name || '—'}
                    </td>

                    {/* Author */}
                    <td className="py-3 px-3 text-stone-700 whitespace-nowrap">
                      {art.author_name || 'Editorial Staff'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(art.id, art.status)}
                        title="Click to toggle publish/draft"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold cursor-pointer ${
                          art.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                            : art.status === 'scheduled'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                            : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        {art.status === 'published' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {art.status === 'scheduled' && <Clock className="w-3 h-3 text-blue-600" />}
                        {art.status === 'draft' && <FileText className="w-3 h-3 text-stone-500" />}
                        <span>{art.status}</span>
                      </button>
                    </td>

                    {/* Views */}
                    <td className="py-3 px-3 text-right font-mono text-stone-600">
                      {art.views_count.toLocaleString()}
                    </td>

                    {/* Published Date */}
                    <td className="py-3 px-3 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                      {art.published_at ? new Date(art.published_at).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigateSection(`articles_edit_${art.id}`)}
                          className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer"
                          title="Edit article"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {art.status === 'published' && (
                          <button
                            onClick={() => onNavigatePublic(`/article/${art.slug}`)}
                            className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer"
                            title="View published story"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(art.id, art.title)}
                          className="p-1 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-50 cursor-pointer"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
