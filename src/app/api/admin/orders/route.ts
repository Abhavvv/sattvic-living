import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";
import { Prisma, MealOrderStatus } from "@prisma/client";

// GET: Fetch all meal orders (Admin only)
export async function GET(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    const where: Prisma.MealOrderWhereInput = {};

    if (status && Object.values(MealOrderStatus).includes(status as MealOrderStatus)) {
      where.status = status as MealOrderStatus;
    }

    if (search) {
      where.OR = [
        {
          orderNumber: { contains: search, mode: "insensitive" },
        },
        {
          user: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          user: {
            email: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    // Date range filter based on order creation date
    if (startDateParam || endDateParam) {
      const dateFilter: Prisma.DateTimeFilter<"MealOrder"> = {};
      if (startDateParam) {
        dateFilter.gte = new Date(startDateParam);
      }
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
      where.createdAt = dateFilter;
    }

    const [orders, total] = await Promise.all([
      db.mealOrder.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          items: {
            include: {
              meal: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.mealOrder.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("❌ Admin Orders GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
