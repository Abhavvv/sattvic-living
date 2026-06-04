import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Prisma } from "@prisma/client";
import { triggerBookingCreated } from "@/lib/notification-events";
import { bookingLimiter } from "@/lib/rate-limiter";
import { logSecurityEvent } from "@/lib/audit";

const bookingCreateSchema = z.object({
  yogaSessionId: z.string().min(1, "Yoga session ID is required"),
  notes: z.string().optional().nullable(),
});

// GET: Fetch logged-in user's bookings
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access. Please login." }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "upcoming", "past", "cancelled", or "all"

    const where: Prisma.BookingWhereInput = { userId };

    const now = new Date();

    if (type === "upcoming") {
      where.bookingStatus = { in: ["CONFIRMED", "PENDING"] };
      where.yogaSession = {
        startTime: { gte: now },
      };
    } else if (type === "past") {
      where.OR = [
        { bookingStatus: "COMPLETED" },
        {
          yogaSession: {
            startTime: { lt: now },
          },
          bookingStatus: { not: "CANCELLED" }
        }
      ];
    } else if (type === "cancelled") {
      where.bookingStatus = "CANCELLED";
    }

    const bookings = await db.booking.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("❌ Bookings GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new booking (seeker)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access. Please login." }, { status: 401 });
    }

    const user = session.user;
    const body = await req.json();
    const result = bookingCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { yogaSessionId, notes } = result.data;

    // Apply strict booking rate limiter (max 10 booking requests per 60 seconds)
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || "127.0.0.1";
    const limitKey = `booking:${ip}:${user.id}`;
    if (bookingLimiter.isRateLimited(limitKey)) {
      await logSecurityEvent(user.id, "RATE_LIMIT_EXCEEDED", `Booking creation rate-limited: session ${yogaSessionId} (IP: ${ip})`);
      return NextResponse.json(
        { error: "Too many booking attempts. Please wait 60 seconds before trying again." },
        { status: 429 }
      );
    }

    // Use Prisma transaction to ensure seat count accuracy and prevent race conditions
    let bookingResult;
    try {
      bookingResult = await db.$transaction(async (tx) => {
        // Retrieve the session
        const yogaSession = await tx.yogaSession.findUnique({
          where: { id: yogaSessionId },
          include: { class: true },
        });

        if (!yogaSession) {
          throw new Error("SESSION_NOT_FOUND");
        }

        if (yogaSession.class.status !== "PUBLISHED") {
          throw new Error("CLASS_NOT_PUBLISHED");
        }

        if (yogaSession.status === "CANCELLED") {
          throw new Error("SESSION_CANCELLED");
        }

        if (new Date(yogaSession.startTime) <= new Date()) {
          throw new Error("SESSION_PAST");
        }

        if (yogaSession.availableSeats <= 0) {
          throw new Error("NO_SEATS_AVAILABLE");
        }

        // Check if user already booked it
        const existing = await tx.booking.findUnique({
          where: {
            userId_yogaSessionId: {
              userId: user.id!,
              yogaSessionId,
            },
          },
        });

        if (existing) {
          if (existing.bookingStatus === "CANCELLED") {
            // Re-activate existing cancelled booking instead of creating a new one
            const updated = await tx.booking.update({
              where: { id: existing.id },
              data: {
                bookingStatus: "CONFIRMED",
                attendanceStatus: "NOT_MARKED",
                notes: notes || null,
              },
            });
            
            await tx.yogaSession.update({
              where: { id: yogaSessionId },
              data: { availableSeats: yogaSession.availableSeats - 1 },
            });

            return { isNew: false, booking: updated };
          } else {
            throw new Error("ALREADY_BOOKED");
          }
        }

        // Decrement seats
        await tx.yogaSession.update({
          where: { id: yogaSessionId },
          data: { availableSeats: yogaSession.availableSeats - 1 },
        });

        // Create booking
        const newBooking = await tx.booking.create({
          data: {
            userId: user.id!,
            yogaSessionId,
            bookingStatus: "CONFIRMED",
            attendanceStatus: "NOT_MARKED",
            notes: notes || null,
          },
        });

        return { isNew: true, booking: newBooking };
      });
    } catch (txError: unknown) {
      const errMsg = txError instanceof Error ? txError.message : "";
      if (errMsg === "SESSION_NOT_FOUND") {
        return NextResponse.json({ error: "Session does not exist." }, { status: 404 });
      }
      if (errMsg === "CLASS_NOT_PUBLISHED") {
        return NextResponse.json({ error: "Selected class is not available for booking." }, { status: 400 });
      }
      if (errMsg === "SESSION_CANCELLED") {
        return NextResponse.json({ error: "Selected session is cancelled." }, { status: 400 });
      }
      if (errMsg === "SESSION_PAST") {
        return NextResponse.json({ error: "Cannot book a session that has already started." }, { status: 400 });
      }
      if (errMsg === "NO_SEATS_AVAILABLE") {
        return NextResponse.json({ error: "No available seats left for this session." }, { status: 400 });
      }
      if (errMsg === "ALREADY_BOOKED") {
        return NextResponse.json({ error: "You have already booked this session." }, { status: 400 });
      }
      throw txError;
    }

    // Trigger hook in background/async
    await triggerBookingCreated(bookingResult.booking.id);

    return NextResponse.json(
      {
        message: bookingResult.isNew ? "Booking created successfully" : "Booking re-confirmed successfully",
        booking: bookingResult.booking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Bookings POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
