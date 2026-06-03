import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate inputs
    const result = forgotPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    // Security best practice: Do not disclose whether the email exists or not.
    // Instead, return a generic success message.
    if (!user) {
      console.log(`ℹ️ [Forgot Password] Reset requested for non-existent email: ${email}`);
      return NextResponse.json(
        { message: "If your email is registered with us, you will receive a password reset link shortly." },
        { status: 200 }
      );
    }

    // Generate secure token (cryptographic uuid)
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hour validity

    // Delete any existing reset tokens for this email to prevent spam/stacking
    await db.passwordResetToken.deleteMany({
      where: { email },
    });

    // Create the PasswordResetToken
    await db.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Send the email
    const mailResult = await sendPasswordResetEmail(email, token);

    return NextResponse.json(
      { 
        message: "If your email is registered with us, you will receive a password reset link shortly.",
        warning: mailResult.warning || null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Forgot Password API Error:", error);
    return NextResponse.json(
      { error: "The password reset service is temporarily unavailable. Please try again later." },
      { status: 500 }
    );
  }
}
