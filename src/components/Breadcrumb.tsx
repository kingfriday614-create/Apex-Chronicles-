import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`text-xs text-stone-500 font-mono ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5">
        <li>
          <button
            onClick={() => onNavigate('/')}
            className="hover:text-stone-900 transition-colors cursor-pointer"
          >
            Home
          </button>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-stone-400" aria-hidden="true" />
              {item.path && !isLast ? (
                <button
                  onClick={() => onNavigate(item.path!)}
                  className="hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-stone-800 font-semibold truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
