import { NextResponse } from "next/server";
import { z } from "zod";
import { YogaClassStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";

const classCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-_]+$/,
      "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"
    ),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  duration: z.number().int().positive("Duration must be a positive number of minutes"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  price: z.number().nonnegative("Price cannot be negative"),
  featuredImage: z.string().nullable().optional(),
  isOnline: z.boolean().optional().default(false),
  status: z.nativeEnum(YogaClassStatus).optional().default(YogaClassStatus.DRAFT),
  instructorId: z.string().min(1, "Instructor is required"),
});

const classUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title cannot be empty").optional(),
  slug: z
    .string()
    .min(1, "Slug cannot be empty")
    .regex(
      /^[a-z0-9-_]+$/,
      "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"
    )
    .optional(),
  description: z.string().min(1, "Description cannot be empty").optional(),
  category: z.string().min(1, "Category cannot be empty").optional(),
  difficulty: z.string().min(1, "Difficulty cannot be empty").optional(),
  duration: z.number().int().positive().optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().nonnegative().optional(),
  featuredImage: z.string().nullable().optional(),
  isOnline: z.boolean().optional(),
  status: z.nativeEnum(YogaClassStatus).optional(),
  instructorId: z.string().min(1, "Instructor cannot be empty").optional(),
});

// GET: Fetch all classes or a single class
export async function GET(req: Request) {
  try {
    const session = await verifyAdmin();
    const isAdmin = !!session;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const instructorId = searchParams.get("instructorId");
    const isOnlineParam = searchParams.get("isOnline");

    if (id) {
      const yogaClass = await db.yogaClass.findUnique({
        where: { id },
        include: { instructor: true, sessions: { orderBy: { startTime: "asc" } } },
      });
      if (!yogaClass || (!isAdmin && yogaClass.status !== YogaClassStatus.PUBLISHED)) {
        return NextResponse.json({ error: "Class not found" }, { status: 404 });
      }
      return NextResponse.json(yogaClass);
    }

    if (slug) {
      const yogaClass = await db.yogaClass.findUnique({
        where: { slug },
        include: { instructor: true, sessions: { orderBy: { startTime: "asc" } } },
      });
      if (!yogaClass || (!isAdmin && yogaClass.status !== YogaClassStatus.PUBLISHED)) {
        return NextResponse.json({ error: "Class not found" }, { status: 404 });
      }
      return NextResponse.json(yogaClass);
    }

    // Build filter query
    const where: Prisma.YogaClassWhereInput = {};

    if (!isAdmin) {
      where.status = YogaClassStatus.PUBLISHED;
    } else {
      const statusParam = searchParams.get("status");
      if (statusParam) {
        where.status = statusParam as YogaClassStatus;
      }
    }

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (instructorId) {
      where.instructorId = instructorId;
    }

    if (isOnlineParam !== null && isOnlineParam !== undefined && isOnlineParam !== "") {
      where.isOnline = isOnlineParam === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const classes = await db.yogaClass.findMany({
      where,
      include: { instructor: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("❌ YogaClasses GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new class
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
    const result = classCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const {
      title,
      slug,
      description,
      category,
      difficulty,
      duration,
      capacity,
      price,
      featuredImage,
      isOnline,
      status,
      instructorId,
    } = result.data;

    // Check slug uniqueness
    const existing = await db.yogaClass.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A class with this slug already exists." },
        { status: 400 }
      );
    }

    // Verify instructor exists
    const instructorExists = await db.instructor.findUnique({ where: { id: instructorId } });
    if (!instructorExists) {
      return NextResponse.json({ error: "Selected instructor does not exist." }, { status: 400 });
    }

    const yogaClass = await db.yogaClass.create({
      data: {
        title,
        slug,
        description,
        category,
        difficulty,
        duration,
        capacity,
        price,
        featuredImage: featuredImage || null,
        isOnline,
        status,
        instructorId,
      },
      include: { instructor: true },
    });

    return NextResponse.json(
      { message: "Yoga class created successfully", yogaClass },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ YogaClasses POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update an existing class
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
    const result = classUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const {
      id,
      title,
      slug,
      description,
      category,
      difficulty,
      duration,
      capacity,
      price,
      featuredImage,
      isOnline,
      status,
      instructorId,
    } = result.data;

    // Check if class exists
    const classExists = await db.yogaClass.findUnique({ where: { id } });
    if (!classExists) {
      return NextResponse.json({ error: "Yoga class not found" }, { status: 404 });
    }

    // Check slug uniqueness if it is changing
    if (slug && slug !== classExists.slug) {
      const existing = await db.yogaClass.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json(
          { error: "A class with this slug already exists." },
          { status: 400 }
        );
      }
    }

    // Verify instructor exists if provided
    if (instructorId) {
      const instructorExists = await db.instructor.findUnique({ where: { id: instructorId } });
      if (!instructorExists) {
        return NextResponse.json({ error: "Selected instructor does not exist." }, { status: 400 });
      }
    }

    const updatedClass = await db.yogaClass.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        category,
        difficulty,
        duration,
        capacity,
        price,
        featuredImage: featuredImage !== undefined ? featuredImage : undefined,
        isOnline,
        status,
        instructorId,
      },
      include: { instructor: true },
    });

    return NextResponse.json({
      message: "Yoga class updated successfully",
      yogaClass: updatedClass,
    });
  } catch (error) {
    console.error("❌ YogaClasses PUT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a class
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
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    // Check if class exists
    const classExists = await db.yogaClass.findUnique({ where: { id } });
    if (!classExists) {
      return NextResponse.json({ error: "Yoga class not found" }, { status: 404 });
    }

    // Delete class (will cascade delete sessions due to onDelete: Cascade)
    await db.yogaClass.delete({ where: { id } });

    return NextResponse.json({ message: "Yoga class deleted successfully" });
  } catch (error) {
    console.error("❌ YogaClasses DELETE API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
