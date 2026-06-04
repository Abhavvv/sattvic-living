import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";
import { Prisma } from "@prisma/client";

const instructorCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-_]+$/,
      "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"
    ),
  bio: z.string().min(1, "Bio is required"),
  profileImage: z.string().nullable().optional(),
  certifications: z.string().nullable().optional(),
  specialization: z.string().min(1, "Specialization is required"),
  experienceYears: z.number().int().nonnegative("Experience years must be positive"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const instructorUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name cannot be empty").optional(),
  slug: z
    .string()
    .min(1, "Slug cannot be empty")
    .regex(
      /^[a-z0-9-_]+$/,
      "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"
    )
    .optional(),
  bio: z.string().min(1, "Bio cannot be empty").optional(),
  profileImage: z.string().nullable().optional(),
  certifications: z.string().nullable().optional(),
  specialization: z.string().min(1, "Specialization cannot be empty").optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// GET: Fetch all instructors or a single instructor
export async function GET(req: Request) {
  try {
    const session = await verifyAdmin();
    const isAdmin = !!session;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (id) {
      const instructor = await db.instructor.findUnique({
        where: { id },
      });
      if (!instructor || (!isAdmin && !instructor.isActive)) {
        return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
      }
      return NextResponse.json(instructor);
    }

    if (slug) {
      const instructor = await db.instructor.findUnique({
        where: { slug },
      });
      if (!instructor || (!isAdmin && !instructor.isActive)) {
        return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
      }
      return NextResponse.json(instructor);
    }

    const search = searchParams.get("search");

    const where: Prisma.InstructorWhereInput = {};
    if (!isAdmin) {
      where.isActive = true;
    } else {
      const activeParam = searchParams.get("isActive");
      if (activeParam !== null) {
        where.isActive = activeParam === "true";
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { specialization: { contains: search, mode: "insensitive" } },
        { certifications: { contains: search, mode: "insensitive" } },
      ];
    }

    const instructors = await db.instructor.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(instructors);
  } catch (error) {
    console.error("❌ Instructors GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new instructor
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
    const result = instructorCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const {
      name,
      slug,
      bio,
      profileImage,
      certifications,
      specialization,
      experienceYears,
      email,
      phone,
      isActive,
    } = result.data;

    // Check slug uniqueness
    const existing = await db.instructor.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "An instructor with this slug already exists." },
        { status: 400 }
      );
    }

    const instructor = await db.instructor.create({
      data: {
        name,
        slug,
        bio,
        profileImage: profileImage || null,
        certifications: certifications || null,
        specialization,
        experienceYears,
        email,
        phone: phone || null,
        isActive,
      },
    });

    return NextResponse.json(
      { message: "Instructor created successfully", instructor },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Instructors POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update an existing instructor
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
    const result = instructorUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const {
      id,
      name,
      slug,
      bio,
      profileImage,
      certifications,
      specialization,
      experienceYears,
      email,
      phone,
      isActive,
    } = result.data;

    // Check if instructor exists
    const instructorExists = await db.instructor.findUnique({ where: { id } });
    if (!instructorExists) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    // Check slug uniqueness if it is changing
    if (slug && slug !== instructorExists.slug) {
      const existing = await db.instructor.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json(
          { error: "An instructor with this slug already exists." },
          { status: 400 }
        );
      }
    }

    const updatedInstructor = await db.instructor.update({
      where: { id },
      data: {
        name,
        slug,
        bio,
        profileImage: profileImage !== undefined ? profileImage : undefined,
        certifications: certifications !== undefined ? certifications : undefined,
        specialization,
        experienceYears,
        email,
        phone: phone !== undefined ? phone : undefined,
        isActive,
      },
    });

    return NextResponse.json({
      message: "Instructor updated successfully",
      instructor: updatedInstructor,
    });
  } catch (error) {
    console.error("❌ Instructors PUT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete an instructor
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
      return NextResponse.json({ error: "Instructor ID is required" }, { status: 400 });
    }

    // Check if instructor exists
    const instructorExists = await db.instructor.findUnique({ where: { id } });
    if (!instructorExists) {
      return NextResponse.json({ error: "Instructor not found" }, { status: 404 });
    }

    // Delete instructor (will cascade delete classes and sessions due to onDelete: Cascade)
    await db.instructor.delete({ where: { id } });

    return NextResponse.json({ message: "Instructor deleted successfully" });
  } catch (error) {
    console.error("❌ Instructors DELETE API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
