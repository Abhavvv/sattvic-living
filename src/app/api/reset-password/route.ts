import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate inputs
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Find token in database
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired password reset token. Please request a new link." },
        { status: 400 }
      );
    }

    // Check if token has expired
    const hasExpired = new Date() > new Date(resetToken.expires);
    if (hasExpired) {
      // Clean up expired token
      await db.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      return NextResponse.json(
        { error: "This password reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find the corresponding user
    const user = await db.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found associated with this email address." },
        { status: 400 }
      );
    }

    // Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update the user's password and delete the token in a transaction
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      db.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return NextResponse.json(
      { message: "Your password has been successfully reset. You may now log in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Reset Password API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
