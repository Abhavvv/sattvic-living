import { db } from "@/lib/db";
import AyurvedaClient from "@/components/cms/AyurvedaClient";
import FadeUp from "@/components/animations/FadeUp";
import { Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh database query results

export default async function AdminAyurvedaPage() {
  const [contents, categories] = await Promise.all([
    db.ayurvedaContent.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Map Date to String safely if needed or serialize it
  const serializedContents = contents.map(item => ({
    ...item,
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
              Dosha Wisdom & Somatic Healing
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
              Ayurveda Learning Guides
            </h1>
            <p className="text-xs text-foreground/60 font-light">
              Create diet recipes, publish guidelines for biological doshas, upload descriptive featured graphics, and categorize guidance.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Client view */}
      <FadeUp delay={0.05}>
        <AyurvedaClient contents={serializedContents} categories={categories} />
      </FadeUp>
    </div>
  );
}
