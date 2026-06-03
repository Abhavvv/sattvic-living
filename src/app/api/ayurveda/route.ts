import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";
import { ArticleStatus, Prisma } from "@prisma/client";

const ayurvedaCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().nullable().optional(),
  status: z.nativeEnum(ArticleStatus).optional().default(ArticleStatus.DRAFT),
  categoryId: z.string().nullable().optional(),
});

const ayurvedaUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title cannot be empty").optional(),
  slug: z.string().min(1, "Slug cannot be empty").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores").optional(),
  content: z.string().min(1, "Content cannot be empty").optional(),
  featuredImage: z.string().nullable().optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  categoryId: z.string().nullable().optional(),
});

// GET: Fetch all ayurveda content or a single item
export async function GET(req: Request) {
  try {
    const session = await verifyAdmin();
    const isAdmin = !!session;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (id) {
      const content = await db.ayurvedaContent.findUnique({
        where: { id },
        include: { category: true }
      });
      if (!content || (!isAdmin && content.status !== ArticleStatus.PUBLISHED)) {
        return NextResponse.json({ error: "Ayurveda content not found" }, { status: 404 });
      }
      return NextResponse.json(content);
    }

    if (slug) {
      const content = await db.ayurvedaContent.findUnique({
        where: { slug },
        include: { category: true }
      });
      if (!content || (!isAdmin && content.status !== ArticleStatus.PUBLISHED)) {
        return NextResponse.json({ error: "Ayurveda content not found" }, { status: 404 });
      }
      return NextResponse.json(content);
    }

    const search = searchParams.get("search");

    const where: Prisma.AyurvedaContentWhereInput = {};
    if (!isAdmin) {
      where.status = ArticleStatus.PUBLISHED;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const contents = await db.ayurvedaContent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true }
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error("❌ Ayurveda GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create new ayurveda content
export async function POST(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = ayurvedaCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { title, slug, content, featuredImage, status, categoryId } = result.data;

    // Check slug uniqueness
    const existing = await db.ayurvedaContent.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "An Ayurveda guide with this slug already exists." }, { status: 400 });
    }

    // Verify category exists if provided
    if (categoryId) {
      const categoryExists = await db.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });
      }
    }

    const ayurvedaContent = await db.ayurvedaContent.create({
      data: {
        title,
        slug,
        content,
        featuredImage: featuredImage || null,
        status,
        categoryId: categoryId || null,
      },
      include: { category: true }
    });

    return NextResponse.json({ message: "Ayurveda content created successfully", ayurvedaContent }, { status: 201 });
  } catch (error) {
    console.error("❌ Ayurveda POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update existing ayurveda content
export async function PUT(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = ayurvedaUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { id, title, slug, content, featuredImage, status, categoryId } = result.data;

    // Check if item exists
    const contentExists = await db.ayurvedaContent.findUnique({ where: { id } });
    if (!contentExists) {
      return NextResponse.json({ error: "Ayurveda content not found" }, { status: 404 });
    }

    // Check slug uniqueness if it is changing
    if (slug && slug !== contentExists.slug) {
      const existing = await db.ayurvedaContent.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: "An Ayurveda guide with this slug already exists." }, { status: 400 });
      }
    }

    // Verify category exists if provided
    if (categoryId) {
      const categoryExists = await db.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });
      }
    }

    const updatedContent = await db.ayurvedaContent.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        featuredImage: featuredImage !== undefined ? featuredImage : undefined,
        status,
        categoryId: categoryId !== undefined ? categoryId : undefined,
      },
      include: { category: true }
    });

    return NextResponse.json({ message: "Ayurveda content updated successfully", ayurvedaContent: updatedContent });
  } catch (error) {
    console.error("❌ Ayurveda PUT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete ayurveda content
export async function DELETE(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Check if item exists
    const contentExists = await db.ayurvedaContent.findUnique({ where: { id } });
    if (!contentExists) {
      return NextResponse.json({ error: "Ayurveda content not found" }, { status: 404 });
    }

    await db.ayurvedaContent.delete({ where: { id } });

    return NextResponse.json({ message: "Ayurveda content deleted successfully" });
  } catch (error) {
    console.error("❌ Ayurveda DELETE API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
