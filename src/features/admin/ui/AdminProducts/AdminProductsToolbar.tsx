'use client';

import { AdminProductsSearch } from './AdminProductsSearch';
import { AdminProductsViewToggle, ViewMode } from './AdminProductsViewToggle';

interface AdminProductsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function AdminProductsToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: AdminProductsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
      <AdminProductsSearch value={searchQuery} onChange={onSearchChange} />
      
      <div className="flex items-center gap-3 justify-end">
        <AdminProductsViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>
    </div>
  );
}

