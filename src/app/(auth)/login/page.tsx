// app/login/page.tsx

import OTPLoginForm from "@/features/auth/components/OTPLoginForm";

export default function LoginPage() {
  return (
    <div className="container mx-auto p-4">
      <OTPLoginForm />
    </div>
  );
}
