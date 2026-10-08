import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Subscriber } from '../../types';
import { Download, Search, Trash2, Mail, CheckCircle2 } from 'lucide-react';

export const AdminNewsletterPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubs = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminNewsletter();
      setSubscribers(res.subscribers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  const handleExportCsv = () => {
    window.open('/api/admin/newsletter/export', '_blank');
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove subscriber "${email}"?`)) return;

    try {
      await api.deleteAdminSubscriber(id);
      setSubscribers(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            Newsletter Subscribers
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Total {subscribers.length} verified audience members subscribed to morning briefs.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export to CSV</span>
        </button>
      </div>

      <div className="bg-white border border-stone-200 p-4 rounded shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subscribers by email or name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-600"
          />
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
            <p className="text-sm font-mono text-stone-500">Retrieving subscriber database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-stone-500 text-xs">
            <Mail className="w-8 h-8 mx-auto text-stone-400 mb-2" />
            <p>No subscribers matching search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 font-mono text-stone-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-medium">Email Address</th>
                  <th className="py-3 px-3 font-medium">Name</th>
                  <th className="py-3 px-3 font-medium">Status</th>
                  <th className="py-3 px-3 font-medium">Date Subscribed</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-stone-50">
                    <td className="py-3 px-4 font-semibold text-stone-900 font-mono">
                      {sub.email}
                    </td>
                    <td className="py-3 px-3 text-stone-700">
                      {sub.name || '—'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-mono text-[11px] font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>active</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                      {new Date(sub.subscribed_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(sub.id, sub.email)}
                        className="text-stone-400 hover:text-rose-600 p-1 rounded"
                        title="Delete subscriber"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
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
