"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectedFrom") || "/";

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("❌ Failed to get user:", error);
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("profile_completed")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Failed to fetch profile:", profileError);
        router.push("/profile");
        return;
      }

      if (profile?.profile_completed) {
        router.push(redirectTo);
      } else {
        router.push("/profile");
      }
    };

    checkUser();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>در حال بررسی ورود...</p>
    </div>
  );
}
