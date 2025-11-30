"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { useGoogleLogin } from "../hooks/useGoogleLogin";

interface OTPFormProps {
  onSuccess: (phoneNumber: string) => void;
}

export default function OTPForm({ onSuccess }: OTPFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const googleLogin = useGoogleLogin();

  const sendOTPMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await axios.post("/api/auth/send-otp", {
        phone_number: phone,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.otpCode) {
        toast.success(`کد تایید: ${data.otpCode}`, {
          duration: 10000,
          icon: "🔑",
          style: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
            padding: "16px",
            borderRadius: "12px",
          },
        });
      } else {
        toast.success("کد تایید ارسال شد");
      }
      onSuccess(phoneNumber);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "خطا در ارسال کد تایید";
      toast.error(message);
    },
  });

  const handleGoogleLogin = () => {
    googleLogin.mutate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^09[0-9]{9}$/.test(phoneNumber)) {
      toast.error("شماره تلفن نامعتبر است");
      return;
    }

    sendOTPMutation.mutate(phoneNumber);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Main Card */}
      <div className="relative backdrop-blur-sm bg-white/90 rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20">
        {/* Icon Header */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur-lg opacity-75"></div>
            <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-4 rounded-2xl">
              <Icon
                icon="mdi:sparkles"
                className="text-white"
                width={40}
                height={40}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            خوش آمدید
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            برای ورود، شماره موبایل خود را وارد کنید
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Input */}
          <div className="relative">
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"
            >
              <Icon icon="mdi:phone" width={18} className="text-purple-600" />
              شماره موبایل
            </label>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09123456789"
                className="relative w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition duration-300 text-gray-800 placeholder:text-gray-400"
                disabled={sendOTPMutation.isPending}
                maxLength={11}
                dir="ltr"
              />
              <Icon
                icon="mdi:phone-outline"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-purple-500 transition"
                width={22}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sendOTPMutation.isPending}
            className="relative w-full group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-base sm:text-lg transition-transform duration-300 group-hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg">
              {sendOTPMutation.isPending ? (
                <>
                  <Icon
                    icon="mdi:loading"
                    className="animate-spin"
                    width={24}
                  />
                  <span>در حال ارسال...</span>
                </>
              ) : (
                <>
                  <Icon icon="mdi:send" width={24} />
                  <span>ارسال کد تایید</span>
                </>
              )}
            </div>
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                یا ورود با
              </span>
            </div>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLogin.isPending}
            className="relative w-full group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition duration-300"></div>
            <div className="relative bg-white border-2 border-gray-200 hover:border-gray-300 py-4 rounded-xl font-semibold text-gray-700 transition-all duration-300 group-hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3">
              {googleLogin.isPending ? (
                <>
                  <Icon
                    icon="eos-icons:loading"
                    className="animate-spin text-gray-600"
                    width={24}
                  />
                  <span>در حال انتقال...</span>
                </>
              ) : (
                <>
                  <Icon icon="flat-color-icons:google" width={24} />
                  <span>ورود با گوگل</span>
                </>
              )}
            </div>
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            با ورود به سایت،{" "}
            <span className="text-purple-600 font-semibold cursor-pointer hover:underline">
              قوانین و مقررات
            </span>{" "}
            را می‌پذیرید
          </p>
        </div>
      </div>

      {/* Bottom Decoration */}
      <div className="mt-6 flex justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse animation-delay-200"></div>
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse animation-delay-400"></div>
      </div>
    </div>
  );
}