import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/forms"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const isAuthenticated = !!req.nextauth?.token;

    // Protected routes require authentication
    if (pathname.startsWith("/dashboard") && !isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }

    // Redirect authenticated users from login/register to dashboard
    if (
      (pathname === "/login" || pathname === "/register") &&
      isAuthenticated
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Match all routes except for assets, api routes, etc.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
