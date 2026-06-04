import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { headers } from "next/headers";

import { db } from "@/lib/db";
import { authConfig } from "./auth.config";
import { loginLimiter } from "@/lib/rate-limiter";
import { logSecurityEvent } from "@/lib/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true, // Links credentials user and Google login automagically if emails match
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Apply brute-force security check per IP & Email combination
        const reqHeaders = await headers();
        const ip = reqHeaders.get("x-forwarded-for") || "127.0.0.1";
        const limitKey = `login:${ip}:${email}`;
        if (loginLimiter.isRateLimited(limitKey)) {
          await logSecurityEvent(null, "LOGIN_FAILURE", `Email: ${email} - Rate limited (IP: ${ip})`);
          throw new Error("Too many login attempts. Please try again in 1 minute.");
        }

        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          await logSecurityEvent(null, "LOGIN_FAILURE", `Email: ${email} - Non-existent credentials`);
          return null;
        }

        // Enforce Email Verification: Block login if user email is not verified yet
        if (user.emailVerified === null) {
          await logSecurityEvent(user.id, "LOGIN_FAILURE", `Email: ${email} - Email not verified`);
          throw new Error("EmailNotVerified");
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if (passwordsMatch) {
          // Reset rate-limiter for this user on success
          loginLimiter.reset(limitKey);
          
          // Log standard credentials success
          await logSecurityEvent(user.id, "LOGIN_SUCCESS", `Email: ${email} (Credentials)`);
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            phone: user.phone,
            bio: user.bio,
          };
        }

        // Log credentials failure
        await logSecurityEvent(user.id, "LOGIN_FAILURE", `Email: ${email} - Incorrect password`);
        return null;
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      await logSecurityEvent(
        user.id || null,
        "REGISTER",
        `User: ${user.email} registered successfully.`
      );
    },
    async signIn({ user, account }) {
      // Log successful OAuth logins (Google, etc.) as Credentials logins are logged directly in authorize
      if (account && account.provider !== "credentials") {
        await logSecurityEvent(
          user.id || null,
          "LOGIN_SUCCESS",
          `Email: ${user.email} (OAuth: ${account.provider})`
        );
      }
    },
    async signOut(message) {
      if ("token" in message && message.token && message.token.id) {
        await logSecurityEvent(message.token.id as string, "LOGOUT", `User ended session.`);
      }
    },
    async linkAccount({ user, account }) {
      await logSecurityEvent(
        user.id || null,
        "ACCOUNT_LINK",
        `Linked account provider: ${account.provider} to user ${user.email}`
      );
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.bio = user.bio;
      }

      // Sync custom updates from the client profile form dynamically
      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.phone = session.phone ?? token.phone;
        token.bio = session.bio ?? token.bio;
        token.picture = session.image ?? token.picture;
      }

      // Sync active database changes periodically for existing sessions
      if (!user && token.sub) {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: {
            name: true,
            image: true,
            phone: true,
            bio: true,
            role: true,
          },
        });
        if (dbUser) {
          token.name = dbUser.name;
          token.role = dbUser.role;
          token.phone = dbUser.phone;
          token.bio = dbUser.bio;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.phone = token.phone as string | null;
        session.user.bio = token.bio as string | null;
        if (token.name) session.user.name = token.name;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
  },
});
