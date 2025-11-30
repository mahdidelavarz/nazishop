// @ts-ignore
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import localFont from "next/font/local";
import { Providers } from '@/shared/providers/providers';
import LayoutWrapper from '@/shared/layouts/LayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

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

export const metadata: Metadata = {
  title: 'JWT Authentication System',
  description: 'Next.js JWT Authentication with OTP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={vazir.variable}>
      <body className={inter.className}>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { background: '#333', color: '#fff' },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
