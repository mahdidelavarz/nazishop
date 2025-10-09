"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";

type ProfileForm = {
  full_name: string;
  phone_number: string;
  address: string;
  postal_code: string;
  birthday: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>();

 const mutation = useMutation({
  mutationFn: async (data: ProfileForm) => {
    if (!user) throw new Error("کاربر یافت نشد");

    const { error } = await supabase.from("users").upsert(
      {
        id: user.id,
        email: user.email, // ✅ ADD THIS LINE
        full_name: data.full_name,
        phone_number: data.phone_number,
        address: data.address,
        postal_code: data.postal_code,
        birthday: data.birthday,
        profile_completed: true,
      },
      { onConflict: "id" }
    );

    if (error) throw error;
    return true;
  },
  onSuccess: () => {
    router.push("/");
  },
  onError: (error: any) => {
    console.error("Profile update error:", error.message);
  },
});


  const onSubmit = (data: ProfileForm) => {
    mutation.mutate(data);
  };

  return (
    <div dir="rtl" className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">تکمیل پروفایل</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">نام و نام خانوادگی</label>
          <input
            {...register("full_name", { required: "نام الزامی است" })}
            className="border p-2 rounded w-full"
          />
          {errors.full_name && (
            <p className="text-red-500 text-sm">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">شماره موبایل</label>
          <input
            {...register("phone_number", {
              required: "شماره موبایل الزامی است",
            })}
            className="border p-2 rounded w-full"
          />
          {errors.phone_number && (
            <p className="text-red-500 text-sm">
              {errors.phone_number.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1">آدرس</label>
          <input
            {...register("address", { required: "آدرس الزامی است" })}
            className="border p-2 rounded w-full"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">کد پستی</label>
          <input
            {...register("postal_code")}
            className="border p-2 rounded w-full"
          />
        </div>

        <div>
          <label className="block mb-1">تاریخ تولد</label>
          <input
            type="date"
            {...register("birthday")}
            className="border p-2 rounded w-full"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-pink-500 text-white px-4 py-2 rounded-md w-full"
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
  );
}
