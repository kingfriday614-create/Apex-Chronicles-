import React from 'react';

interface SeoPreviewProps {
  title: string;
  slug: string;
  description: string;
  baseUrl?: string;
}

export const SeoPreview: React.FC<SeoPreviewProps> = ({
  title,
  slug,
  description,
  baseUrl = 'https://apexchronicle.com'
}) => {
  const displayTitle = title || 'Article Title Placeholder';
  const displaySlug = slug || 'article-slug';
  const displayDesc = description || 'This is how your article description will appear in Google search engine results snippets.';

  return (
    <div className="border border-stone-200 bg-white rounded p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
          Google Search Result Preview
        </span>
        <span className="text-[11px] text-stone-600 font-mono">
          Title: {title.length}/60 · Desc: {description.length}/160
        </span>
      </div>

      <div className="space-y-1 font-sans">
        {/* Google URL breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-stone-600 truncate">
          <span className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-bold text-stone-700">A</span>
          <span className="text-stone-800 font-medium">{baseUrl.replace(/^https?:\/\//, '')}</span>
          <span>›</span>
          <span className="text-stone-500 truncate">article › {displaySlug}</span>
        </div>

        {/* Google Headline link */}
        <h4 className="text-blue-800 hover:underline text-base sm:text-lg font-medium leading-snug cursor-pointer line-clamp-1">
          {displayTitle}
        </h4>

        {/* Google Snippet Description */}
        <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
          {displayDesc}
        </p>
      </div>
    </div>
  );
};
