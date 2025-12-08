// components/profile/CompleteProfileForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/auth.store';
import { apiClient } from '@/shared/lib/api-client';
import InputComponent from '@/shared/ui/InputComponent';
import TextareaComponent from '@/shared/ui/TextareaComponent';
import ButtonComponent from '@/shared/ui/ButtonComponent';

const profileSchema = z.object({
  email: z
    .string()
    .email('فرمت ایمیل نامعتبر است')
    .optional()
    .or(z.literal('')),
  phone_number: z.string(),
  full_name: z.string().min(1, 'نام کامل الزامی است'),
  address: z.string().min(1, 'آدرس الزامی است'),
  postal_code: z
    .string()
    .max(10, 'کد پستی باید حداکثر 10 رقم باشد')
    .optional()
    .or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CompleteProfileForm() {
  const router = useRouter();
  const { setUser, user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      full_name: user?.full_name || '',
      address: user?.address || '',
      postal_code: user?.postal_code || '',
      birthday: user?.birthday ? user.birthday.split('T')[0] : '',
    },
  });

  const completeProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiClient.post('/profile/complete', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setUser(data.user);
      router.push('/');
    },
    onError: (error: unknown) => {
      const message =
        typeof error === 'object' && error !== null && 'response' in error
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ((error as any).response?.data?.message ?? 'خطا در تکمیل پروفایل')
          : 'خطا در تکمیل پروفایل';
      toast.error(message);
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    completeProfileMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <InputComponent
        id="email"
        name="email"
        type="email"
        label="ایمیل"
        placeholder="example@email.com"
        register={register('email')}
        error={errors.email}
      />

      <div>
        <InputComponent
          id="phone_number"
          name="phone_number"
          type="tel"
          label="شماره موبایل"
          placeholder="09123456789"
          register={register('phone_number')}
          disabled
          inputStyle="bg-neutral-50"
        />
        <p className="text-xs text-neutral-500 mt-1">
          شماره موبایل قابل تغییر نیست
        </p>
      </div>

      <InputComponent
        id="full_name"
        name="full_name"
        type="text"
        label="نام و نام خانوادگی *"
        register={register('full_name')}
        error={errors.full_name}
      />

      <TextareaComponent
        id="address"
        name="address"
        label="آدرس *"
        register={register('address')}
        error={errors.address}
        rows={3}
      />

      <InputComponent
        id="postal_code"
        name="postal_code"
        type="text"
        label="کد پستی"
        register={register('postal_code', {
          maxLength: 10,
        })}
        error={errors.postal_code}
      />

      <InputComponent
        id="birthday"
        name="birthday"
        type="date"
        label="تاریخ تولد"
        register={register('birthday')}
        error={errors.birthday}
      />

      <ButtonComponent
        type="submit"
        variant="primary"
        size="lg"
        disabled={completeProfileMutation.isPending}
        loading={completeProfileMutation.isPending}
        icon="mdi:check"
        iconPosition="right"
        fullWidth
      >
        ذخیره اطلاعات
      </ButtonComponent>
    </form>
  );
}