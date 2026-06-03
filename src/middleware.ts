import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // 1. Role-Based Access Control (RBAC) Protection
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    // Block non-admins from entering the admin route group
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  // Generate standard Next.js Response
  const response = NextResponse.next();

  // 2. Enterprise-Grade Security Hardening Headers
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // Enforce correct mime types and prevent scripting sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Control referrer information sent with requests
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Older XSS protection header for backward compatibility
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Production-only HSTS (Strict Transport Security)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
});

export const config = {
  /*
   * Match all secure, administrative, and authentication-related paths:
   * - /dashboard (and subfolders)
   * - /profile (and subfolders)
   * - /settings (and subfolders)
   * - /admin (and subfolders)
   * - Auth flow pages (/login, /signup, /forgot-password, /reset-password, /verify-email)
   */
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
