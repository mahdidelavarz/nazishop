"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Any route under /(auth) should NOT show the header
  const noHeaderRoutes = ["/login", "/register", "/otp"];
  const hideHeader = noHeaderRoutes.includes(pathname);

  return (
    <>
      {!hideHeader && <Header />}
      <main>{children}</main>
    </>
  );
}
