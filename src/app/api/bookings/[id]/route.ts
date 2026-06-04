import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { triggerBookingCancelled } from "@/lib/notification-events";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Fetch details of a specific booking (belongs to owner or admin)
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access. Please login." }, { status: 401 });
    }

    const { id } = await params;

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        yogaSession: {
          include: {
            class: {
              include: {
                instructor: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // Owner and Admin checks
    const isOwner = booking.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden. You do not own this booking." }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error(`❌ Booking GET ID (${req.url}) Error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Cancel booking (seeker action)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access. Please login." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (body.action !== "cancel") {
      return NextResponse.json({ error: "Invalid action. Supported actions: 'cancel'." }, { status: 400 });
    }

    // Prisma Transaction for cancellation to increment seat count securely
    let bookingResult;
    try {
      bookingResult = await db.$transaction(async (tx) => {
        // Fetch booking
        const booking = await tx.booking.findUnique({
          where: { id },
          include: { yogaSession: true },
        });

        if (!booking) {
          throw new Error("BOOKING_NOT_FOUND");
        }

        // Verify ownership
        if (booking.userId !== session.user.id) {
          throw new Error("UNAUTHORIZED");
        }

        // Verify status is cancellable
        if (booking.bookingStatus === "CANCELLED") {
          throw new Error("ALREADY_CANCELLED");
        }

        if (booking.bookingStatus !== "CONFIRMED" && booking.bookingStatus !== "PENDING") {
          throw new Error("NOT_CANCELLABLE");
        }

        // Verify session hasn't started yet
        if (new Date(booking.yogaSession.startTime) <= new Date()) {
          throw new Error("SESSION_ALREADY_STARTED");
        }

        // Update booking status
        const updated = await tx.booking.update({
          where: { id },
          data: {
            bookingStatus: "CANCELLED",
          },
        });

        // Increment available seats
        await tx.yogaSession.update({
          where: { id: booking.yogaSessionId },
          data: {
            availableSeats: booking.yogaSession.availableSeats + 1,
          },
        });

        return updated;
      });
    } catch (txError: unknown) {
      const errMsg = txError instanceof Error ? txError.message : "";
      if (errMsg === "BOOKING_NOT_FOUND") {
        return NextResponse.json({ error: "Booking not found." }, { status: 404 });
      }
      if (errMsg === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Forbidden. You do not own this booking." }, { status: 403 });
      }
      if (errMsg === "ALREADY_CANCELLED") {
        return NextResponse.json({ error: "Booking is already cancelled." }, { status: 400 });
      }
      if (errMsg === "NOT_CANCELLABLE") {
        return NextResponse.json({ error: "Cannot cancel a booking that is completed or marked as no-show." }, { status: 400 });
      }
      if (errMsg === "SESSION_ALREADY_STARTED") {
        return NextResponse.json({ error: "Cannot cancel a session that has already started." }, { status: 400 });
      }
      throw txError;
    }

    // Trigger background hook
    await triggerBookingCancelled(bookingResult.id, false);

    return NextResponse.json({
      message: "Booking cancelled successfully.",
      booking: bookingResult,
    });
  } catch (error) {
    console.error(`❌ Booking PUT ID (${req.url}) Error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
