import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Logs a payment-related audit action to the database.
 */
export async function logPaymentAudit(
  paymentId: string,
  action: string,
  performedBy: string,
  metadata?: unknown,
  tx?: Prisma.TransactionClient
) {
  try {
    const client = tx || db;
    return await client.paymentAudit.create({
      data: {
        paymentId,
        action,
        performedBy,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  } catch (error) {
    console.error("❌ Payment Audit Logging Error:", error);
  }
}

/**
 * Retrieves the full audit history for a given payment.
 */
export async function getPaymentAuditHistory(paymentId: string) {
  return db.paymentAudit.findMany({
    where: { paymentId },
    orderBy: { createdAt: "desc" },
  });
}
