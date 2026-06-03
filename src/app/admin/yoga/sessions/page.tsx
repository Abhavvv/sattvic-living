import { db } from "@/lib/db";
import SessionsClient from "@/components/cms/SessionsClient";
import FadeUp from "@/components/animations/FadeUp";
import { Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh database query results

export default async function AdminSessionsPage() {
  const [sessions, classes] = await Promise.all([
    db.yogaSession.findMany({
      orderBy: { startTime: "asc" },
      include: {
        class: {
          select: {
            id: true,
            title: true,
            capacity: true,
            isOnline: true,
          },
        },
      },
    }),
    db.yogaClass.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        capacity: true,
        isOnline: true,
      },
    }),
  ]);

  // Serialize Date objects safely to ISO strings
  const serializedSessions = sessions.map((item) => ({
    ...item,
    startTime: item.startTime.toISOString(),
    endTime: item.endTime.toISOString(),
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
              Calendar Timetable Scheduler
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
              Manage Yoga Sessions
            </h1>
            <p className="text-xs text-foreground/60 font-light">
              Schedule timetable sessions for published classes, coordinate physical studio rooms or stream links, check seats capacity, and toggle statuses.
            </p>
          </div>
        </div>
      </FadeUp>

      {/* Client CMS Table View */}
      <FadeUp delay={0.05}>
        <SessionsClient sessions={serializedSessions} classes={classes} />
      </FadeUp>
    </div>
  );
}
