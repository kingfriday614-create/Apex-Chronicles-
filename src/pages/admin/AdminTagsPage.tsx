import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Tag } from '../../types';
import { PlusCircle, Tag as TagIcon, Trash2, ExternalLink } from 'lucide-react';

interface AdminTagsPageProps {
  onNavigatePublic: (path: string) => void;
}

export const AdminTagsPage: React.FC<AdminTagsPageProps> = ({ onNavigatePublic }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminTags();
      setTags(res.tags);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleNameChange = (val: string) => {
    setTagName(val);
    setTagSlug(val.toLowerCase().replace(/[^\w-]/g, '').trim().replace(/\s+/g, '-'));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    try {
      setAdding(true);
      await api.createAdminTag({ name: tagName.trim(), slug: tagSlug.trim() });
      setTagName('');
      setTagSlug('');
      fetchTags();
    } catch (err: any) {
      alert(`Could not create tag: ${err.message}`);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the tag "#${name}"?`)) return;

    try {
      await api.deleteAdminTag(id);
      setTags(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-stone-200">
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
          Topic Tag Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
          Curate semantic tags to power internal cross-linking, search discovery, and topical feeds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Create Tag Card */}
        <div className="md:col-span-4 bg-white border border-stone-200 p-5 rounded shadow-sm">
          <h2 className="font-editorial text-base font-bold text-stone-900 mb-3 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-stone-700" />
            <span>Create New Tag</span>
          </h2>

          <form onSubmit={handleCreate} className="space-y-3 text-xs font-sans">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">Tag Name</label>
              <input
                type="text"
                required
                value={tagName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Semiconductors"
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">Slug</label>
              <input
                type="text"
                required
                value={tagSlug}
                onChange={(e) => setTagSlug(e.target.value)}
                placeholder="semiconductors"
                className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-stone-600"
              />
            </div>

            <button
              type="submit"
              disabled={adding}
              className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {adding ? 'Saving...' : 'Add Tag'}
            </button>
          </form>
        </div>

        {/* Existing Tags Table */}
        <div className="md:col-span-8 bg-white border border-stone-200 rounded shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
              <p className="text-sm font-mono text-stone-500">Retrieving tags...</p>
            </div>
          ) : tags.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-xs">
              No tags created yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-mono text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Tag</th>
                  <th className="py-3 px-3 font-medium">URL Route</th>
                  <th className="py-3 px-3 font-medium text-right">Articles</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {tags.map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-semibold text-stone-900 flex items-center gap-2">
                      <TagIcon className="w-3.5 h-3.5 text-stone-400" />
                      <span>#{t.name}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                      /tag/{t.slug}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-stone-600">
                      {t.article_count || 0}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onNavigatePublic(`/tag/${t.slug}`)}
                        className="text-stone-500 hover:text-stone-800"
                        title="View public tag page"
                      >
                        <ExternalLink className="w-3.5 h-3.5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id, t.name)}
                        className="text-rose-600 hover:text-rose-800"
                        title="Delete tag"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
