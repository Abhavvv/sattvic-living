import { db } from "@/lib/db";
import ClassesClient from "@/components/cms/ClassesClient";
import FadeUp from "@/components/animations/FadeUp";
import { Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh database query results

export default async function AdminClassesPage() {
  const [classes, instructors] = await Promise.all([
    db.yogaClass.findMany({
      orderBy: { createdAt: "desc" },
      include: { instructor: { select: { id: true, name: true } } },
    }),
    db.instructor.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Serialize Date objects safely to ISO strings
  const serializedClasses = classes.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      {/* Title block */}
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-sage/15 pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
              <Sparkles size={11} className="text-accent-gold" />
              Yoga Lineages & Lineup
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
              Manage Yoga Classes
            </h1>
            <p className="text-xs text-foreground/60 font-light">
              Design new yoga courses, select categories, define level difficulties, assign guides, adjust hourly pricing, and toggle streaming formats.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Client CMS Table View */}
      <FadeUp delay={0.05}>
        <ClassesClient classes={serializedClasses} instructors={instructors} />
      </FadeUp>
    </div>
  );
}
