import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/audit";

const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirmDeletion: z.literal(true, {
    message: "You must confirm that you wish to delete your account.",
  }),
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
    const result = deleteAccountSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { password } = result.data;
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

    // Verify password if they have a local credentials password setup
    if (user.passwordHash) {
      if (!password) {
        return NextResponse.json(
          { error: "Password is required to confirm account deletion." },
          { status: 400 }
        );
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordCorrect) {
        await logSecurityEvent(userId, "ACCOUNT_DELETION_FAILURE", "Incorrect password submitted during deletion attempt");
        return NextResponse.json(
          { error: "Incorrect password. Account deletion aborted." },
          { status: 400 }
        );
      }
    }

    // Log the security event BEFORE deletion
    // SetNull relation will clear userId during transaction, keeping forensic details without user trace
    await logSecurityEvent(
      userId,
      "ACCOUNT_DELETION",
      `User ${user.email} permanently deleted their account.`
    );

    // Delete the user record (DB cascades to Account, Session, and Sets Null on AuditLog)
    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: "Your account has been permanently deleted. We are sorry to see you go." },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Account Deletion API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during account deletion. Please try again." },
      { status: 500 }
    );
  }
}
