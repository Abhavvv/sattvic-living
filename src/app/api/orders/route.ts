import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Prisma, MealOrderStatus } from "@prisma/client";
import { sendOrderStatusEmail } from "@/lib/mail";
import { headers } from "next/headers";
import { orderLimiter } from "@/lib/rate-limiter";

const orderCreateSchema = z.object({
  deliveryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid delivery date",
  }),
  deliveryNotes: z.string().optional().nullable(),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
  address: z.string().min(5, "Delivery address must be at least 5 characters"),
  items: z.array(
    z.object({
      mealId: z.string().min(1, "Meal ID is required"),
      quantity: z.number().int().min(1, "Quantity must be at least 1"),
    })
  ).min(1, "At least one meal item is required"),
});

// GET: Fetch user's order history
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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.MealOrderWhereInput = {
      userId,
    };

    if (search) {
      where.orderNumber = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (status) {
      // Validate status corresponds to MealOrderStatus enum
      if (Object.values(MealOrderStatus).includes(status as MealOrderStatus)) {
        where.status = status as MealOrderStatus;
      }
    }

    const [orders, total] = await Promise.all([
      db.mealOrder.findMany({
        where,
        include: {
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
    console.error("❌ Orders GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Place a new meal order
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized access. Please login." }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const dbUser = await db.user.findUnique({
      where: { id: userId },
    });
    if (!dbUser) {
      return NextResponse.json(
        { error: "Your session is invalid (User not found). Please log out and log back in." },
        { status: 401 }
      );
    }

    // Apply strict order placement rate limiting (max 5 orders per minute)
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || "127.0.0.1";
    const limitKey = `order:${ip}:${userId}`;
    if (orderLimiter.isRateLimited(limitKey)) {
      const { logSecurityEvent } = await import("@/lib/audit");
      await logSecurityEvent(userId, "RATE_LIMIT_EXCEEDED", `Meal order placement rate-limited (IP: ${ip})`);
      return NextResponse.json(
        { error: "Too many order attempts. Please wait 60 seconds before trying again." },
        { status: 429 }
      );
    }
    const body = await req.json();
    const result = orderCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { deliveryDate, deliveryNotes, phone, address, items } = result.data;
    const deliveryDateObj = new Date(deliveryDate);

    // Enforce future delivery date
    if (deliveryDateObj <= new Date()) {
      return NextResponse.json({ error: "Delivery date must be in the future." }, { status: 400 });
    }

    // Verify meals exist and are published & available
    const mealIds = items.map((item) => item.mealId);
    const meals = await db.meal.findMany({
      where: {
        id: { in: mealIds },
        isPublished: true,
      },
    });

    if (meals.length !== mealIds.length) {
      return NextResponse.json({ error: "One or more selected meals are unavailable or do not exist." }, { status: 400 });
    }

    const unavailableMeal = meals.find((m) => !m.isAvailable);
    if (unavailableMeal) {
      return NextResponse.json({ error: `Meal "${unavailableMeal.name}" is currently out of stock.` }, { status: 400 });
    }

    let retries = 3;
    let order = null;

    while (retries > 0) {
      try {
        order = await db.$transaction(async (tx) => {
          // Generate unique order number SL-YYYY-XXXXX
          const currentYear = new Date().getFullYear();
          const startOfYear = new Date(currentYear, 0, 1);
          const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

          const lastOrder = await tx.mealOrder.findFirst({
            where: {
              createdAt: {
                gte: startOfYear,
                lte: endOfYear,
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            select: {
              orderNumber: true,
            },
          });

          let nextSeq = 1;
          if (lastOrder) {
            const parts = lastOrder.orderNumber.split("-");
            if (parts.length === 3) {
              const lastSeq = parseInt(parts[2], 10);
              if (!isNaN(lastSeq)) {
                nextSeq = lastSeq + 1;
              }
            }
          }
          const orderNumber = `SL-${currentYear}-${String(nextSeq).padStart(5, "0")}`;

          // Calculate totals based on live DB prices
          let totalAmount = 0;
          const itemsData = [];

          for (const item of items) {
            const dbMeal = meals.find((m) => m.id === item.mealId)!;
            const unitPrice = dbMeal.price;
            const totalPrice = unitPrice * item.quantity;
            totalAmount += totalPrice;

            itemsData.push({
              mealId: item.mealId,
              quantity: item.quantity,
              unitPrice,
              totalPrice,
            });
          }

          // Create the order
          const newOrder = await tx.mealOrder.create({
            data: {
              orderNumber,
              userId,
              totalAmount,
              status: "PENDING",
              deliveryDate: deliveryDateObj,
              deliveryNotes: deliveryNotes || null,
              addressSnapshot: address,
              phoneSnapshot: phone,
              items: {
                create: itemsData,
              },
            },
            include: {
              items: {
                include: {
                  meal: true,
                },
              },
            },
          });

          return newOrder;
        });
        break; // Success! Break retry loop
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          retries--;
          if (retries === 0) throw error;
        } else {
          throw error;
        }
      }
    }

    if (!order) {
      return NextResponse.json({ error: "Failed to place order due to server conflict. Please try again." }, { status: 500 });
    }

    // Trigger order placement email notification
    const itemsListHtml = order.items
      .map(
        (item) =>
          `<div>• <strong>${item.meal.name}</strong> x ${item.quantity} ($${item.unitPrice.toFixed(2)} each)</div>`
      )
      .join("");

    await sendOrderStatusEmail(userEmail, order.orderNumber, "PENDING", itemsListHtml, order.totalAmount);

    return NextResponse.json(
      {
        message: "Order placed successfully.",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Orders POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
