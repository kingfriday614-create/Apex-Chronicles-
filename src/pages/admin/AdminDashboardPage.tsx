import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';
import { formatArticleDate } from '../../utils/date';
import {
  FileText,
  CheckCircle2,
  Clock,
  FileEdit,
  FolderTree,
  Users,
  Eye,
  PlusCircle,
  ExternalLink,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateSection: (section: string) => void;
  onNavigatePublic: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateSection,
  onNavigatePublic
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [recentSubscribers, setRecentSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminStats();
      setStats(res.stats);
      setRecentArticles(res.recentArticles || []);
      setRecentSubscribers(res.recentSubscribers || []);
    } catch (err: any) {
      console.error('Failed to load admin stats', err);
      setError(err?.message || 'Failed to load editorial metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-stone-500">Compiling editorial metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="py-16 text-center max-w-md mx-auto px-4">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 space-y-3">
          <p className="text-sm font-medium text-rose-800 font-sans">
            {error || 'Unable to load dashboard metrics at this time.'}
          </p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Retry Loading Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
            Publishing Overview
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Real-time status of publication inventory, editorial drafts, and audience subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateSection('articles_new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Articles */}
        <div className="bg-white border border-stone-200 p-4 sm:p-5 rounded shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Total Articles</span>
            <FileText className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">
            {stats.totalArticles}
          </div>
          <div className="mt-2 text-[11px] text-stone-500 flex items-center gap-2">
            <span className="text-emerald-700 font-medium">{stats.publishedArticles} published</span>
            <span>·</span>
            <span className="text-amber-700 font-medium">{stats.draftArticles} drafts</span>
          </div>
        </div>

        {/* Scheduled / Drafts */}
        <div className="bg-white border border-stone-200 p-4 sm:p-5 rounded shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Scheduled Queue</span>
            <Clock className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">
            {stats.scheduledArticles}
          </div>
          <div className="mt-2 text-[11px] text-stone-500">
            Auto-published on target date
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border border-stone-200 p-4 sm:p-5 rounded shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Editorial Desks</span>
            <FolderTree className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">
            {stats.totalCategories}
          </div>
          <div className="mt-2 text-[11px] text-stone-500">
            Across {stats.totalTags} subject tags
          </div>
        </div>

        {/* Newsletter Subscribers */}
        <div className="bg-white border border-stone-200 p-4 sm:p-5 rounded shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Subscribers</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 font-mono">
            {stats.totalSubscribers}
          </div>
          <div className="mt-2 text-[11px] text-stone-500">
            Active morning dispatch readers
          </div>
        </div>
      </div>

      {/* Traffic & Audience Engagement Analytics Area */}
      <div className="bg-white border border-stone-200 p-6 rounded shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-stone-700" />
            <h2 className="font-editorial text-lg font-bold text-stone-900">
              Traffic &amp; Reader Engagement Trends
            </h2>
          </div>
          <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            Total Reads: {stats.totalViews.toLocaleString()}
          </span>
        </div>

        <p className="text-xs text-stone-600">
          Showing 7-day cumulative reading metrics. Connect Google Analytics or Plausible in Settings for live external telemetry.
        </p>

        {/* Responsive visualization bars */}
        <div className="grid grid-cols-7 gap-2 pt-4 items-end h-36 border-b border-stone-100 pb-2">
          {[
            { day: 'Mon', val: 65 },
            { day: 'Tue', val: 82 },
            { day: 'Wed', val: 74 },
            { day: 'Thu', val: 95 },
            { day: 'Fri', val: 88 },
            { day: 'Sat', val: 54 },
            { day: 'Sun', val: 78 }
          ].map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
              <div
                className="w-full max-w-[40px] bg-stone-800 rounded-t group-hover:bg-amber-600 transition-colors"
                style={{ height: `${bar.val}%` }}
              />
              <span className="text-[10px] font-mono text-stone-500">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout: Recent Articles & Recent Subscribers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Articles */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="font-editorial text-lg font-bold text-stone-900">
              Recent Dispatches
            </h2>
            <button
              onClick={() => onNavigateSection('articles')}
              className="text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-stone-500 font-mono uppercase tracking-wider border-b border-stone-100">
                  <th className="pb-2 font-medium">Title</th>
                  <th className="pb-2 font-medium">Desk</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Views</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {recentArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-stone-50">
                    <td className="py-2.5 pr-2 font-medium text-stone-900 max-w-xs truncate">
                      {art.title}
                    </td>
                    <td className="py-2.5 text-stone-600 font-mono">
                      {art.category_name || 'General'}
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${
                        art.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : art.status === 'scheduled'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {art.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono text-stone-600">
                      {art.views_count}
                    </td>
                    <td className="py-2.5 text-right space-x-2">
                      <button
                        onClick={() => onNavigateSection(`articles_edit_${art.id}`)}
                        className="text-stone-700 hover:text-stone-900 font-medium underline underline-offset-2 cursor-pointer"
                      >
                        Edit
                      </button>
                      {art.status === 'published' && (
                        <button
                          onClick={() => onNavigatePublic(`/article/${art.slug}`)}
                          className="text-stone-500 hover:text-stone-800 cursor-pointer"
                          title="Open published article"
                        >
                          <ExternalLink className="w-3.5 h-3.5 inline" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Subscribers */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="font-editorial text-lg font-bold text-stone-900">
              New Subscribers
            </h2>
            <button
              onClick={() => onNavigateSection('newsletter')}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Export
            </button>
          </div>

          {recentSubscribers.length === 0 ? (
            <p className="text-xs text-stone-500 italic py-4">No subscribers registered yet.</p>
          ) : (
            <ul className="divide-y divide-stone-100 text-xs">
              {recentSubscribers.map((sub) => (
                <li key={sub.id} className="py-2 flex items-center justify-between">
                  <div className="truncate max-w-[160px]">
                    <span className="font-medium text-stone-800 block truncate">{sub.email}</span>
                    {sub.name && <span className="text-[11px] text-stone-500">{sub.name}</span>}
                  </div>
                  <time className="text-[10px] font-mono text-stone-600 shrink-0">
                    {formatArticleDate(sub.subscribed_at)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
