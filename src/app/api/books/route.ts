import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";
import { Prisma } from "@prisma/client";

const bookCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"),
  description: z.string().min(1, "Description is required"),
  author: z.string().min(1, "Author is required"),
  coverImage: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  isPremium: z.boolean().optional().default(false),
});

const bookUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title cannot be empty").optional(),
  slug: z.string().min(1, "Slug cannot be empty").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores").optional(),
  description: z.string().min(1, "Description cannot be empty").optional(),
  author: z.string().min(1, "Author cannot be empty").optional(),
  coverImage: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  isPremium: z.boolean().optional(),
});

// GET: Fetch all books or a single book
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (id) {
      const book = await db.book.findUnique({ where: { id } });
      if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }
      return NextResponse.json(book);
    }

    if (slug) {
      const book = await db.book.findUnique({ where: { slug } });
      if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }
      return NextResponse.json(book);
    }

    const search = searchParams.get("search");

    const where: Prisma.BookWhereInput = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
      ];
    }

    const books = await db.book.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error("❌ Books GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new book
export async function POST(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = bookCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { title, slug, description, author, coverImage, pdfUrl, isPremium } = result.data;

    // Check slug uniqueness
    const existing = await db.book.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A book with this slug already exists." }, { status: 400 });
    }

    const book = await db.book.create({
      data: {
        title,
        slug,
        description,
        author,
        coverImage: coverImage || null,
        pdfUrl: pdfUrl || null,
        isPremium,
      },
    });

    return NextResponse.json({ message: "Book created successfully", book }, { status: 201 });
  } catch (error) {
    console.error("❌ Books POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update an existing book
export async function PUT(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = bookUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { id, title, slug, description, author, coverImage, pdfUrl, isPremium } = result.data;

    // Check if book exists
    const bookExists = await db.book.findUnique({ where: { id } });
    if (!bookExists) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Check slug uniqueness if it is changing
    if (slug && slug !== bookExists.slug) {
      const existing = await db.book.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: "A book with this slug already exists." }, { status: 400 });
      }
    }

    const updatedBook = await db.book.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        author,
        coverImage: coverImage !== undefined ? coverImage : undefined,
        pdfUrl: pdfUrl !== undefined ? pdfUrl : undefined,
        isPremium,
      },
    });

    return NextResponse.json({ message: "Book updated successfully", book: updatedBook });
  } catch (error) {
    console.error("❌ Books PUT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a book
export async function DELETE(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    // Check if book exists
    const bookExists = await db.book.findUnique({ where: { id } });
    if (!bookExists) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    await db.book.delete({ where: { id } });

    return NextResponse.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("❌ Books DELETE API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
