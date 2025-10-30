// app/login/page.tsx

import OTPLoginForm from "@/features/auth/components/OTPLoginForm";

// import LoginForm from "@/features/auth/components/loginForm";

export default function LoginPage() {
  return (
    <div className="container mx-auto p-4">
      {/* <LoginForm /> */}
      <OTPLoginForm />
    </div>
  );
}
