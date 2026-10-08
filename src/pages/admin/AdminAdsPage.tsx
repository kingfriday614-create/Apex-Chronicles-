import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AdSlot } from '../../types';
import { useSite } from '../../context/SiteContext';
import { Megaphone, Save, CheckCircle2 } from 'lucide-react';

export const AdminAdsPage: React.FC = () => {
  const { refreshAds } = useSite();
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminAds();
      setAds(res.ads);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleUpdateField = (id: string, field: keyof AdSlot, value: any) => {
    setAds(prev => prev.map(a => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const handleSaveSlot = async (slot: AdSlot) => {
    try {
      setSavingKey(slot.id);
      await api.updateAdminAd(slot.id, {
        is_enabled: slot.is_enabled,
        ad_html: slot.ad_html,
        label: slot.label,
        display_target: slot.display_target
      });
      await refreshAds();
      setSavedKey(slot.id);
      setTimeout(() => setSavedKey(null), 2500);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-stone-200">
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-stone-900">
          Advertisement &amp; Sponsorship Placements
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
          Configure compliant ad slots across your digital publication. Insert Google AdSense tags, media network tags, or custom partner banners.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin mb-4" />
          <p className="text-sm font-mono text-stone-500">Loading placement matrix...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {ads.map((slot) => (
            <div
              key={slot.id}
              className={`bg-white border rounded shadow-sm p-5 space-y-4 transition-colors ${
                slot.is_enabled ? 'border-stone-200' : 'border-stone-200 bg-stone-50/60 opacity-80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${slot.is_enabled ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'}`}>
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-editorial text-base font-bold text-stone-900">
                      {slot.name}
                    </h2>
                    <span className="text-[11px] font-mono text-stone-500">
                      Slot identifier: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">{slot.slot_key}</code>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700 select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(slot.is_enabled)}
                      onChange={(e) => handleUpdateField(slot.id, 'is_enabled', e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    <span>{slot.is_enabled ? 'Slot Enabled' : 'Slot Disabled'}</span>
                  </label>

                  <button
                    onClick={() => handleSaveSlot(slot)}
                    disabled={savingKey === slot.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {savedKey === slot.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingKey === slot.id ? 'Saving...' : 'Save Slot'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Label Text (Displayed above banner)
                  </label>
                  <input
                    type="text"
                    value={slot.label || ''}
                    onChange={(e) => handleUpdateField(slot.id, 'label', e.target.value)}
                    placeholder="Advertisement, Sponsored, etc."
                    className="w-full px-3 py-1.5 border border-stone-300 rounded text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">
                    Device Targeting
                  </label>
                  <select
                    value={slot.display_target}
                    onChange={(e) => handleUpdateField(slot.id, 'display_target', e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded bg-white text-xs cursor-pointer"
                  >
                    <option value="all">Display on Both Desktop and Mobile</option>
                    <option value="desktop">Desktop Only (Hidden on mobile devices)</option>
                    <option value="mobile">Mobile Only (Hidden on desktop screens)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold text-xs mb-1">
                  Ad Code / HTML Snippet (Google AdSense script, responsive tag, or partner banner)
                </label>
                <textarea
                  rows={4}
                  value={slot.ad_html || ''}
                  onChange={(e) => handleUpdateField(slot.id, 'ad_html', e.target.value)}
                  placeholder="<!-- Paste your AdSense or network script tag here -->"
                  className="w-full p-2.5 font-mono text-xs border border-stone-300 rounded bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-600 text-stone-800 leading-relaxed"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
