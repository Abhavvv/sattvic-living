import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";
import { BookingStatus, AttendanceStatus, Prisma } from "@prisma/client";
import {
  triggerBookingConfirmed,
  triggerBookingCancelled,
  triggerBookingCompleted,
} from "@/lib/notification-events";

const adminBookingUpdateSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  bookingStatus: z.nativeEnum(BookingStatus).optional(),
  attendanceStatus: z.nativeEnum(AttendanceStatus).optional(),
  notes: z.string().optional().nullable(),
});

// GET: Fetch all bookings for administration panel (Admin only)
export async function GET(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") as BookingStatus | null;
    const classIdParam = searchParams.get("classId");
    const instructorIdParam = searchParams.get("instructorId");
    const search = searchParams.get("search");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};

    if (statusParam) {
      where.bookingStatus = statusParam;
    }

    const yogaSessionFilter: Prisma.YogaSessionWhereInput = {};

    if (classIdParam) {
      yogaSessionFilter.classId = classIdParam;
    }

    if (instructorIdParam) {
      yogaSessionFilter.class = {
        instructorId: instructorIdParam,
      };
    }

    // Date range filter
    if (startDateParam || endDateParam) {
      const dateFilter: Prisma.DateTimeFilter<"YogaSession"> = {};
      if (startDateParam) {
        dateFilter.gte = new Date(startDateParam);
      }
      if (endDateParam) {
        // Set end time to end of day to cover entire day of selection
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
      yogaSessionFilter.startTime = dateFilter;
    }

    if (Object.keys(yogaSessionFilter).length > 0) {
      where.yogaSession = yogaSessionFilter;
    }

    // Fuzzy search
    if (search) {
      where.OR = [
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
        {
          yogaSession: {
            class: {
              title: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const [total, bookings] = await Promise.all([
      db.booking.count({ where }),
      db.booking.findMany({
        where,
        include: {
          user: true,
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
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      bookings,
    });
  } catch (error) {
    console.error("❌ Admin Bookings GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Modify booking state (Admin only)
export async function PUT(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = adminBookingUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { bookingId, bookingStatus, attendanceStatus, notes } = result.data;

    let updatedBooking;
    try {
      updatedBooking = await db.$transaction(async (tx) => {
        // Fetch current booking
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: { yogaSession: true },
        });

        if (!booking) {
          throw new Error("BOOKING_NOT_FOUND");
        }

        const dataToUpdate: Prisma.BookingUpdateInput = {};

        // Manage availableSeats dynamically when status is modified
        if (bookingStatus && bookingStatus !== booking.bookingStatus) {
          const oldStatus = booking.bookingStatus;
          const newStatus = bookingStatus;

          // Transitioning to CANCELLED: recover seat count
          if (newStatus === "CANCELLED" && oldStatus !== "CANCELLED") {
            await tx.yogaSession.update({
              where: { id: booking.yogaSessionId },
              data: {
                availableSeats: booking.yogaSession.availableSeats + 1,
              },
            });
          }
          // Transitioning from CANCELLED: decrement seat count
          else if (oldStatus === "CANCELLED" && newStatus !== "CANCELLED") {
            if (booking.yogaSession.availableSeats <= 0) {
              throw new Error("NO_SEATS_FOR_RESTORE");
            }
            await tx.yogaSession.update({
              where: { id: booking.yogaSessionId },
              data: {
                availableSeats: booking.yogaSession.availableSeats - 1,
              },
            });
          }

          dataToUpdate.bookingStatus = bookingStatus;
        }

        if (attendanceStatus) {
          dataToUpdate.attendanceStatus = attendanceStatus;
        }

        if (notes !== undefined) {
          dataToUpdate.notes = notes;
        }

        const updated = await tx.booking.update({
          where: { id: bookingId },
          data: dataToUpdate,
        });

        return { booking: updated, oldStatus: booking.bookingStatus };
      });
    } catch (txError: unknown) {
      const errMsg = txError instanceof Error ? txError.message : "";
      if (errMsg === "BOOKING_NOT_FOUND") {
        return NextResponse.json({ error: "Booking not found." }, { status: 404 });
      }
      if (errMsg === "NO_SEATS_FOR_RESTORE") {
        return NextResponse.json({ error: "Cannot restore this booking because the class session is fully booked." }, { status: 400 });
      }
      throw txError;
    }

    // Trigger appropriate notification hooks on state transitions
    const newStatus = updatedBooking.booking.bookingStatus;
    const oldStatus = updatedBooking.oldStatus;

    if (newStatus !== oldStatus) {
      if (newStatus === "CONFIRMED") {
        await triggerBookingConfirmed(updatedBooking.booking.id);
      } else if (newStatus === "CANCELLED") {
        await triggerBookingCancelled(updatedBooking.booking.id, true);
      } else if (newStatus === "COMPLETED") {
        await triggerBookingCompleted(updatedBooking.booking.id);
      }
    }

    return NextResponse.json({
      message: "Booking updated successfully.",
      booking: updatedBooking.booking,
    });
  } catch (error) {
    console.error("❌ Admin Bookings PUT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
