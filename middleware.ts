// middleware.ts

import { verifyAccessToken } from '@/shared/lib/jwt/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that should NEVER be protected
  const publicRoutes = ['/', '/products', '/login', '/register', '/otp'];
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith('/products/')
  );

  // If it's a public route, allow access without authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Protected routes (all admin and user-specific routes)
  const protectedRoutes = [
    '/profile',
    '/admin-dashboard',
    '/admin-products', 
    '/admin-categories',
    '/admin-brands',
    '/admin-orders',
    '/wishlist',
    '/cart',
    '/checkout',
    '/orders',
  ];

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // No token - redirect to login
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token - if expired/invalid, let the page handle refresh
    // The page will call /api/auth/me, get 401, and the interceptor will refresh
    try {
      verifyAccessToken(accessToken);
      // Token valid or invalid - let the page handle refresh if needed
    } catch {
      // Token verification error - let the page handle it
    }
  }

  // Redirect authenticated users away from login page
  if (pathname === '/login' && accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      if (payload) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Invalid token, allow access to login page
      const response = NextResponse.next();
      response.cookies.delete('accessToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};