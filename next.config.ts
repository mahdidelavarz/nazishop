import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  matcher: ["/profile/:path*", "/cart/:path*", "/checkout/:path*"],

  /* config options here */
};

export default nextConfig;
