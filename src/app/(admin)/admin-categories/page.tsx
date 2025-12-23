'use client';

import { useState, useMemo } from 'react';
import { useAdminRoute } from '@/features/auth/hooks/useAdminRoute';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '@/features/categories/hooks/useCategories';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@/features/categories/types/categoryTypes';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { generateSlug } from '@/shared/utils/slug';

export default function AdminCategoriesPage() {
  const { user, isLoading: authLoading } = useAdminRoute();
  const { data: categories, isLoading, isError, refetch } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: '',
    icon: null,
    color: null,
    slug: null,
    image: null,
    sort_order: null,
  });

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.slug?.toLowerCase().includes(query) ||
        c.icon?.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
        slug: category.slug,
        image: category.image,
        sort_order: category.sort_order,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        icon: null,
        color: null,
        slug: null,
        image: null,
        sort_order: null,
      });
    }
    setIsModalOpen(true);
  };

  // Auto-generate slug from name (only in create mode)
  useEffect(() => {
    if (!editingCategory && formData.name && isModalOpen) {
      const generatedSlug = generateSlug(formData.name);
      if (formData.slug !== generatedSlug) {
        setFormData((prev) => ({
          ...prev,
          slug: generatedSlug,
        }));
      }
    }
  }, [formData.name, formData.slug, editingCategory, isModalOpen]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: null,
      color: null,
      slug: null,
      image: null,
      sort_order: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          ...formData,
        });
      } else {
        await createCategory.mutateAsync(formData);
      }
      handleCloseModal();
    } catch {
      // Error is handled by the hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      try {
        await deleteCategory.mutateAsync(id);
      } catch {
        // Error is handled by the hook
      }
    }
  };

  // Loading state
  if (authLoading || !user) {
    return <LoadingScreen message="در حال بررسی دسترسی..." />;
  }

  if (isLoading) {
    return <LoadingScreen message="در حال بارگذاری دسته‌بندی‌ها..." />;
  }

  if (isError) {
    return <ErrorScreen onRetry={() => refetch()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Icon icon="solar:widget-4-bold-duotone" className="w-8 h-8 text-white" />
                <h1 className="text-2xl sm:text-3xl font-bold text-white">مدیریت دسته‌بندی‌ها</h1>
              </div>
              <p className="text-pink-100">مدیریت و سازماندهی دسته‌بندی‌های محصولات</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-white text-pink-600 px-6 py-3 rounded-xl font-bold hover:bg-pink-50 transition-all flex items-center gap-2 shadow-lg"
            >
              <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5" />
              افزودن دسته‌بندی
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">کل دسته‌بندی‌ها</p>
                <p className="text-2xl font-bold text-gray-900">{categories?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                <Icon icon="solar:widget-4-bold-duotone" className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">با آیکون</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories?.filter((c) => c.icon).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Icon icon="solar:star-bold-duotone" className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">با تصویر</p>
                <p className="text-2xl font-bold text-gray-900">
                  {categories?.filter((c) => c.image).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon icon="solar:gallery-bold-duotone" className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="relative">
            <Icon
              icon="solar:magnifer-bold-duotone"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            />
            <input
              type="text"
              placeholder="جستجو در دسته‌بندی‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          searchQuery ? (
            <NoSearchResults query={searchQuery} onClear={() => setSearchQuery('')} />
          ) : (
            <EmptyState onAdd={() => handleOpenModal()} />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={() => handleOpenModal(category)}
                onDelete={() => handleDelete(category.id)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <CategoryModal
            formData={formData}
            setFormData={setFormData}
            editingCategory={editingCategory}
            onSubmit={handleSubmit}
            onClose={handleCloseModal}
            isSubmitting={createCategory.isPending || updateCategory.isPending}
          />
        )}
      </div>
    </div>
  );
}

// Category Card Component
function CategoryCard({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{category.name}</h3>
          {category.slug && (
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-medium">Slug:</span> {category.slug}
            </p>
          )}
          {category.sort_order !== null && (
            <p className="text-sm text-gray-500">
              <span className="font-medium">ترتیب:</span> {category.sort_order}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="ویرایش"
          >
            <Icon icon="solar:pen-bold-duotone" className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="حذف"
          >
            <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        {category.image ? (
          <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden mb-2">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          </div>
        ) : category.icon && category.color ? (
          <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mx-auto`}>
            <Icon icon={category.icon} className="text-white w-8 h-8" />
          </div>
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto">
            <Icon icon="solar:widget-4-bold-duotone" className="text-gray-400 w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  );
}

// Category Modal Component
function CategoryModal({
  formData,
  setFormData,
  editingCategory,
  onSubmit,
  onClose,
  isSubmitting,
}: {
  formData: CreateCategoryPayload;
  setFormData: React.Dispatch<React.SetStateAction<CreateCategoryPayload>>;
  editingCategory: Category | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icon icon="solar:close-circle-bold-duotone" className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نام دسته‌بندی <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="مثال: رژ لب"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value || null })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="مثال: lipstick"
              disabled={!editingCategory && !!formData.name}
            />
            <p className="text-xs text-gray-500 mt-1">
              {!editingCategory && formData.name
                ? 'به صورت خودکار از نام تولید می‌شود'
                : 'برای URL استفاده می‌شود (اختیاری)'}
            </p>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">آیکون (Iconify)</label>
            <input
              type="text"
              value={formData.icon || ''}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value || null })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="مثال: mdi:lipstick"
            />
            <p className="text-xs text-gray-500 mt-1">نام آیکون از Iconify (اختیاری)</p>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رنگ (Tailwind Gradient)</label>
            <input
              type="text"
              value={formData.color || ''}
              onChange={(e) => setFormData({ ...formData, color: e.target.value || null })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="مثال: from-pink-400 to-rose-500"
            />
            <p className="text-xs text-gray-500 mt-1">کلاس‌های گرادیان Tailwind (اختیاری)</p>
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">آدرس تصویر</label>
            <input
              type="url"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value || null })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">URL تصویر دسته‌بندی (اختیاری)</p>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ترتیب نمایش</label>
            <input
              type="number"
              value={formData.sort_order ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">عدد کمتر = نمایش بالاتر (اختیاری)</p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'در حال ذخیره...' : editingCategory ? 'به‌روزرسانی' : 'ایجاد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Loading Screen Component
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Error Screen Component
function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="solar:danger-triangle-bold-duotone" className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">خطا در دریافت دسته‌بندی‌ها</h2>
        <p className="text-gray-500 mb-6">مشکلی در برقراری ارتباط با سرور پیش آمده است</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="solar:widget-4-bold-duotone" className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">هیچ دسته‌بندی‌ای وجود ندارد</h3>
        <p className="text-gray-500 mb-6">شروع کنید و اولین دسته‌بندی را ایجاد کنید</p>
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-medium hover:from-pink-700 hover:to-purple-700 transition-all"
        >
          افزودن دسته‌بندی
        </button>
      </div>
    </div>
  );
}

// No Search Results Component
function NoSearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon icon="solar:magnifer-bold-duotone" className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">نتیجه‌ای یافت نشد</h3>
        <p className="text-gray-500 mb-4">دسته‌بندی‌ای با عبارت «{query}» پیدا نشد</p>
        <button
          onClick={onClear}
          className="text-pink-600 hover:text-pink-700 font-medium"
        >
          پاک کردن جستجو
        </button>
      </div>
    </div>
  );
}

