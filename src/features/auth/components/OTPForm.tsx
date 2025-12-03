"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { useGoogleLogin } from "../hooks/useGoogleLogin";
import InputComponent from "@/shared/ui/InputComponent";
import ButtonComponent from "@/shared/ui/ButtonComponent";

interface OTPFormProps {
  onSuccess: (phoneNumber: string) => void;
}

const phoneSchema = z.object({
  phone_number: z
    .string()
    .min(11, "شماره موبایل باید 11 رقم باشد")
    .max(11, "شماره موبایل باید 11 رقم باشد")
    .regex(/^09[0-9]{9}$/, "شماره موبایل نامعتبر است"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;

export default function OTPForm({ onSuccess }: OTPFormProps) {
  const googleLogin = useGoogleLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  const sendOTPMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await axios.post("/api/auth/send-otp", {
        phone_number: phone,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.otpCode) {
        toast.success(`کد تایید: ${data.otpCode}`);
      } else {
        toast.success("کد تایید ارسال شد");
      }
      onSuccess(getValues("phone_number"));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "خطا در ارسال کد تایید";
      toast.error(message);
    },
  });

  const handleGoogleLogin = () => {
    googleLogin.mutate();
  };

  const onSubmit = (data: PhoneFormData) => {
    sendOTPMutation.mutate(data.phone_number);
  };

  return (
    <div className="w-full min-w-xl mx-auto px-4">
      {/* Main Card */}
      <div className="relative bg-white rounded-3xl shadow-xl border border-gray-100 p-8 overflow-hidden">
        {/* Gradient Background Accent */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full blur-3xl opacity-60 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-60 -z-10"></div>

        {/* Icon & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30 mb-4">
            <Icon icon="mdi:shimmer" className="text-white" width={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            ورود / ثبت‌نام
          </h2>
          <p className="text-sm text-gray-600">
            برای ادامه شماره موبایل خود را وارد کنید
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Phone Input */}
          <div className="relative">
            <InputComponent
              id="phone"
              name="phone_number"
              type="tel"
              label="شماره موبایل"
              placeholder="09123456789"
              register={register("phone_number")}
              error={errors.phone_number}
              disabled={sendOTPMutation.isPending}
              inputStyle="pr-10 dir-ltr"
            />
            <Icon
              icon="mdi:phone-outline"
              className="absolute right-4 top-9 text-neutral-400"
              width={20}
            />
          </div>

          {/* Submit Button */}
          <ButtonComponent
            type="submit"
            variant="primary"
            size="lg"
            disabled={sendOTPMutation.isPending}
            loading={sendOTPMutation.isPending}
            icon="mdi:arrow-left"
            iconPosition="right"
            fullWidth
            className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 shadow-lg shadow-primary-500/30"
          >
            ادامه
          </ButtonComponent>

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-neutral-500">یا</span>
            </div>
          </div>

          {/* Google Button */}
          <ButtonComponent
            type="button"
            variant="outline"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={googleLogin.isPending}
            loading={googleLogin.isPending}
            icon="flat-color-icons:google"
            iconPosition="left"
            fullWidth
            className="bg-card border-neutral-200 hover:bg-neutral-50"
          >
            ورود با گوگل
          </ButtonComponent>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center mt-6">
          با ورود، پذیرش{" "}
          <a href="#" className="text-purple-600 hover:underline">
            قوانین
          </a>{" "}
          را تایید می‌کنید
        </p>
      </div>
    </div>
  );
}