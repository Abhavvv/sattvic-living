import { db } from "@/lib/db";
import BooksClient from "@/components/cms/BooksClient";
import FadeUp from "@/components/animations/FadeUp";
import { Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh database query results

export default async function AdminBooksPage() {
  const books = await db.book.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-sage/15 pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
              <Sparkles size={11} className="text-accent-gold" />
              Sacred Literature Repository
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
              Sacred Books Library
            </h1>
            <p className="text-xs text-foreground/60 font-light">
              Add translations, upload digital cover illustrations, attach PDF versions, and configure access permissions.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Client view */}
      <FadeUp delay={0.05}>
        <BooksClient books={books} />
      </FadeUp>
    </div>
  );
}
