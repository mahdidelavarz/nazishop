'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useProtectedRoute } from '@/features/auth/hooks/useProtectedRoute';
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/features/addresses/hooks/useAddresses';
import type { UserAddress, CreateAddressPayload } from '@/features/addresses/types/addressTypes';

type ModalMode = 'create' | 'edit' | null;

export default function AddressesPage() {
  const { user, isLoading: authLoading } = useProtectedRoute();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const createMutation = useCreateAddress();
  const updateMutation = useUpdateAddress();
  const deleteMutation = useDeleteAddress();
  const setDefaultMutation = useSetDefaultAddress();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateAddressPayload>({
    label: '',
    full_name: '',
    phone_number: '',
    address_line: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'ایران',
    is_default: false,
  });

  const isLoading = authLoading || addressesLoading;

  const resetForm = () => {
    setFormData({
      label: '',
      full_name: user?.full_name || '',
      phone_number: user?.phone_number || '',
      address_line: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'ایران',
      is_default: false,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingAddress(null);
    setModalMode('create');
  };

  const openEditModal = (address: UserAddress) => {
    setFormData({
      label: address.label || '',
      full_name: address.full_name,
      phone_number: address.phone_number || '',
      address_line: address.address_line,
      city: address.city || '',
      state: address.state || '',
      postal_code: address.postal_code || '',
      country: address.country || 'ایران',
      is_default: address.is_default,
    });
    setEditingAddress(address);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingAddress(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'create') {
      await createMutation.mutateAsync(formData);
    } else if (modalMode === 'edit' && editingAddress) {
      await updateMutation.mutateAsync({ id: editingAddress.id, ...formData });
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    setDeleteConfirmId(null);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
        <div className="text-center">
          <Icon
            icon="eos-icons:loading"
            className="text-accent-500 mx-auto mb-4 animate-spin"
            width={48}
          />
          <p className="text-neutral-600 dark:text-neutral-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">آدرس‌های من</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              آدرس‌های ارسال سفارشات خود را مدیریت کنید
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition"
          >
            <Icon icon="ph:plus-bold" width={20} />
            افزودن آدرس
          </button>
        </div>

        {/* Addresses List */}
        {!addresses || addresses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl shadow">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="ph:map-pin-duotone"
                className="text-accent-500"
                width={48}
              />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              هنوز آدرسی ثبت نکرده‌اید
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              برای سفارش‌دهی، ابتدا یک آدرس اضافه کنید
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition"
            >
              <Icon icon="ph:plus-bold" width={20} />
              افزودن آدرس جدید
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white dark:bg-neutral-800 rounded-2xl shadow p-6 border-2 transition ${
                  address.is_default
                    ? 'border-accent-500'
                    : 'border-transparent hover:border-neutral-200 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {address.label && (
                        <span className="px-3 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full text-sm font-medium">
                          {address.label}
                        </span>
                      )}
                      {address.is_default && (
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium flex items-center gap-1">
                          <Icon icon="ph:check-circle-fill" width={16} />
                          پیش‌فرض
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-foreground text-lg mb-1">
                      {address.full_name}
                    </h3>
                    {address.phone_number && (
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-2">
                        {address.phone_number}
                      </p>
                    )}
                    <p className="text-neutral-700 dark:text-neutral-300">
                      {address.address_line}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                      {[address.city, address.state, address.postal_code, address.country]
                        .filter(Boolean)
                        .join('، ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!address.is_default && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        disabled={setDefaultMutation.isPending}
                        className="p-2 text-neutral-500 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/30 rounded-lg transition"
                        title="تنظیم به عنوان پیش‌فرض"
                      >
                        <Icon icon="ph:star" width={20} />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(address)}
                      className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                      title="ویرایش"
                    >
                      <Icon icon="ph:pencil-simple" width={20} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(address.id)}
                      className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                      title="حذف"
                    >
                      <Icon icon="ph:trash" width={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {modalMode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">
                    {modalMode === 'create' ? 'افزودن آدرس جدید' : 'ویرایش آدرس'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition"
                  >
                    <Icon icon="ph:x" width={20} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Label */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    برچسب (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="مثال: خانه، محل کار"
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-accent-500 focus:border-transparent transition"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    نام گیرنده <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-accent-500 focus:border-transparent transition"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    شماره تماس
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="09123456789"
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-accent-500 focus:border-transparent transition"
                    dir="ltr"
                  />
                </div>

                {/* Address Line */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    آدرس کامل <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.address_line}
                    onChange={(e) => setFormData({ ...formData, address_line: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-accent-500 focus:border-transparent transition resize-none"
                    placeholder="خیابان، کوچه، پلاک، واحد"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      شهر
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-accent-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      استان
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-accent-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    کد پستی
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-foreground focus:ring-2 focus:ring-accent-500 focus:border-transparent transition"
                    dir="ltr"
                  />
                </div>

                {/* Is Default */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-5 h-5 rounded border-neutral-300 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-foreground">تنظیم به عنوان آدرس پیش‌فرض</span>
                </label>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Icon icon="eos-icons:loading" className="animate-spin" width={20} />
                        در حال ذخیره...
                      </span>
                    ) : modalMode === 'create' ? (
                      'افزودن آدرس'
                    ) : (
                      'ذخیره تغییرات'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon="ph:trash-duotone" className="text-red-500" width={32} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  حذف آدرس
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  آیا از حذف این آدرس اطمینان دارید؟
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 px-6 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
                  >
                    انصراف
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmId)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    {deleteMutation.isPending ? (
                      <Icon icon="eos-icons:loading" className="animate-spin mx-auto" width={20} />
                    ) : (
                      'حذف'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

