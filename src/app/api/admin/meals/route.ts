import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";
import { Prisma } from "@prisma/client";

const mealCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"),
  shortDescription: z.string().min(1, "Short description is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().nullable().optional(),
  categoryId: z.string().min(1, "Category ID is required"),
  price: z.number().min(0, "Price must be a positive number"),
  calories: z.number().int().min(0, "Calories must be positive"),
  protein: z.number().int().min(0, "Protein must be positive"),
  carbs: z.number().int().min(0, "Carbohydrates must be positive"),
  fat: z.number().int().min(0, "Fat must be positive"),
  ingredients: z.string().min(1, "Ingredients description is required"),
  benefits: z.string().min(1, "Benefits description is required"),
  preparationNotes: z.string().min(1, "Preparation notes are required"),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

const mealUpdateSchema = mealCreateSchema.partial().extend({
  id: z.string().min(1, "ID is required"),
});

export async function GET(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || ""; // published | featured | available
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    const skip = (page - 1) * limit;

    const whereClause: Prisma.MealWhereInput = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (status) {
      if (status === "published") whereClause.isPublished = true;
      if (status === "featured") whereClause.isFeatured = true;
      if (status === "available") whereClause.isAvailable = true;
      if (status === "unpublished") whereClause.isPublished = false;
      if (status === "unavailable") whereClause.isAvailable = false;
    }

    const [meals, totalCount] = await Promise.all([
      db.meal.findMany({
        where: whereClause,
        include: { category: true },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      db.meal.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      meals,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error("❌ Admin Meals GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = mealCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    // Check slug uniqueness
    const existing = await db.meal.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "A meal with this slug already exists." }, { status: 400 });
    }

    // Verify category exists
    const category = await db.mealCategory.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });
    }

    const meal = await db.meal.create({
      data: {
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        image: data.image || null,
        categoryId: data.categoryId,
        price: data.price,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        ingredients: data.ingredients,
        benefits: data.benefits,
        preparationNotes: data.preparationNotes,
        isFeatured: data.isFeatured ?? false,
        isPublished: data.isPublished ?? false,
        isAvailable: data.isAvailable ?? true,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
      },
    });

    return NextResponse.json({ message: "Meal created successfully", meal }, { status: 201 });
  } catch (error) {
    console.error("❌ Admin Meals POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = mealUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const data = result.data;

    const mealExists = await db.meal.findUnique({ where: { id: data.id } });
    if (!mealExists) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    if (data.slug && data.slug !== mealExists.slug) {
      const existing = await db.meal.findUnique({ where: { slug: data.slug } });
      if (existing) {
        return NextResponse.json({ error: "A meal with this slug already exists." }, { status: 400 });
      }
    }

    if (data.categoryId) {
      const category = await db.mealCategory.findUnique({ where: { id: data.categoryId } });
      if (!category) {
        return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });
      }
    }

    const updated = await db.meal.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        image: data.image !== undefined ? data.image : undefined,
        categoryId: data.categoryId,
        price: data.price,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        ingredients: data.ingredients,
        benefits: data.benefits,
        preparationNotes: data.preparationNotes,
        isFeatured: data.isFeatured,
        isPublished: data.isPublished,
        isAvailable: data.isAvailable,
        metaTitle: data.metaTitle !== undefined ? data.metaTitle : undefined,
        metaDescription: data.metaDescription !== undefined ? data.metaDescription : undefined,
      },
    });

    return NextResponse.json({ message: "Meal updated successfully", meal: updated });
  } catch (error) {
    console.error("❌ Admin Meals PUT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Meal ID is required" }, { status: 400 });
    }

    const mealExists = await db.meal.findUnique({ where: { id } });
    if (!mealExists) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    await db.meal.delete({ where: { id } });

    return NextResponse.json({ message: "Meal deleted successfully" });
  } catch (error) {
    console.error("❌ Admin Meals DELETE API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
