import "./globals.css";
import { AuthProvider } from "@/shared/providers/AuthProvider";
import QueryProvider from "@/shared/providers/QueryProviders";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa">
      <body>
        <QueryProvider>
          <Toaster position="top-center" />
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
