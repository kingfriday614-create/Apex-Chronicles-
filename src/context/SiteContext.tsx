import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, Category, AdSlot } from '../types';
import { api } from '../services/api';

interface SiteContextType {
  settings: SiteSettings | null;
  categories: Category[];
  ads: Record<string, AdSlot>;
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  refreshAds: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Record<string, AdSlot>>({});
  const [isLoading, setIsLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data.settings);
    } catch (err) {
      console.error('Failed to load site settings', err);
    }
  };

  const refreshCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data.categories);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const refreshAds = async () => {
    try {
      const data = await api.getAds();
      const mapped: Record<string, AdSlot> = {};
      for (const ad of data.ads) {
        mapped[ad.slot_key] = ad;
      }
      setAds(mapped);
    } catch (err) {
      console.error('Failed to load ads', err);
    }
  };

  useEffect(() => {
    Promise.all([refreshSettings(), refreshCategories(), refreshAds()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <SiteContext.Provider
      value={{
        settings,
        categories,
        ads,
        isLoading,
        refreshSettings,
        refreshCategories,
        refreshAds
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used within a SiteProvider');
  return ctx;
}
