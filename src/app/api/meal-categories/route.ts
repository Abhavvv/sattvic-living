import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 0; // Fresh database query results on every request

export async function GET() {
  try {
    const categories = await db.mealCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("❌ Meal Categories GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
