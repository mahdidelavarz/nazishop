"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

export function useProtectedRoute() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      if (!session) {
        router.replace(`/login?redirectedFrom=${encodeURIComponent(pathname)}`);
      }
    }

    checkAuth();
  }, [router, pathname]);
}
