import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "recipe-auth";

export function middleware(request: NextRequest) {
  // Allow login/logout API routes
  if (
    request.nextUrl.pathname === "/api/login" ||
    request.nextUrl.pathname === "/api/logout"
  ) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(COOKIE_NAME);

  if (authCookie?.value === process.env.AUTH_SECRET) {
    return NextResponse.next();
  }

  // Redirect to login page
  if (request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login (login page itself)
     * - /api/login (login API)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, icons, manifest
     */
    "/((?!login|api/login|_next/static|_next/image|favicon.ico|icons|manifest.json).*)",
  ],
};
