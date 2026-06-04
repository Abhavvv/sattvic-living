import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/audit";

const verifySchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate inputs
    const result = verifySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token } = result.data;

    // Search for verification token
    const tokenRecord = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid verification link. The link may have already been used." },
        { status: 400 }
      );
    }

    // Check expiration
    const isExpired = new Date() > new Date(tokenRecord.expires);
    if (isExpired) {
      // Remove expired token
      await db.verificationToken.delete({
        where: { token },
      });

      return NextResponse.json(
        { error: "This verification link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Find the user by the email stored in token identifier
    const user = await db.user.findUnique({
      where: { email: tokenRecord.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No user found associated with this verification link." },
        { status: 400 }
      );
    }

    // Perform database operations in a transaction (Activate user and consume token)
    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.delete({
        where: { token },
      }),
    ]);

    // Log the security audit log
    await logSecurityEvent(
      user.id,
      "EMAIL_VERIFIED",
      `User ${user.email} verified email successfully.`
    );

    return NextResponse.json(
      { message: "Your email has been verified successfully. You can now sign in." },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Email Verification API Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during email verification. Please try again." },
      { status: 500 }
    );
  }
}
