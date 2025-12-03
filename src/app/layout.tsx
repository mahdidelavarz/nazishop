// @ts-ignore
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import localFont from "next/font/local";
import { Providers } from '@/shared/providers/providers';
import LayoutWrapper from '@/shared/layouts/LayoutWrapper';
import CartSyncProvider from '@/features/cart/components/CartSyncProvider';
import AuthInitProvider from '@/features/auth/components/AuthInitProvider';

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
  preload: true,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: 'JWT Authentication System',
  description: 'Next.js JWT Authentication with OTP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body>
        <Providers>
          <AuthInitProvider>
            <CartSyncProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </CartSyncProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: { background: '#333', color: '#fff' },
              }}
            />
          </AuthInitProvider>
        </Providers>
      </body>
    </html>
  );
}
