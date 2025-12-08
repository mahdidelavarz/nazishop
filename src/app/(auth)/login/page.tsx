// app/login/page.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import OTPForm from "@/features/auth/components/OTPForm";
import VerifyOTPForm from "@/features/auth/components/VerifyOTPForm";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated , user } = useAuthStore();
  const [step, setStep] = useState<"phone" | "verify">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const handleOTPSent = (phone: string) => {
    setPhoneNumber(phone);
    setStep("verify");
  };

  const handleBack = () => {
    setStep("phone");
    setPhoneNumber("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={null}>
          {step === "phone" ? (
            <OTPForm onSuccess={handleOTPSent} />
          ) : (
            <VerifyOTPForm phoneNumber={phoneNumber} onBack={handleBack} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
