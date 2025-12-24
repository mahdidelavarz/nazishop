"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { checkAuthState } from "@/shared/lib/auth-check";

/**
 * AuthInitProvider - Initializes authentication state once at root level
 * This prevents redundant auth checks across multiple components
 */
export default function AuthInitProvider({ children }: { children: React.ReactNode }) {
  const { initializeUser } = useAuth();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Initialize auth only once on mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      // Diagnostic: Check auth state before initializing
      checkAuthState();
      
      initializeUser();
    }
  }, [initializeUser]);

  return <>{children}</>;
}
