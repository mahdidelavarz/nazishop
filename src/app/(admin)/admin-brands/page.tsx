'use client';

import { useState, useMemo } from 'react';
import { useAdminRoute } from '@/features/auth/hooks/useAdminRoute';
import {
  useAdminBrands,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from '@/features/brands/hooks/useBrands';
import { useBrandUpload } from '@/features/brands/hooks/useBrandUpload';
import { Brand, CreateBrandPayload, UpdateBrandPayload } from '@/features/brands/types/brandTypes';
import { Icon } from '@iconify/react';
import Link from 'next/link';
import { useEffect } from 'react';
import { generateSlug } from '@/shared/utils/slug';

export default function AdminBrandsPage() {
  const { user, isLoading: authLoading } = useAdminRoute();
  const { data: brands, isLoading, isError, refetch } = useAdminBrands();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();
  const uploadHook = useBrandUpload();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<CreateBrandPayload>({
    name: '',
    logo: null,
    slug: null,
    sort_order: null,
  });

  // Filter brands by search query
  const filteredBrands = useMemo(() => {
    if (!brands) return [];
    if (!searchQuery.trim()) return brands;

    const query = searchQuery.toLowerCase();
    return brands.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.slug?.toLowerCase().includes(query)
    );
  }, [brands, searchQuery]);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        logo: brand.logo,
        slug: brand.slug,
        sort_order: brand.sort_order,
      });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        logo: null,
        slug: null,
        sort_order: null,
      });
    }
    setIsModalOpen(true);
  };

  // Auto-generate slug from name (only in create mode)
  useEffect(() => {
    if (!editingBrand && formData.name && isModalOpen) {
      const generatedSlug = generateSlug(formData.name);
      if (formData.slug !== generatedSlug) {
        setFormData((prev) => ({
          ...prev,
          slug: generatedSlug,
        }));
      }
    }
  }, [formData.name, formData.slug, editingBrand, isModalOpen]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    uploadHook.clearImage();
    setFormData({
      name: '',
      logo: null,
      slug: null,
      sort_order: null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let logoUrl = formData.logo;
      
      // Upload image if there's a preview
      if (uploadHook.preview) {
        logoUrl = await uploadHook.uploadImage();
      }

      if (editingBrand) {
        await updateBrand.mutateAsync({
          id: editingBrand.id,
          ...formData,
          logo: logoUrl,
        });
      } else {
        await createBrand.mutateAsync({
          ...formData,
          logo: logoUrl,
        });
      }
      uploadHook.clearImage();
      handleCloseModal();
    } catch {
      // Error is handled by the hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('آیا از حذف این برند اطمینان دارید؟')) {
      try {
        await deleteBrand.mutateAsync(id);
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
    return <LoadingScreen message="در حال بارگذاری برندها..." />;
  }

  if (isError) {
    return <ErrorScreen onRetry={() => refetch()} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Icon icon="solar:star-bold-duotone" className="w-8 h-8 text-white" />
                <h1 className="text-2xl sm:text-3xl font-bold text-white">مدیریت برندها</h1>
              </div>
              <p className="text-blue-100">مدیریت و سازماندهی برندهای محصولات</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
            >
              <Icon icon="solar:add-circle-bold-duotone" className="w-5 h-5" />
              افزودن برند
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">کل برندها</p>
                <p className="text-2xl font-bold text-gray-900">{brands?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon icon="solar:star-bold-duotone" className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">با لوگو</p>
                <p className="text-2xl font-bold text-gray-900">
                  {brands?.filter((b) => b.logo).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Icon icon="solar:gallery-bold-duotone" className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">با Slug</p>
                <p className="text-2xl font-bold text-gray-900">
                  {brands?.filter((b) => b.slug).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Icon icon="solar:link-bold-duotone" className="w-6 h-6 text-purple-600" />
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
              placeholder="جستجو در برندها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Brands Grid */}
        {filteredBrands.length === 0 ? (
          searchQuery ? (
            <NoSearchResults query={searchQuery} onClear={() => setSearchQuery('')} />
          ) : (
            <EmptyState onAdd={() => handleOpenModal()} />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onEdit={() => handleOpenModal(brand)}
                onDelete={() => handleDelete(brand.id)}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <BrandModal
            formData={formData}
            setFormData={setFormData}
            editingBrand={editingBrand}
            onSubmit={handleSubmit}
            onClose={handleCloseModal}
            isSubmitting={createBrand.isPending || updateBrand.isPending || uploadHook.isUploading}
            uploadHook={uploadHook}
          />
        )}
      </div>
    </div>
  );
}

// Brand Card Component
function BrandCard({
  brand,
  onEdit,
  onDelete,
}: {
  brand: Brand;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{brand.name}</h3>
          {brand.slug && (
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-medium">Slug:</span> {brand.slug}
            </p>
          )}
          {brand.sort_order !== null && (
            <p className="text-sm text-gray-500">
              <span className="font-medium">ترتیب:</span> {brand.sort_order}
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

      {/* Logo Preview */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        {brand.logo ? (
          <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
            <Icon icon="solar:gallery-bold-duotone" className="text-gray-400 w-8 h-8" />
            <span className="text-gray-400 text-sm mr-2">بدون لوگو</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Brand Modal Component
function BrandModal({
  formData,
  setFormData,
  editingBrand,
  onSubmit,
  onClose,
  isSubmitting,
  uploadHook,
}: {
  formData: CreateBrandPayload;
  setFormData: React.Dispatch<React.SetStateAction<CreateBrandPayload>>;
  editingBrand: Brand | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
  uploadHook: ReturnType<typeof useBrandUpload>;
}) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadHook.setImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadHook.setImage(e.target.files[0]);
    }
  };

  const currentLogo = uploadHook.preview?.preview || (editingBrand?.logo || formData.logo);
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {editingBrand ? 'ویرایش برند' : 'افزودن برند جدید'}
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
              نام برند <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: Chanel"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value || null })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="مثال: chanel"
              disabled={!editingBrand && !!formData.name}
            />
            <p className="text-xs text-gray-500 mt-1">
              {!editingBrand && formData.name
                ? 'به صورت خودکار از نام تولید می‌شود'
                : 'برای URL استفاده می‌شود (اختیاری)'}
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              لوگوی برند
            </label>
            
            {/* Upload Errors */}
            {uploadHook.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <Icon icon="solar:danger-triangle-bold-duotone" className="w-5 h-5 text-red-500 mt-0.5" />
                  <p className="text-sm text-red-700">{uploadHook.error}</p>
                </div>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-400 hover:bg-blue-50/50"
              onClick={() => document.getElementById('brand-logo-upload')?.click()}
            >
              <input
                id="brand-logo-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isSubmitting}
              />

              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Icon icon="solar:cloud-upload-bold-duotone" className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  لوگو را اینجا بکشید یا کلیک کنید
                </p>
                <p className="text-xs text-gray-500">
                  فرمت‌های مجاز: JPG, PNG, WebP, GIF, SVG - حداکثر 5MB
                </p>
              </div>
            </div>

            {/* Logo Preview */}
            {currentLogo && (
              <div className="mt-4 relative">
                <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-200">
                  <img
                    src={currentLogo}
                    alt="Brand logo preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    uploadHook.clearImage();
                    setFormData({ ...formData, logo: null });
                  }}
                  disabled={isSubmitting}
                  className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg disabled:opacity-50"
                >
                  <Icon icon="solar:close-circle-bold-duotone" className="w-5 h-5" />
                </button>
                {uploadHook.preview && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                    <Icon icon="solar:info-circle-bold-duotone" className="w-4 h-4" />
                    <span>تصویر جدید آپلود خواهد شد</span>
                  </div>
                )}
              </div>
            )}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'در حال ذخیره...' : editingBrand ? 'به‌روزرسانی' : 'ایجاد'}
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
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
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
        <h2 className="text-xl font-bold text-gray-900 mb-2">خطا در دریافت برندها</h2>
        <p className="text-gray-500 mb-6">مشکلی در برقراری ارتباط با سرور پیش آمده است</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-700 transition-all"
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
          <Icon icon="solar:star-bold-duotone" className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">هیچ برندی وجود ندارد</h3>
        <p className="text-gray-500 mb-6">شروع کنید و اولین برند را ایجاد کنید</p>
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-cyan-700 transition-all"
        >
          افزودن برند
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
        <p className="text-gray-500 mb-4">برندی با عبارت «{query}» پیدا نشد</p>
        <button
          onClick={onClear}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          پاک کردن جستجو
        </button>
      </div>
    </div>
  );
}

