// src/features/auth/components/ProfileForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import { useAuth } from '../hooks/useAuth'
import { showSuccessToast, showErrorToast } from '@/shared/utils/errors'
import { useAuthStore } from '../store/authStore'
import { updateProfileApi } from '../services/authServices'

type ProfileFormData = {
  fullName: string
  email?: string
}

export default function ProfileForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { setUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
    },
  })

  const updateProfile = useMutation({
    mutationFn: (data: ProfileFormData) =>
      updateProfileApi(user!.id, {
        full_name: data.fullName,
        email: data.email || null,
        profile_completed: true,
      }),
    onSuccess: (data) => {
      // Update store
      setUser({
        ...user!,
        fullName: data.full_name,
        email: data.email,
        profileCompleted: true,
      })

      showSuccessToast('پروفایل با موفقیت به‌روزرسانی شد')
      router.push('/')
    },
    onError: (error: Error) => {
      showErrorToast(error)
    },
  })

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نام و نام خانوادگی <span className="text-red-500">*</span>
        </label>
        <input
          {...register('fullName', {
            required: 'نام و نام خانوادگی الزامی است',
            minLength: {
              value: 3,
              message: 'نام باید حداقل ۳ کاراکتر باشد',
            },
          })}
          type="text"
          placeholder="نام کامل خود را وارد کنید"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          disabled={updateProfile.isPending}
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ایمیل (اختیاری)
        </label>
        <input
          {...register('email', {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'فرمت ایمیل نامعتبر است',
            },
          })}
          type="email"
          placeholder="example@email.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          disabled={updateProfile.isPending}
          dir="ltr"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Phone (Read-only) */}
      {user?.phoneNumber && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            شماره موبایل
          </label>
          <input
            type="text"
            value={user.phoneNumber}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            dir="ltr"
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={updateProfile.isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {updateProfile.isPending ? (
          <>
            <Icon icon="eos-icons:loading" className="animate-spin" width={20} />
            در حال ذخیره...
          </>
        ) : (
          <>
            <Icon icon="ph:check-circle-duotone" width={20} />
            ذخیره اطلاعات
          </>
        )}
      </button>
    </form>
  )
}