import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { headers } from "next/headers";

import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { emailVerifyLimiter } from "@/lib/rate-limiter";
import { logSecurityEvent } from "@/lib/audit";

const resendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate inputs
    const result = resendSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Apply strict security rate limiting (max 3 resends per 10 minutes)
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || "127.0.0.1";
    const limitKey = `resend:${ip}:${email}`;
    if (emailVerifyLimiter.isRateLimited(limitKey)) {
      await logSecurityEvent(null, "RATE_LIMIT_EXCEEDED", `Email verification resend rate-limited: ${email} (IP: ${ip})`);
      return NextResponse.json(
        { error: "Too many requests. Please wait 10 minutes before requesting another verification email." },
        { status: 429 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    // Security best practice: Do not disclose if the email is registered
    if (!user) {
      return NextResponse.json(
        { message: "If your email is registered with us, a verification link has been sent to your inbox." },
        { status: 200 }
      );
    }

    // Check if user is already verified
    if (user.emailVerified !== null) {
      return NextResponse.json(
        { error: "This email address is already verified. Please sign in." },
        { status: 400 }
      );
    }

    // Generate cryptographic verification token (valid for 24 hours)
    const verificationToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 3600 * 1000);

    // Delete any existing verification tokens for this email to avoid duplicates
    await db.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Store the new verification token
    await db.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    });

    // Send email
    const mailResult = await sendVerificationEmail(email, verificationToken);

    // Log the security audit log
    await logSecurityEvent(
      user.id,
      "EMAIL_VERIFICATION_SENT",
      `A new verification token was sent to user ${email}.`
    );

    return NextResponse.json(
      { 
        message: "If your email is registered with us, a verification link has been sent to your inbox.",
        warning: mailResult.warning || null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Resend Verification Email API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
