import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import AyurvedaPageClient from "@/components/ayurveda/AyurvedaPageClient";
import { Metadata } from "next";

export const revalidate = 0; // Fresh database query results on every request

export const metadata: Metadata = {
  title: "Ayurveda | Determine Your Dosha | Sattvic Living",
  description: "Take the classical metabolic Prakriti Dosha Quiz. Understand your structural biology and browse health guidelines.",
};

export default async function AyurvedaPage() {
  // Query published articles to display in the articles section
  const articles = await db.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  return <AyurvedaPageClient initialArticles={articles} />;
}
