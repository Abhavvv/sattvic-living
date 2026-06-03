import { db } from "@/lib/db";
import CategoriesClient from "@/components/cms/CategoriesClient";
import FadeUp from "@/components/animations/FadeUp";
import { Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh db data

export default async function AdminCategoriesPage() {
  // Query all categories along with count of articles and guides linked
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          articles: true,
          ayurvedaContent: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-sage/15 pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
              <Sparkles size={11} className="text-accent-gold" />
              Taxonomy Classification
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
              Categories
            </h1>
            <p className="text-xs text-foreground/60 font-light">
              Organize articles, wellness programs, and Ayurveda guides into unified content groupings.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Main Client UI */}
      <FadeUp delay={0.05}>
        <CategoriesClient categories={categories} />
      </FadeUp>
    </div>
  );
}
