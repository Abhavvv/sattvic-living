import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { logSecurityEvent } from "@/lib/audit";

// Enforces strict password complexity policy
const passwordPolicy = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordPolicy,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate inputs
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new User in database (emailVerified is null by default)
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "USER", // Default role
      },
    });

    // Generate cryptographic verification token (valid for 24 hours)
    const verificationToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 3600 * 1000);

    // Store the verification token
    await db.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    });

    // Trigger activation email
    const mailResult = await sendVerificationEmail(email, verificationToken);

    // Log registration audit trail
    await logSecurityEvent(
      user.id,
      "REGISTER",
      `User ${email} registered. Verification token sent.`
    );

    return NextResponse.json(
      { 
        message: "Registration successful. Please verify your email to activate your account.",
        warning: mailResult.warning || null
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
