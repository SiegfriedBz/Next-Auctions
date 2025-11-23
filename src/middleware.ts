import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "../utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. update user's auth session
  const response = await updateSession(request);

  // 2. Redirect logic
  // Skip if the path already starts with /en, /de, /fr or is an excluded path
  if (
    pathname.startsWith("/en") ||
    pathname.startsWith("/de") ||
    pathname.startsWith("/fr") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // Redirect to /en
  const newUrl = new URL(`/en${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
