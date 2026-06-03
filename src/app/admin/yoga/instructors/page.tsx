import { db } from "@/lib/db";
import InstructorsClient from "@/components/cms/InstructorsClient";
import FadeUp from "@/components/animations/FadeUp";
import { Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh database query results

export default async function AdminInstructorsPage() {
  const instructors = await db.instructor.findMany({
    orderBy: { name: "asc" },
  });

  // Serialize Date objects safely to ISO strings
  const serializedInstructors = instructors.map((item) => ({
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
              Yoga Instructors Registry
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
              Manage Instructors
            </h1>
            <p className="text-xs text-foreground/60 font-light">
              Add registered yoga guides, edit teacher descriptions, certifications, specialized lineages, and profile visual assets.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Client CMS Table View */}
      <FadeUp delay={0.05}>
        <InstructorsClient instructors={serializedInstructors} />
      </FadeUp>
    </div>
  );
}
