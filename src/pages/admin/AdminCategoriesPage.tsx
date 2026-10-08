import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Category } from '../../types';
import { PlusCircle, Edit, Trash2, FolderTree, X, Check, ExternalLink } from 'lucide-react';
import { useSite } from '../../context/SiteContext';

interface AdminCategoriesPageProps {
  onNavigatePublic: (path: string) => void;
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({ onNavigatePublic }) => {
  const { refreshCategories } = useSite();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCats = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminCategories();
      setCategories(res.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setSortOrder(categories.length + 1);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setSortOrder(cat.sort_order || 0);
    setError(null);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^\w-]/g, '').trim().replace(/\s+/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      setError(null);

      const payload = {
        name: name.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        sort_order: Number(sortOrder) || 0
      };

      if (editingCategory) {
        await api.updateAdminCategory(editingCategory.id, payload);
      } else {
        await api.createAdminCategory(payload);
      }

      await fetchCats();
      await refreshCategories();
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the "${name}" desk? Articles in this category will become unassigned.`)) {
      return;
    }

    try {
      await api.deleteAdminCategory(id);
      await fetchCats();
      await refreshCategories();
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Organize editorial desks, section headers, topics, and navigational hierarchies.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid Table */}
      <div className="bg-white border border-stone-200 rounded shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
            <p className="text-sm font-mono text-stone-500">Retrieving categories...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-mono text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Desk Name</th>
                  <th className="py-3 px-3 font-medium">Slug</th>
                  <th className="py-3 px-3 font-medium">Description</th>
                  <th className="py-3 px-3 font-medium text-right">Published Articles</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-semibold text-stone-900 flex items-center gap-2.5">
                      <FolderTree className="w-4 h-4 text-stone-400 shrink-0" />
                      <span>{cat.name}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-500">
                      /category/{cat.slug}
                    </td>
                    <td className="py-3 px-3 text-stone-600 max-w-sm truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-stone-700">
                      {cat.article_count || 0}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigatePublic(`/category/${cat.slug}`)}
                          className="p-1 text-stone-500 hover:text-stone-800 rounded hover:bg-stone-100 cursor-pointer"
                          title="View public category page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer"
                          title="Edit desk"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1 text-rose-600 hover:text-rose-800 rounded hover:bg-rose-50 cursor-pointer"
                          title="Delete desk"
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-editorial text-lg font-bold text-stone-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Desk Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Technology"
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. technology"
                  className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief synopsis of topics covered in this desk..."
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Desk Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Menu Display Order
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-stone-900 text-white rounded font-semibold hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Desk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
