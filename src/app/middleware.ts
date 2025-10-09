import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Define public paths (no auth required)
  const publicPaths = ["/", "/products", "/products/", "/products/(.*)"];
  const isPublic = publicPaths.some((path) => new RegExp(`^${path}$`).test(pathname));

  // Get Supabase access token from cookies
  const supabaseSession = req.cookies.get("sb-access-token")?.value;

  // Not logged in → block access to protected pages
  if (!supabaseSession && !isPublic && pathname.startsWith("/store")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → block access to auth pages
  if (supabaseSession && ["/login", "/signup"].includes(pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|static|favicon.ico|.*\\.[\\w]+$).*)",
  ],
};
