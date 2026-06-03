import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";

const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"),
  description: z.string().nullable().optional(),
});

const categoryUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  name: z.string().min(1, "Name cannot be empty").optional(),
  slug: z.string().min(1, "Slug cannot be empty").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores").optional(),
  description: z.string().nullable().optional(),
});

// GET: Fetch all categories or a single category
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (id) {
      const category = await db.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: { articles: true, ayurvedaContent: true }
          }
        }
      });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json(category);
    }

    if (slug) {
      const category = await db.category.findUnique({
        where: { slug },
        include: {
          _count: {
            select: { articles: true, ayurvedaContent: true }
          }
        }
      });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      return NextResponse.json(category);
    }

    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { articles: true, ayurvedaContent: true }
        }
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("❌ Categories GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new category
export async function POST(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = categoryCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { name, slug, description } = result.data;

    // Check slug uniqueness
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A category with this slug already exists." }, { status: 400 });
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    return NextResponse.json({ message: "Category created successfully", category }, { status: 201 });
  } catch (error) {
    console.error("❌ Categories POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update an existing category
export async function PUT(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = categoryUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { id, name, slug, description } = result.data;

    // Check if category exists
    const categoryExists = await db.category.findUnique({ where: { id } });
    if (!categoryExists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check slug uniqueness if it is changing
    if (slug && slug !== categoryExists.slug) {
      const existing = await db.category.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: "A category with this slug already exists." }, { status: 400 });
      }
    }

    const updatedCategory = await db.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description !== undefined ? description : undefined,
      },
    });

    return NextResponse.json({ message: "Category updated successfully", category: updatedCategory });
  } catch (error) {
    console.error("❌ Categories PUT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a category
export async function DELETE(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    // Check if category exists
    const categoryExists = await db.category.findUnique({ where: { id } });
    if (!categoryExists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("❌ Categories DELETE API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
