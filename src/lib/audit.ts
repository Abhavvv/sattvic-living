import { db } from "@/lib/db";
import { headers } from "next/headers";

/**
 * Logs a security event to the database for audit trailing.
 * Safely handles calls from non-request scopes (e.g. static compilation).
 */
export async function logSecurityEvent(
  userId: string | null,
  action: string,
  details?: string
) {
  try {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    try {
      const reqHeaders = await headers();
      ipAddress = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip");
      userAgent = reqHeaders.get("user-agent");
    } catch {
      // Safe fallback when headers() is called outside dynamic route evaluation
    }

    await db.auditLog.create({
      data: {
        userId,
        action,
        details: details || null,
        ipAddress: ipAddress || "unknown",
        userAgent: userAgent || "unknown",
      },
    });
  } catch (error) {
    console.error("❌ Audit Logging Error:", error);
  }
}
