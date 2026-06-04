import { db } from "@/lib/db";
import ArticlesClient from "@/components/cms/ArticlesClient";
import FadeUp from "@/components/animations/FadeUp";
import { Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh database query results

export default async function AdminArticlesPage() {
  const [articles, categories] = await Promise.all([
    db.article.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Serialize Date objects safely to ISO strings for cross-boundary transfer
  const serializedArticles = articles.map(item => ({
    ...item,
    publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      {/* Title */}
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-sage/15 pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
              <Sparkles size={11} className="text-accent-gold" />
              Wisdom & Philosophy Publication Hub
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
              Wisdom Articles
            </h1>
            <p className="text-xs text-foreground/60 font-light">
              Write seasonal guidance, edit essays on Vedic traditions, configure SEO tags, and assign categories to articles.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Client view */}
      <FadeUp delay={0.05}>
        <ArticlesClient articles={serializedArticles} categories={categories} />
      </FadeUp>
    </div>
  );
}
