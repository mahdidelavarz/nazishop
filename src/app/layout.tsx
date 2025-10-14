import "./globals.css";
import { AuthProvider } from "@/shared/providers/AuthProvider";
import QueryProvider from "@/shared/providers/QueryProviders";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa">
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
