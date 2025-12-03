"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";

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
      initializeUser();
    }
  }, [initializeUser]);

  return <>{children}</>;
}
