import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { createPayment, getPayments } from "@/services/payment.service";
import { PaymentProvider, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";

const adminPaymentCreateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  provider: z.nativeEnum(PaymentProvider).default(PaymentProvider.MANUAL),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).default("USD"),
  paymentMethod: z.nativeEnum(PaymentMethod),
  relatedEntityType: z.string().min(1, "Related entity type is required"),
  relatedEntityId: z.string().min(1, "Related entity ID is required"),
  metadata: z.record(z.string(), z.any()).optional(),
  status: z.nativeEnum(PaymentStatus).default(PaymentStatus.SUCCEEDED), // Default manual payment to succeeded
});

// GET: Fetch all payments (with filters, search, and aggregate stats)
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
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

    // Fetch payments list
    const results = await getPayments({
      search,
      status,
      provider,
      startDate,
      endDate,
      page,
      limit,
    });

    // Generate Admin Reporting Summary using optimized Prisma queries
    const statsWhere: Prisma.PaymentWhereInput = {};
    if (startDate || endDate) {
      statsWhere.createdAt = {};
      if (startDate) statsWhere.createdAt.gte = startDate;
      if (endDate) statsWhere.createdAt.lte = endDate;
    }

    const [
      totalCount,
      succeededStats,
      failedCount,
      refundedCount,
      recentList,
    ] = await Promise.all([
      db.payment.count({ where: statsWhere }),
      db.payment.aggregate({
        where: {
          ...statsWhere,
          status: PaymentStatus.SUCCEEDED,
        },
        _count: true,
        _sum: {
          amount: true,
        },
      }),
      db.payment.count({
        where: {
          ...statsWhere,
          status: PaymentStatus.FAILED,
        },
      }),
      db.payment.count({
        where: {
          ...statsWhere,
          status: PaymentStatus.REFUNDED,
        },
      }),
      db.payment.findMany({
        where: statsWhere,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    const stats = {
      totalPayments: totalCount,
      successfulPayments: succeededStats._count || 0,
      failedPayments: failedCount,
      refundedPayments: refundedCount,
      totalRevenue: succeededStats._sum.amount || 0,
      recentTransactions: recentList,
    };

    return NextResponse.json({
      ...results,
      stats,
    });
  } catch (error: unknown) {
    console.error("❌ Admin Payments GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a manual payment record (admin only)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const result = adminPaymentCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const payment = await createPayment(result.data);

    return NextResponse.json({
      message: "Manual payment logged successfully",
      payment,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("❌ Admin Payments POST API Error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
