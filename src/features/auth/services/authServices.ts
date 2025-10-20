// src/features/auth/services/authService.ts
import { supabase } from "@/shared/lib/supabase";
import { LoginFormValues, LoginResponse } from "../types/authType";

export const loginWithEmailApi = async (
    data: LoginFormValues
): Promise<LoginResponse> => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
    });

    if (error) throw new Error(error.message);
    if (!authData.user) throw new Error("No user returned from Supabase");

    const { data: profile } = await supabase
        .from("users")
        .select("profile_completed")
        .eq("id", authData.user.id)
        .single();

    return {
        user: {
            id: authData.user.id,
            email: authData.user.email ?? "",
            profile_completed: profile?.profile_completed ?? false,
        },
        profile_completed: profile?.profile_completed ?? false,
    };
};

export const loginWithGoogleApi = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/callback`,
    },
  });

  if (error) throw new Error(error.message);

  return data; 
};

export const getProfileCompletionApi = async (userId: string) => {
    const { data, error } = await supabase
        .from("users")
        .select("profile_completed")
        .eq("id", userId)
        .single();
    if (error) throw error;
    return data.profile_completed;
};
