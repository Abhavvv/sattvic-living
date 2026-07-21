import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPaymentById } from "@/services/payment.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access. Please login." }, { status: 401 });
    }

    const { id } = await params;
    const payment = await getPaymentById(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
    }

    // Verify ownership: User can only access their own payment records
    if (payment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. You do not own this transaction." }, { status: 403 });
    }

    return NextResponse.json(payment);
  } catch (error: unknown) {
    console.error("❌ User Payment ID GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
