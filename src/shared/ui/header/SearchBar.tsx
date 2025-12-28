"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';

interface SearchBarProps {
  mobile?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

export function SearchBar({
  mobile = false,
  autoFocus = false,
  placeholder = 'جستجوی محصولات، برندها...',
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const popularSearches = ['رژ لب مات', 'کرم پودر', 'ماسکارا', 'عطر زنانه', 'پالت سایه'];

  return (
    <div className={`relative ${mobile ? 'w-full' : 'flex-1 max-w-2xl'}`}>
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full ${
            mobile ? 'px-4 py-2.5 pr-10 text-sm' : 'px-5 py-3 pr-12 text-sm'
          } rounded-xl bg-muted border border-border focus:border-primary-300 focus:bg-card focus:ring-4 focus:ring-primary-50 transition-all outline-none`}
        />
        <Icon
          icon="ph:magnifying-glass-duotone"
          className={`absolute ${
            mobile ? 'right-3 top-1/2' : 'right-4 top-1/2'
          } -translate-y-1/2 text-muted-foreground`}
          width={mobile ? 18 : 20}
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <Icon icon="ph:x" width={16} />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && !searchValue && (
        <div className="absolute top-full mt-2 w-full bg-card rounded-xl shadow-2xl border border-border p-3 z-50">
          <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">
            جستجوهای پرطرفدار
          </p>
          <div className="space-y-1">
            {popularSearches.map((term, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted rounded-lg transition-colors text-sm text-right"
              >
                <Icon icon="ph:trend-up-duotone" width={16} className="text-primary-500" />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

