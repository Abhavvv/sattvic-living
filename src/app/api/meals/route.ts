import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export const revalidate = 0; // Fresh database query results on every request

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const isAvailableStr = searchParams.get("isAvailable");
    const isFeaturedStr = searchParams.get("isFeatured");
    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");
    const minProteinStr = searchParams.get("minProtein");
    const maxCaloriesStr = searchParams.get("maxCalories");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "9", 10);

    const skip = (page - 1) * limit;

    const whereClause: Prisma.MealWhereInput = {
      isPublished: true, // Only show published meals to public
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      whereClause.category = {
        OR: [
          { slug: category },
          { id: category }
        ]
      };
    }

    if (isAvailableStr !== null && isAvailableStr !== "") {
      whereClause.isAvailable = isAvailableStr === "true";
    }

    if (isFeaturedStr !== null && isFeaturedStr !== "") {
      whereClause.isFeatured = isFeaturedStr === "true";
    }

    if (minPriceStr || maxPriceStr) {
      whereClause.price = {};
      if (minPriceStr) whereClause.price.gte = parseFloat(minPriceStr);
      if (maxPriceStr) whereClause.price.lte = parseFloat(maxPriceStr);
    }

    if (minProteinStr) {
      whereClause.protein = { gte: parseInt(minProteinStr, 10) };
    }

    if (maxCaloriesStr) {
      whereClause.calories = { lte: parseInt(maxCaloriesStr, 10) };
    }

    const [meals, totalCount] = await Promise.all([
      db.meal.findMany({
        where: whereClause,
        include: { category: true },
        orderBy: { name: "asc" },
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
    console.error("❌ Meals GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
