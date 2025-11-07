import "./globals.css";
import CartSyncProvider from "@/features/cart/components/CartSyncProvider";
import { AuthProvider } from "@/shared/providers/AuthProvider";
import QueryProvider from "@/shared/providers/QueryProviders";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <QueryProvider>
          <Toaster position="top-center" />
          <CartSyncProvider>
            <AuthProvider>{children}</AuthProvider>
          </CartSyncProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
