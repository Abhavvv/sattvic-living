import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createPayment, getPayments } from "@/services/payment.service";
import { PaymentProvider, PaymentMethod, PaymentStatus } from "@prisma/client";
import { headers } from "next/headers";
import { paymentLimiter } from "@/lib/rate-limiter";

const paymentCreateSchema = z.object({
  provider: z.nativeEnum(PaymentProvider),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).default("USD"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  relatedEntityType: z.string().min(1, "Related entity type is required"),
  relatedEntityId: z.string().min(1, "Related entity ID is required"),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
});

// GET: Fetch currently logged-in user's payments
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access. Please login." }, { status: 401 });
    }

    const userId = session.user.id;
    const dbUser = await db.user.findUnique({
      where: { id: userId },
    });
    if (!dbUser) {
      return NextResponse.json(
        { error: "Your session is invalid (User not found). Please log out and log back in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const statusParam = searchParams.get("status");
    const providerParam = searchParams.get("provider");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const status = statusParam && Object.values(PaymentStatus).includes(statusParam as PaymentStatus)
      ? (statusParam as PaymentStatus)
      : undefined;

    const provider = providerParam && Object.values(PaymentProvider).includes(providerParam as PaymentProvider)
      ? (providerParam as PaymentProvider)
      : undefined;

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const results = await getPayments({
      userId: session.user.id,
      search,
      status,
      provider,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json(results);
  } catch (error: unknown) {
    console.error("❌ User Payments GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new payment record (for starting checkout process)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access. Please login." }, { status: 401 });
    }
    const userId = session.user.id;
    const dbUser = await db.user.findUnique({
      where: { id: userId },
    });
    if (!dbUser) {
      return NextResponse.json(
        { error: "Your session is invalid (User not found). Please log out and log back in." },
        { status: 401 }
      );
    }

    // Apply strict payment rate limiting (max 10 operations per minute)
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || "127.0.0.1";
    const limitKey = `payment:${ip}:${userId}`;
    if (paymentLimiter.isRateLimited(limitKey)) {
      const { logSecurityEvent } = await import("@/lib/audit");
      await logSecurityEvent(userId, "RATE_LIMIT_EXCEEDED", `Payment initialization rate-limited (IP: ${ip})`);
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait 60 seconds before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = paymentCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const payment = await createPayment({
      userId: session.user.id,
      ...result.data,
    });

    return NextResponse.json({
      message: "Payment record created successfully",
      payment,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("❌ User Payments POST API Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
