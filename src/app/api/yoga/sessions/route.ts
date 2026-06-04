import { NextResponse } from "next/server";
import { z } from "zod";
import { YogaSessionStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";

const sessionCreateSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  location: z.string().min(1, "Location is required"),
  meetingLink: z.string().nullable().optional(),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  status: z.nativeEnum(YogaSessionStatus).optional().default(YogaSessionStatus.SCHEDULED),
});

const sessionUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  classId: z.string().min(1, "Class cannot be empty").optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  location: z.string().min(1, "Location cannot be empty").optional(),
  meetingLink: z.string().nullable().optional(),
  capacity: z.number().int().positive().optional(),
  status: z.nativeEnum(YogaSessionStatus).optional(),
});

// GET: Fetch all sessions or a single session
export async function GET(req: Request) {
  try {
    const session = await verifyAdmin();
    const isAdmin = !!session;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const classId = searchParams.get("classId");
    const statusParam = searchParams.get("status");
    const upcomingParam = searchParams.get("upcoming");
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    if (id) {
      const yogaSession = await db.yogaSession.findUnique({
        where: { id },
        include: { class: { include: { instructor: true } } },
      });
      if (!yogaSession || (!isAdmin && yogaSession.status !== YogaSessionStatus.SCHEDULED)) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
      return NextResponse.json(yogaSession);
    }

    // Build filter query
    const where: Prisma.YogaSessionWhereInput = {};
    const startTimeFilter: Prisma.DateTimeFilter<"YogaSession"> = {};

    if (!isAdmin) {
      where.status = YogaSessionStatus.SCHEDULED;
      where.class = { status: "PUBLISHED" };
      startTimeFilter.gte = new Date(); // Only future sessions for public
    } else {
      if (statusParam) {
        where.status = statusParam as YogaSessionStatus;
      }
    }

    if (classId) {
      where.classId = classId;
    }

    if (upcomingParam === "true") {
      startTimeFilter.gte = new Date();
      where.status = YogaSessionStatus.SCHEDULED;
    }

    if (startDateParam) {
      startTimeFilter.gte = new Date(startDateParam);
    }
    if (endDateParam) {
      startTimeFilter.lte = new Date(endDateParam);
    }

    if (Object.keys(startTimeFilter).length > 0) {
      where.startTime = startTimeFilter;
    }

    const sessions = await db.yogaSession.findMany({
      where,
      include: { class: { include: { instructor: true } } },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error("❌ YogaSessions GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Schedule a new session
export async function POST(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = sessionCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { classId, startTime, endTime, location, meetingLink, capacity, status } = result.data;

    // Validate times
    if (endTime <= startTime) {
      return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
    }

    // Verify class exists
    const classExists = await db.yogaClass.findUnique({ where: { id: classId } });
    if (!classExists) {
      return NextResponse.json({ error: "Selected yoga class does not exist." }, { status: 400 });
    }

    const yogaSession = await db.yogaSession.create({
      data: {
        classId,
        startTime,
        endTime,
        location,
        meetingLink: meetingLink || null,
        capacity,
        availableSeats: capacity, // starts equal to capacity since no bookings exist
        status,
      },
      include: { class: { include: { instructor: true } } },
    });

    return NextResponse.json(
      { message: "Yoga session scheduled successfully", session: yogaSession },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ YogaSessions POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update an existing scheduled session
export async function PUT(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = sessionUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { id, classId, startTime, endTime, location, meetingLink, capacity, status } =
      result.data;

    // Check if session exists
    const sessionExists = await db.yogaSession.findUnique({ where: { id } });
    if (!sessionExists) {
      return NextResponse.json({ error: "Yoga session not found" }, { status: 404 });
    }

    // Validate times if changing
    const finalStart = startTime || sessionExists.startTime;
    const finalEnd = endTime || sessionExists.endTime;
    if (finalEnd <= finalStart) {
      return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });
    }

    // Verify class exists if changing
    if (classId) {
      const classExists = await db.yogaClass.findUnique({ where: { id: classId } });
      if (!classExists) {
        return NextResponse.json({ error: "Selected yoga class does not exist." }, { status: 400 });
      }
    }

    // Calculate available seats if capacity is updated
    let newAvailableSeats = sessionExists.availableSeats;
    if (capacity !== undefined) {
      const seatsBooked = sessionExists.capacity - sessionExists.availableSeats;
      newAvailableSeats = Math.max(0, capacity - seatsBooked);
    }

    const updatedSession = await db.yogaSession.update({
      where: { id },
      data: {
        classId,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        location,
        meetingLink: meetingLink !== undefined ? meetingLink : undefined,
        capacity,
        availableSeats: capacity !== undefined ? newAvailableSeats : undefined,
        status,
      },
      include: { class: { include: { instructor: true } } },
    });

    return NextResponse.json({
      message: "Yoga session updated successfully",
      session: updatedSession,
    });
  } catch (error) {
    console.error("❌ YogaSessions PUT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Cancel/delete a scheduled session
export async function DELETE(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized access. Admin privileges required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Check if session exists
    const sessionExists = await db.yogaSession.findUnique({ where: { id } });
    if (!sessionExists) {
      return NextResponse.json({ error: "Yoga session not found" }, { status: 404 });
    }

    await db.yogaSession.delete({ where: { id } });

    return NextResponse.json({ message: "Yoga session deleted successfully" });
  } catch (error) {
    console.error("❌ YogaSessions DELETE API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
