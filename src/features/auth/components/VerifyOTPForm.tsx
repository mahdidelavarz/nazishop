// components/auth/VerifyOTPForm.tsx

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../store/auth.store";
import InputComponent from "@/shared/ui/InputComponent";
import ButtonComponent from "@/shared/ui/ButtonComponent";

interface VerifyOTPFormProps {
  phoneNumber: string;
  onBack: () => void;
}

const otpSchema = z.object({
  otp_code: z
    .string()
    .length(4, "کد تایید باید 4 رقم باشد")
    .regex(/^\d{4}$/, "کد تایید باید فقط شامل اعداد باشد"),
});

type OTPFormData = z.infer<typeof otpSchema>;

export default function VerifyOTPForm({
  phoneNumber,
  onBack,
}: VerifyOTPFormProps) {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [timer, setTimer] = useState(120);
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get('redirectedFrom') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
  });

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const verifyOTPMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await axios.post("/api/auth/verify-otp", {
        phone_number: phoneNumber,
        otp_code: code,
      },
    );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      setUser(data.user);
      // Refresh token is now in httpOnly cookie (set by server)
      // No need to store it client-side
      // Always redirect to profile page after login
      // Profile page will handle showing completion form or profile details
      if (!data.user.profile_completed) {
        router.push("/profile");
      } else {
        router.push(redirectedFrom || "/");
      }
    },
    onError: (error: AxiosError) => {
      const message = (error.response?.data as { message?: string })?.message || "کد تایید اشتباه است";
      toast.error(message);
    },
  });

  const onSubmit = (data: OTPFormData) => {
    verifyOTPMutation.mutate(data.otp_code);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-sm text-neutral-600">
          کد تایید به شماره <span className="font-bold">{phoneNumber}</span>{" "}
          ارسال شد
        </p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-primary-500 hover:underline mt-2"
        >
          تغییر شماره
        </button>
      </div>

      <InputComponent
        id="otp"
        name="otp_code"
        type="text"
        label="کد تایید"
        placeholder="____"
        register={register("otp_code", {
          onChange: (e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
          },
        })}
        error={errors.otp_code}
        disabled={verifyOTPMutation.isPending}
        inputStyle="text-center text-2xl tracking-widest dir-ltr"
      />

      <div className="text-center text-sm text-neutral-600">
        {timer > 0 ? (
          <span>زمان باقی‌مانده: {formatTime(timer)}</span>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="text-primary-500 hover:underline"
          >
            ارسال مجدد کد
          </button>
        )}
      </div>

      <ButtonComponent
        type="submit"
        variant="primary"
        size="lg"
        disabled={verifyOTPMutation.isPending}
        loading={verifyOTPMutation.isPending}
        icon="mdi:check-circle"
        iconPosition="right"
        fullWidth
      >
        تایید و ورود
      </ButtonComponent>
    </form>
  );
}
