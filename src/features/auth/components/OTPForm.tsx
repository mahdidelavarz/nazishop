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
          icon: "✨",
          style: {
            background: "#1f2937",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone Input */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              شماره موبایل
            </label>
            <div className="relative">
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="09123456789"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                disabled={sendOTPMutation.isPending}
                maxLength={11}
                dir="ltr"
              />
              <Icon
                icon="mdi:phone-outline"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                width={20}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sendOTPMutation.isPending}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sendOTPMutation.isPending ? (
              <>
                <Icon icon="mdi:loading" className="animate-spin" width={20} />
                <span>در حال ارسال...</span>
              </>
            ) : (
              <>
                <Icon icon="mdi:arrow-left" width={20} />
                <span>ادامه</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-gray-500">یا</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLogin.isPending}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {googleLogin.isPending ? (
              <>
                <Icon
                  icon="eos-icons:loading"
                  className="animate-spin"
                  width={20}
                />
                <span>در حال اتصال...</span>
              </>
            ) : (
              <>
                <Icon icon="flat-color-icons:google" width={20} />
                <span>ورود با گوگل</span>
              </>
            )}
          </button>
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