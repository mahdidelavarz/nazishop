// import { updateSession } from "@/shared/lib/middleware";
// import { type NextRequest } from "next/server";
// // Adjust path as needed

// export async function middleware(request: NextRequest) {
//   console.log("middleware");  // For debugging
//   return await updateSession(request);
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all paths except static files, images, etc. (Supabase's recommended broad matcher)
//      */
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };