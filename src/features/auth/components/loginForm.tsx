"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useLoginWithEmail,
  useLoginWithGoogle,
} from "@/features/auth/hooks/useAuth";

const schema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(6, "رمز عبور حداقل باید ۶ کاراکتر باشد"),
});

type LoginFormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
  });

  const { mutate: login, isPending } = useLoginWithEmail();
  const { mutate: googleLogin, isPending: googlePending } =
    useLoginWithGoogle();

  const onSubmit = (data: LoginFormValues) => {
    login(data);
  };

  return (
    <form
      dir="rtl"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md mx-auto"
    >
      <h1 className="text-2xl font-bold text-center">ورود به فروشگاه</h1>

      <div>
        <label className="block text-sm font-medium">ایمیل</label>
        <input
          {...register("email")}
          type="email"
          className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
          placeholder="ایمیل خود را وارد کنید"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">رمز عبور</label>
        <input
          {...register("password")}
          type="password"
          className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
          placeholder="رمز عبور خود را وارد کنید"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isPending ? "در حال ورود..." : "ورود"}
      </button>

      <button
        type="button"
        onClick={() => googleLogin("/")}
        disabled={googlePending}
        className="w-full bg-red-500 text-white p-2 rounded-md hover:bg-red-600 disabled:bg-gray-400"
      >
        ورود با گوگل
      </button>
    </form>
  );
}
