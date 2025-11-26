// components/profile/CompleteProfileForm.tsx

'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '@/shared/lib/api-client';


export default function CompleteProfileForm() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    full_name: '',
    address: '',
    postal_code: '',
    birthday: '',
  });

  const completeProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiClient.post('/profile/complete', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setUser(data.user);
      router.push('/');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'خطا در تکمیل پروفایل';
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.full_name || !formData.address) {
      toast.error('نام کامل و آدرس الزامی است');
      return;
    }

    completeProfileMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          نام و نام خانوادگی *
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          value={formData.full_name}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          required
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          آدرس *
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          required
        />
      </div>

      <div>
        <label
          htmlFor="postal_code"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          کد پستی
        </label>
        <input
          id="postal_code"
          name="postal_code"
          type="text"
          value={formData.postal_code}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          maxLength={10}
        />
      </div>

      <div>
        <label
          htmlFor="birthday"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          تاریخ تولد
        </label>
        <input
          id="birthday"
          name="birthday"
          type="date"
          value={formData.birthday}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={completeProfileMutation.isPending}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {completeProfileMutation.isPending ? (
          <>
            <Icon icon="mdi:loading" className="animate-spin" width={20} />
            در حال ذخیره...
          </>
        ) : (
          <>
            <Icon icon="mdi:check" width={20} />
            ذخیره اطلاعات
          </>
        )}
      </button>
    </form>
  );
}