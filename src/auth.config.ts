import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnProfile = nextUrl.pathname.startsWith("/profile");
      const isOnSettings = nextUrl.pathname.startsWith("/settings");

      // Secure settings, dashboard, and profile routes
      if (isOnDashboard || isOnProfile || isOnSettings) {
        if (isLoggedIn) return true;
        
        // Redirect unauthenticated users to /login
        return false;
      }
      
      // If user is logged in and tries to access /login or /signup, redirect to dashboard
      const isOnAuthRoute = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"].some(
        (path) => nextUrl.pathname.startsWith(path)
      );
      if (isOnAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Configured inside Node-compatible auth.ts to support db operations
} satisfies NextAuthConfig;
