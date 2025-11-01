"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/authStore";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Link from "next/link";

type ProfileForm = {
  full_name: string;
  address: string;
  postal_code: string;
  birthday: string;
};

type UserProfile = {
  id: string;
  phone_number: string | null;
  email: string | null;
  full_name: string | null;
  address: string | null;
  postal_code: string | null;
  birthday: string | null;
  profile_completed: boolean;
};

export default function ProfilePage() {
  const router = useRouter();
  const { userId, phoneNumber, email, isAuthenticated } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<ProfileForm>();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirectedFrom=/profile");
    }
  }, [isAuthenticated, router]);

  // Fetch existing profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const response = await fetch("/api/user/profile");
      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات");
      }
      const result = await response.json();
      return result.user as UserProfile;
    },
    enabled: !!userId,
  });

  // Set form values when profile data is loaded
  useEffect(() => {
    if (profileData) {
      reset({
        full_name: profileData.full_name || "",
        address: profileData.address || "",
        postal_code: profileData.postal_code || "",
        birthday: profileData.birthday || "",
      });
      
      // Auto-enable editing if profile not completed
      if (!profileData.profile_completed) {
        setIsEditing(true);
      }
    }
  }, [profileData, reset]);

  // Update profile mutation
  const mutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      if (!userId) {
        throw new Error("کاربر یافت نشد");
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در ذخیره اطلاعات");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("پروفایل با موفقیت ذخیره شد");
      setIsEditing(false);
      
      // If this was first-time completion, redirect to home
      if (!profileData?.profile_completed) {
        setTimeout(() => router.push("/"), 1000);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطا در ذخیره اطلاعات");
    },
  });

  const onSubmit = (data: ProfileForm) => {
    mutation.mutate(data);
  };

  const handleCancel = () => {
    if (profileData?.profile_completed) {
      reset({
        full_name: profileData.full_name || "",
        address: profileData.address || "",
        postal_code: profileData.postal_code || "",
        birthday: profileData.birthday || "",
      });
      setIsEditing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="text-center">
          <Icon icon="eos-icons:loading" className="text-pink-500 mx-auto mb-4" width={48} />
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const isNewUser = !profileData?.profile_completed;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {!isNewUser && (
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-pink-500 transition"
            >
              <Icon icon="ph:arrow-right" width={20} />
              <span>بازگشت به خانه</span>
            </Link>
          )}
          
          {isNewUser && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
              <Icon icon="ph:info-duotone" width={20} />
              <span className="text-sm font-medium">لطفا پروفایل خود را تکمیل کنید</span>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                  <Icon icon="ph:user-duotone" width={40} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {isNewUser ? "تکمیل پروفایل" : "پروفایل من"}
                  </h1>
                  <p className="text-white/80 text-sm">
                    {phoneNumber || email || "کاربر"}
                  </p>
                </div>
              </div>
              
              {!isNewUser && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition"
                >
                  <Icon icon="ph:pencil-simple-duotone" width={20} />
                  <span>ویرایش</span>
                </button>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Info Section */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Icon icon="ph:identification-card-duotone" width={24} className="text-pink-500" />
                  اطلاعات تماس
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone Number - Read Only */}
                  {phoneNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        شماره موبایل
                      </label>
                      <div className="relative">
                        <Icon
                          icon="ph:phone-duotone"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          width={20}
                        />
                        <input
                          value={phoneNumber}
                          disabled
                          className="w-full pr-10 pl-4 py-3 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email - Read Only */}
                  {email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ایمیل
                      </label>
                      <div className="relative">
                        <Icon
                          icon="ph:envelope-duotone"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          width={20}
                        />
                        <input
                          value={email}
                          disabled
                          className="w-full pr-10 pl-4 py-3 border border-gray-200 bg-gray-50 rounded-lg cursor-not-allowed"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Info Section */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Icon icon="ph:user-circle-duotone" width={24} className="text-purple-500" />
                  اطلاعات شخصی
                </h2>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام و نام خانوادگی *
                    </label>
                    <div className="relative">
                      <Icon
                        icon="ph:user-duotone"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        width={20}
                      />
                      <input
                        {...register("full_name", { required: "نام الزامی است" })}
                        disabled={!isEditing}
                        className={`w-full pr-10 pl-4 py-3 border rounded-lg transition ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        placeholder="علی احمدی"
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <Icon icon="ph:warning-circle" width={16} />
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  {/* Birthday */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاریخ تولد
                    </label>
                    <div className="relative">
                      <Icon
                        icon="ph:calendar-duotone"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        width={20}
                      />
                      <input
                        type="date"
                        {...register("birthday")}
                        disabled={!isEditing}
                        className={`w-full pr-10 pl-4 py-3 border rounded-lg transition ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Icon icon="ph:map-pin-duotone" width={24} className="text-blue-500" />
                  آدرس
                </h2>

                <div className="space-y-4">
                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      آدرس کامل *
                    </label>
                    <div className="relative">
                      <Icon
                        icon="ph:map-pin-line-duotone"
                        className="absolute right-3 top-3 text-gray-400"
                        width={20}
                      />
                      <textarea
                        {...register("address", { required: "آدرس الزامی است" })}
                        disabled={!isEditing}
                        className={`w-full pr-10 pl-4 py-3 border rounded-lg transition ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        placeholder="تهران، خیابان ولیعصر، پلاک ۱۲۳، واحد ۴"
                        rows={3}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <Icon icon="ph:warning-circle" width={16} />
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      کد پستی
                    </label>
                    <div className="relative">
                      <Icon
                        icon="ph:envelope-simple-duotone"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        width={20}
                      />
                      <input
                        {...register("postal_code", {
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "کد پستی باید ۱۰ رقم باشد",
                          },
                        })}
                        disabled={!isEditing}
                        className={`w-full pr-10 pl-4 py-3 border rounded-lg transition ${
                          isEditing
                            ? "border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            : "border-gray-200 bg-gray-50"
                        }`}
                        placeholder="1234567890"
                        maxLength={10}
                        dir="ltr"
                      />
                    </div>
                    {errors.postal_code && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <Icon icon="ph:warning-circle" width={16} />
                        {errors.postal_code.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium py-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                  >
                    {mutation.isPending ? (
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

                  {!isNewUser && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={mutation.isPending}
                      className="px-6 flex items-center gap-2 border-2 border-gray-300 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition"
                    >
                      <Icon icon="ph:x-circle-duotone" width={20} />
                      انصراف
                    </button>
                  )}
                </div>
              )}
            </form>

            {/* Profile Stats - Only show when not editing and profile completed */}
            {!isEditing && profileData?.profile_completed && (
              <div className="mt-8 pt-6 border-t">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl text-center">
                    <Icon icon="ph:shopping-bag-duotone" className="text-pink-500 mx-auto mb-2" width={32} />
                    <p className="text-2xl font-bold text-gray-800">0</p>
                    <p className="text-sm text-gray-600">سفارش</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                    <Icon icon="ph:heart-duotone" className="text-purple-500 mx-auto mb-2" width={32} />
                    <p className="text-2xl font-bold text-gray-800">0</p>
                    <p className="text-sm text-gray-600">علاقه‌مندی</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                    <Icon icon="ph:star-duotone" className="text-blue-500 mx-auto mb-2" width={32} />
                    <p className="text-2xl font-bold text-gray-800">0</p>
                    <p className="text-sm text-gray-600">امتیاز</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl text-center">
                    <Icon icon="ph:gift-duotone" className="text-orange-500 mx-auto mb-2" width={32} />
                    <p className="text-2xl font-bold text-gray-800">0</p>
                    <p className="text-sm text-gray-600">کد تخفیف</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Card - Only for new users */}
        {isNewUser && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex gap-4">
              <Icon icon="ph:lightbulb-duotone" className="text-blue-500 flex-shrink-0" width={32} />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">چرا تکمیل پروفایل مهم است؟</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• ارسال سریع‌تر سفارشات به آدرس شما</li>
                  <li>• دریافت پیشنهادات ویژه و تخفیف‌های اختصاصی</li>
                  <li>• پیگیری راحت‌تر سفارشات</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}