import { db } from "@/lib/db";
import MealCategoriesClient from "@/components/admin/MealCategoriesClient";
import FadeUp from "@/components/animations/FadeUp";
import { Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh database query results on every request

export default async function AdminMealCategoriesPage() {
  const categories = await db.mealCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          meals: true,
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
              Dietary Taxonomy
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
              Meal Categories
            </h1>
            <p className="text-xs text-foreground/60 font-light">
              Classify and manage high-prana organic foods, elixirs, and adaptogenic bedtime bowls.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Main Client UI */}
      <FadeUp delay={0.05}>
        <MealCategoriesClient initialCategories={categories} />
      </FadeUp>
    </div>
  );
}
