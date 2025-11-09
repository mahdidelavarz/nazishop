import "./globals.css";
import CartSyncProvider from "@/features/cart/components/CartSyncProvider";
import { AuthProvider } from "@/shared/providers/AuthProvider";
import QueryProvider from "@/shared/providers/QueryProviders";
import { Toaster } from "react-hot-toast";
import localFont from "next/font/local";

const vazir = localFont({
  src: [
    {
      path: "../../public/fonts/Vazirmatn-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata = {
  title: "My App",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
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
