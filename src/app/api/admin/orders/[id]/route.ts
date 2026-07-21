import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";
import { MealOrderStatus } from "@prisma/client";
import { sendOrderStatusEmail } from "@/lib/mail";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: Update meal order status (Admin only)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status || !Object.values(MealOrderStatus).includes(status as MealOrderStatus)) {
      return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
    }

    const newStatus = status as MealOrderStatus;

    // Use a database transaction to retrieve and update the order
    let updatedOrder;
    try {
      updatedOrder = await db.$transaction(async (tx) => {
        const order = await tx.mealOrder.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                email: true,
              },
            },
            items: {
              include: {
                meal: true,
              },
            },
          },
        });

        if (!order) {
          throw new Error("ORDER_NOT_FOUND");
        }

        // Restrict transitions if order has reached a final state
        if (order.status === "DELIVERED" || order.status === "CANCELLED") {
          throw new Error("FINAL_STATE");
        }

        // Ensure cancellation constraints
        if (newStatus === "CANCELLED") {
          if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
            throw new Error("NOT_CANCELLABLE");
          }
        }

        // Update the order status
        const updated = await tx.mealOrder.update({
          where: { id },
          data: {
            status: newStatus,
          },
          include: {
            user: {
              select: {
                email: true,
              },
            },
            items: {
              include: {
                meal: true,
              },
            },
          },
        });

        return updated;
      });
    } catch (txError: unknown) {
      const errMsg = txError instanceof Error ? txError.message : "";
      if (errMsg === "ORDER_NOT_FOUND") {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }
      if (errMsg === "FINAL_STATE") {
        return NextResponse.json({ error: "Cannot modify status of an order already marked as DELIVERED or CANCELLED." }, { status: 400 });
      }
      if (errMsg === "NOT_CANCELLABLE") {
        return NextResponse.json({ error: "Cannot cancel order. It is already in preparation or delivery." }, { status: 400 });
      }
      throw txError;
    }

    // Trigger order status email update
    if (updatedOrder.user.email) {
      const itemsListHtml = updatedOrder.items
        .map(
          (item) =>
            `<div>• <strong>${item.meal.name}</strong> x ${item.quantity} ($${item.unitPrice.toFixed(2)} each)</div>`
        )
        .join("");

      await sendOrderStatusEmail(
        updatedOrder.user.email,
        updatedOrder.orderNumber,
        newStatus,
        itemsListHtml,
        updatedOrder.totalAmount
      );
    }

    return NextResponse.json({
      message: `Order status updated to ${newStatus} successfully.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Admin Order PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
