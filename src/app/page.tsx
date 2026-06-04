import { db } from "@/lib/db";
import { ArticleStatus, YogaClassStatus } from "@prisma/client";
import HomeClient from "@/components/home/HomeClient";
import { Metadata } from "next";

export const revalidate = 0; // Fresh database query results on every request

export const metadata: Metadata = {
  title: "Sattvic Living | Sanctuary for Conscious Wholeness",
  description: "Restore structural and biological harmony. Explore classical Yoga pathways, Ayurvedic metabolic analysis, and high-prana organic meal programs.",
};

export default async function HomePage() {
  // Query 3 featured published articles
  const articles = await db.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { category: true },
  });

  // Query 3 featured books
  const books = await db.book.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Query 3 featured published yoga classes
  const yogaClasses = await db.yogaClass.findMany({
    where: { status: YogaClassStatus.PUBLISHED },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { instructor: true },
  });

  // Query 3 active instructors
  const instructors = await db.instructor.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Query 4 active meals from database
  const meals = await db.sattvicMeal.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    take: 4,
  });

  return (
    <HomeClient
      initialArticles={articles}
      initialBooks={books}
      initialYogaClasses={yogaClasses}
      initialInstructors={instructors}
      initialMeals={meals}
    />
  );
}
