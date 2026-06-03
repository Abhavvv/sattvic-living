import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/audit";

const passwordPolicy = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: passwordPolicy,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: Request) {
  try {
    // Authenticate the user session
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access. Please sign in." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate inputs
    const result = changePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;
    const userId = session.user.id;

    // Fetch user from DB
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    // Verify current password if they have a local password set up
    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change your password." },
          { status: 400 }
        );
      }

      const isCurrentPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!isCurrentPasswordCorrect) {
        await logSecurityEvent(userId, "PASSWORD_CHANGE_FAILURE", "Incorrect current password submitted");
        return NextResponse.json(
          { error: "Incorrect current password. Please verify and try again." },
          { status: 400 }
        );
      }
    }

    // Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Commit password change to DB
    await db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Log the security audit log
    await logSecurityEvent(
      userId,
      "PASSWORD_CHANGE",
      "User successfully updated account password."
    );

    return NextResponse.json(
      { message: "Your password has been changed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Password Change API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
