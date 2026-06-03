import { NextResponse } from "next/server";
import { z } from "zod";
import { ArticleStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";

const articleCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().nullable().optional(),
  status: z.nativeEnum(ArticleStatus).optional().default(ArticleStatus.DRAFT),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
});

const articleUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title cannot be empty").optional(),
  slug: z.string().min(1, "Slug cannot be empty").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores").optional(),
  excerpt: z.string().nullable().optional(),
  content: z.string().min(1, "Content cannot be empty").optional(),
  featuredImage: z.string().nullable().optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.string().nullable().optional(),
});

// GET: Fetch all articles or a single article
export async function GET(req: Request) {
  try {
    const session = await verifyAdmin();
    const isAdmin = !!session;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (id) {
      const article = await db.article.findUnique({
        where: { id },
        include: { category: true }
      });
      if (!article || (!isAdmin && article.status !== ArticleStatus.PUBLISHED)) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      return NextResponse.json(article);
    }

    if (slug) {
      const article = await db.article.findUnique({
        where: { slug },
        include: { category: true }
      });
      if (!article || (!isAdmin && article.status !== ArticleStatus.PUBLISHED)) {
        return NextResponse.json({ error: "Article not found" }, { status: 404 });
      }
      return NextResponse.json(article);
    }

    const search = searchParams.get("search");

    const where: Prisma.ArticleWhereInput = {};
    if (!isAdmin) {
      where.status = ArticleStatus.PUBLISHED;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    const articles = await db.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true }
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("❌ Articles GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new article
export async function POST(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = articleCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status,
      metaTitle,
      metaDescription,
      publishedAt,
      categoryId,
      tags,
    } = result.data;

    // Check slug uniqueness
    const existing = await db.article.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "An article with this slug already exists." }, { status: 400 });
    }

    // Verify category exists if provided
    if (categoryId) {
      const categoryExists = await db.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });
      }
    }

    const article = await db.article.create({
      data: {
        title,
        slug,
        excerpt: excerpt || null,
        content,
        featuredImage: featuredImage || null,
        status,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        publishedAt: publishedAt || (status === ArticleStatus.PUBLISHED ? new Date() : null),
        categoryId: categoryId || null,
        tags: tags || null,
      },
      include: { category: true }
    });

    return NextResponse.json({ message: "Article created successfully", article }, { status: 201 });
  } catch (error) {
    console.error("❌ Articles POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update an existing article
export async function PUT(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = articleUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const {
      id,
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status,
      metaTitle,
      metaDescription,
      publishedAt,
      categoryId,
      tags,
    } = result.data;

    // Check if article exists
    const articleExists = await db.article.findUnique({ where: { id } });
    if (!articleExists) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Check slug uniqueness if it is changing
    if (slug && slug !== articleExists.slug) {
      const existing = await db.article.findUnique({ where: { slug } });
      if (existing) {
        return NextResponse.json({ error: "An article with this slug already exists." }, { status: 400 });
      }
    }

    // Verify category exists if provided
    if (categoryId) {
      const categoryExists = await db.category.findUnique({ where: { id: categoryId } });
      if (!categoryExists) {
        return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });
      }
    }

    // Determine publishedAt date if status is changing to PUBLISHED
    let finalPublishedAt = publishedAt;
    if (status === ArticleStatus.PUBLISHED && articleExists.status !== ArticleStatus.PUBLISHED && !publishedAt) {
      finalPublishedAt = new Date();
    }

    const updatedArticle = await db.article.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt: excerpt !== undefined ? excerpt : undefined,
        content,
        featuredImage: featuredImage !== undefined ? featuredImage : undefined,
        status,
        metaTitle: metaTitle !== undefined ? metaTitle : undefined,
        metaDescription: metaDescription !== undefined ? metaDescription : undefined,
        publishedAt: finalPublishedAt !== undefined ? finalPublishedAt : undefined,
        categoryId: categoryId !== undefined ? categoryId : undefined,
        tags: tags !== undefined ? tags : undefined,
      },
      include: { category: true }
    });

    return NextResponse.json({ message: "Article updated successfully", article: updatedArticle });
  } catch (error) {
    console.error("❌ Articles PUT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete an article
export async function DELETE(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    // Check if article exists
    const articleExists = await db.article.findUnique({ where: { id } });
    if (!articleExists) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await db.article.delete({ where: { id } });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("❌ Articles DELETE API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
