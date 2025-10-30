"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/authStore";
import toast from "react-hot-toast";

type ProfileForm = {
  full_name: string;
  address: string;
  postal_code: string;
  birthday: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { userId, phoneNumber } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>();

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
        body: JSON.stringify({
          full_name: data.full_name,
          address: data.address,
          postal_code: data.postal_code,
          birthday: data.birthday,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در ذخیره اطلاعات");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("پروفایل با موفقیت ذخیره شد");
      router.push("/");
    },
    onError: (error: Error) => {
      toast.error(error.message || "خطا در ذخیره اطلاعات");
      console.error("Profile update error:", error.message);
    },
  });

  const onSubmit = (data: ProfileForm) => {
    mutation.mutate(data);
  };

  return (
    <div dir="rtl" className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-2">تکمیل پروفایل</h1>
        <p className="text-gray-600 mb-6">لطفا اطلاعات خود را تکمیل کنید</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Phone Number - Read Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              شماره موبایل
            </label>
            <input
              value={phoneNumber || ""}
              disabled
              className="border border-gray-300 bg-gray-50 p-3 rounded-lg w-full cursor-not-allowed"
              dir="ltr"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نام و نام خانوادگی *
            </label>
            <input
              {...register("full_name", { required: "نام الزامی است" })}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="علی احمدی"
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.full_name.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              آدرس *
            </label>
            <textarea
              {...register("address", { required: "آدرس الزامی است" })}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="تهران، خیابان ولیعصر، پلاک ۱۲۳"
              rows={3}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              کد پستی
            </label>
            <input
              {...register("postal_code", {
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "کد پستی باید ۱۰ رقم باشد",
                },
              })}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1234567890"
              maxLength={10}
              dir="ltr"
            />
            {errors.postal_code && (
              <p className="text-red-500 text-sm mt-1">
                {errors.postal_code.message}
              </p>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ تولد
            </label>
            <input
              type="date"
              {...register("birthday")}
              className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-lg w-full disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {mutation.isPending ? "در حال ذخیره..." : "ذخیره پروفایل"}
          </button>

          {mutation.isError && (
            <p className="text-red-500 text-sm text-center mt-2">
              خطا در ذخیره اطلاعات. لطفاً دوباره تلاش کنید.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}