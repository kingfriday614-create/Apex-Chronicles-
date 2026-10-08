import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SiteSettings } from '../../types';
import { useSite } from '../../context/SiteContext';
import { Save, CheckCircle2, Globe, Settings as SettingsIcon } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { refreshSettings } = useSite();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAdminSettings()
      .then(res => setSettings(res.settings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    setSettings(prev => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      await api.updateAdminSettings(settings);
      await refreshSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono text-stone-500">Loading website configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-6 border-b border-stone-200">
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
          Publication Settings &amp; Brand Defaults
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
          General metadata, canonical domain endpoints, social channels, and search engine defaults.
        </p>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configuration saved successfully.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs font-sans">
        {/* General Identity */}
        <div className="bg-white border border-stone-200 p-6 rounded shadow-sm space-y-4">
          <h2 className="font-editorial text-base font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-stone-700" />
            <span>Brand Identity &amp; URL</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Publication Name
              </label>
              <input
                type="text"
                required
                value={settings.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Canonical Website URL
              </label>
              <input
                type="url"
                required
                value={settings.site_url}
                onChange={(e) => handleChange('site_url', e.target.value)}
                placeholder="https://apexchronicle.com"
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Publication Tagline / Description
            </label>
            <textarea
              rows={2}
              value={settings.site_description}
              onChange={(e) => handleChange('site_description', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Contact / Editorial Email
              </label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="editorial@apexchronicle.com"
                className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Analytics Measurement ID (GA4 or Plausible)
              </label>
              <input
                type="text"
                value={settings.analytics_id || ''}
                onChange={(e) => handleChange('analytics_id', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 border border-stone-300 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-stone-600"
              />
            </div>
          </div>
        </div>

        {/* SEO Defaults */}
        <div className="bg-white border border-stone-200 p-6 rounded shadow-sm space-y-4">
          <h2 className="font-editorial text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
            Default SEO &amp; Open Graph Meta
          </h2>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Default SEO Title
            </label>
            <input
              type="text"
              value={settings.default_seo_title || ''}
              onChange={(e) => handleChange('default_seo_title', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Default SEO Meta Description
            </label>
            <textarea
              rows={2}
              value={settings.default_seo_description || ''}
              onChange={(e) => handleChange('default_seo_description', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              Default Social Card Image URL (OG Image)
            </label>
            <input
              type="url"
              value={settings.default_share_image || ''}
              onChange={(e) => handleChange('default_share_image', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-1 focus:ring-stone-600 font-mono text-xs"
            />
          </div>
        </div>

        {/* Social Channels & Legal */}
        <div className="bg-white border border-stone-200 p-6 rounded shadow-sm space-y-4">
          <h2 className="font-editorial text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
            Social Channels &amp; Footer Copyright
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                X (Twitter) Profile URL
              </label>
              <input
                type="url"
                value={settings.social_twitter || ''}
                onChange={(e) => handleChange('social_twitter', e.target.value)}
                placeholder="https://x.com/apexchronicle"
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                LinkedIn Company URL
              </label>
              <input
                type="url"
                value={settings.social_linkedin || ''}
                onChange={(e) => handleChange('social_linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/apexchronicle"
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                value={settings.social_facebook || ''}
                onChange={(e) => handleChange('social_facebook', e.target.value)}
                placeholder="https://facebook.com/apexchronicle"
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                Footer Copyright Text
              </label>
              <input
                type="text"
                value={settings.footer_copyright || ''}
                onChange={(e) => handleChange('footer_copyright', e.target.value)}
                placeholder="© 2026 Apex Chronicle Media Group. All rights reserved."
                className="w-full px-3 py-2 border border-stone-300 rounded text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded font-semibold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
