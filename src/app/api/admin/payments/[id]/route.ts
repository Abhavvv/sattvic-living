import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPaymentById, updatePaymentStatus } from "@/services/payment.service";
import { PaymentStatus } from "@prisma/client";

const paymentUpdateSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
  reason: z.string().optional(),
});

// GET: Fetch detailed payment record, user details, invoice details, and audit history
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    const payment = await getPaymentById(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    return NextResponse.json(payment);
  } catch (error: unknown) {
    console.error("❌ Admin Payment ID GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Manually update status of a transaction (e.g., mark as REFUNDED, CANCELLED, SUCCEEDED)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = paymentUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { status, reason } = result.data;

    // Use current admin's email or ID for audit trail
    const performer = `ADMIN:${session.user.email || session.user.id}`;

    const updatedPayment = await updatePaymentStatus(id, status, performer, {
      reason: reason || "Manual status change by administrator",
    });

    return NextResponse.json({
      message: "Payment status updated successfully",
      payment: updatedPayment,
    });
  } catch (error: unknown) {
    console.error("❌ Admin Payment ID PATCH API Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
