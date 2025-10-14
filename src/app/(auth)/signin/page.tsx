// app/login/page.tsx

import LoginForm from "@/features/auth/components/loginForm";

export default function LoginPage() {
  return (
    <div className="container mx-auto p-4">
      <LoginForm />
    </div>
  );
}
