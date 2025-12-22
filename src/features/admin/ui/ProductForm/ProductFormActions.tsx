'use client';

import { Icon } from '@iconify/react';

interface ProductFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export function ProductFormActions({
  onCancel,
  isSubmitting,
  submitLabel = 'ذخیره محصول',
}: ProductFormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-4 pt-2 pb-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="px-8 py-3.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50"
      >
        <Icon icon="solar:close-circle-bold" className="w-5 h-5" />
        انصراف
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 text-white font-bold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
            در حال ذخیره...
          </>
        ) : (
          <>
            <Icon icon="solar:check-circle-bold" className="w-5 h-5" />
            {submitLabel}
          </>
        )}
      </button>
    </div>
  );
}

