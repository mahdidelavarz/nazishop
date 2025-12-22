'use client';

import { Icon } from '@iconify/react';

export type ViewMode = 'grid' | 'table';

interface AdminProductsViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function AdminProductsViewToggle({ viewMode, onViewModeChange }: AdminProductsViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
      <button
        onClick={() => onViewModeChange('grid')}
        className={`p-2 rounded-lg transition-all ${
          viewMode === 'grid'
            ? 'bg-white text-pink-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="نمای کارتی"
      >
        <Icon icon="solar:widget-bold-duotone" className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewModeChange('table')}
        className={`p-2 rounded-lg transition-all ${
          viewMode === 'table'
            ? 'bg-white text-pink-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        title="نمای جدولی"
      >
        <Icon icon="solar:list-bold-duotone" className="w-5 h-5" />
      </button>
    </div>
  );
}

