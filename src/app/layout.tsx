import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";
import QueryProvider from "@/providers/QueryProviders";

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
