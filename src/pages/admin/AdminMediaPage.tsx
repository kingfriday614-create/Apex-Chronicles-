import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { MediaItem } from '../../types';
import { Upload, Copy, Check, Trash2, Image as ImageIcon } from 'lucide-react';

export const AdminMediaPage: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminMedia();
      setMedia(res.media);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await api.uploadAdminMedia(file, file.name);
      setMedia(prev => [res.media, ...prev]);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    const fullUrl = item.url.startsWith('http') ? item.url : `${window.location.origin}${item.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete image "${name}"?`)) return;

    try {
      await api.deleteAdminMedia(id);
      setMedia(prev => prev.filter(m => m.id !== id));
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            Media &amp; Asset Library
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Upload, inspect, and copy permanent URLs for editorial photography and illustrations.
          </p>
        </div>

        <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors shadow-sm cursor-pointer self-start sm:self-auto">
          <Upload className="w-4 h-4 text-amber-400" />
          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
          <p className="text-sm font-mono text-stone-500">Scanning media directory...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="border border-stone-200 bg-white p-12 rounded text-center space-y-3">
          <ImageIcon className="w-10 h-10 mx-auto text-stone-400" />
          <h3 className="font-editorial text-lg font-bold text-stone-800">No media uploaded</h3>
          <p className="text-xs text-stone-600 max-w-sm mx-auto">
            Upload images here to use across articles, hero slots, and category headers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-stone-200 rounded overflow-hidden shadow-xs group flex flex-col justify-between"
            >
              <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                <img
                  src={item.url}
                  alt={item.alt_text || item.original_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-2.5 text-xs font-sans space-y-1">
                <p className="font-medium text-stone-900 truncate" title={item.original_name}>
                  {item.original_name}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                  <span>{formatBytes(item.file_size)}</span>
                  <span>{item.mime_type.split('/')[1]?.toUpperCase()}</span>
                </div>

                <div className="pt-2 flex items-center justify-between gap-1 border-t border-stone-100">
                  <button
                    onClick={() => handleCopyUrl(item)}
                    className="flex-1 py-1 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.original_name)}
                    className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-rose-50 cursor-pointer"
                    title="Delete media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
