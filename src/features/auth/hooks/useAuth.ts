"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { loginWithEmailApi, loginWithGoogleApi } from '@/features/auth/services/authServices';
import toast from "react-hot-toast";
import { LoginFormValues, LoginResponse } from "../types/authType";


export const useLoginWithEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectedFrom") || "/";
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation<LoginResponse, Error, LoginFormValues>({
    mutationFn: (data) => loginWithEmailApi(data),
    onSuccess: ({ user, profile_completed }) => {
      setUser(user);
      router.push(profile_completed ? redirectTo : "/profile");
      toast.success("با موفقیت وارد شدید");
    },
    onError: (error) => {
      toast.error(`خطا در ورود: ${error.message}`);
    },
  });
};

export const useLoginWithGoogle = () => {
    return useMutation({
        mutationFn: loginWithGoogleApi,
        onError: (error: Error) => {
            toast.error(`خطا در ورود با گوگل: ${error.message}`);
        },
    });
};
