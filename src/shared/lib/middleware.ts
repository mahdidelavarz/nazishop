// import { createServerClient } from '@supabase/ssr';
// import { NextResponse, type NextRequest } from 'next/server';

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,  // Or use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
//           supabaseResponse = NextResponse.next({
//             request,
//           });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           );
//         },
//       },
//     }
//   );

//   // Refresh and get user (this auto-handles session/token refresh)
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   // Your protected route logic: Redirect only if unauth'd *and* on protected path
//   const { pathname } = request.nextUrl;
//   const protectedPaths = ["/cart", "/profile", "/checkout"];
//   const isProtected = protectedPaths.some(path => pathname.startsWith(path));
//   const isAuthPath = pathname.startsWith('/login') || pathname.startsWith('/auth/callback');

//   if (!user && isProtected && !isAuthPath) {
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("redirectedFrom", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // Return the response as-is (Supabase handles cookie sync)
//   return supabaseResponse;
// }