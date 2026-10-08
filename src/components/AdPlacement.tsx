import React from 'react';
import { useSite } from '../context/SiteContext';

interface AdPlacementProps {
  slotKey: string;
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ slotKey, className = '' }) => {
  const { ads } = useSite();
  const ad = ads[slotKey];

  if (!ad || !ad.is_enabled || !ad.ad_html) {
    return null;
  }

  // Device targeting classes
  let visibilityClass = 'block';
  if (ad.display_target === 'desktop') {
    visibilityClass = 'hidden md:block';
  } else if (ad.display_target === 'mobile') {
    visibilityClass = 'block md:hidden';
  }

  return (
    <aside
      aria-label={ad.label || 'Advertisement'}
      className={`my-6 text-center ${visibilityClass} ${className}`}
    >
      <div className="inline-block w-full max-w-4xl mx-auto">
        <span className="block text-[10px] uppercase tracking-widest text-stone-600 mb-1 font-mono">
          {ad.label || 'Advertisement'}
        </span>
        <div
          className="overflow-hidden"
          dangerouslySetInnerHTML={{ __html: ad.ad_html }}
        />
      </div>
    </aside>
  );
};
