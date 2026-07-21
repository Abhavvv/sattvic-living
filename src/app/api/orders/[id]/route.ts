import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { sendOrderStatusEmail } from "@/lib/mail";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Fetch details of a specific meal order
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access. Please login." }, { status: 401 });
    }

    const { id } = await params;

    const order = await db.mealOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            meal: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Owner and Admin authorization check
    const isOwner = order.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden. You do not own this order." }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error(`❌ Order GET ID Error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Cancel a meal order (user action)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized access. Please login." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.action !== "cancel") {
      return NextResponse.json({ error: "Invalid action. Supported actions: 'cancel'." }, { status: 400 });
    }

    // Database transaction to securely update order status
    let orderResult;
    try {
      orderResult = await db.$transaction(async (tx) => {
        const order = await tx.mealOrder.findUnique({
          where: { id },
          include: {
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

        // Verify ownership
        if (order.userId !== session.user.id) {
          throw new Error("UNAUTHORIZED");
        }

        // Verify status
        if (order.status === "CANCELLED") {
          throw new Error("ALREADY_CANCELLED");
        }

        // Restrict cancellation past CONFIRMED
        if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
          throw new Error("NOT_CANCELLABLE");
        }

        // Update status to CANCELLED
        const updatedOrder = await tx.mealOrder.update({
          where: { id },
          data: {
            status: "CANCELLED",
          },
          include: {
            items: {
              include: {
                meal: true,
              },
            },
          },
        });

        return updatedOrder;
      });
    } catch (txError: unknown) {
      const errMsg = txError instanceof Error ? txError.message : "";
      if (errMsg === "ORDER_NOT_FOUND") {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }
      if (errMsg === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Forbidden. You do not own this order." }, { status: 403 });
      }
      if (errMsg === "ALREADY_CANCELLED") {
        return NextResponse.json({ error: "Order is already cancelled." }, { status: 400 });
      }
      if (errMsg === "NOT_CANCELLABLE") {
        return NextResponse.json({ error: "Cannot cancel order. It is already in preparation or delivery process." }, { status: 400 });
      }
      throw txError;
    }

    // Send email status notification
    const itemsListHtml = orderResult.items
      .map(
        (item) =>
          `<div>• <strong>${item.meal.name}</strong> x ${item.quantity} ($${item.unitPrice.toFixed(2)} each)</div>`
      )
      .join("");

    await sendOrderStatusEmail(session.user.email, orderResult.orderNumber, "CANCELLED", itemsListHtml, orderResult.totalAmount);

    return NextResponse.json({
      message: "Order cancelled successfully.",
      order: orderResult,
    });
  } catch (error) {
    console.error(`❌ Order PUT ID Error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
