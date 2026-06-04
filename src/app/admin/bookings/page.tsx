import { db } from "@/lib/db";
import BookingsAdminClient from "@/components/admin/BookingsAdminClient";
import FadeUp from "@/components/animations/FadeUp";
import { Sparkles } from "lucide-react";

export const revalidate = 0; // Fresh database query results

export default async function AdminBookingsPage() {
  const [classes, instructors, initialData] = await Promise.all([
    db.yogaClass.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true },
    }),
    db.instructor.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.booking.findMany({
      take: 8,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        yogaSession: {
          include: {
            class: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    profileImage: true,
                    specialization: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const totalBookings = await db.booking.count();

  // Serialize Date objects safely to ISO strings
  const serializedInitialBookings = initialData.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    user: {
      ...b.user,
      createdAt: b.user.createdAt.toISOString(),
      updatedAt: b.user.updatedAt.toISOString(),
    },
    yogaSession: {
      ...b.yogaSession,
      startTime: b.yogaSession.startTime.toISOString(),
      endTime: b.yogaSession.endTime.toISOString(),
      createdAt: b.yogaSession.createdAt.toISOString(),
      updatedAt: b.yogaSession.updatedAt.toISOString(),
      class: {
        ...b.yogaSession.class,
        createdAt: b.yogaSession.class.createdAt.toISOString(),
        updatedAt: b.yogaSession.class.updatedAt.toISOString(),
        instructor: {
          ...b.yogaSession.class.instructor,
          createdAt: b.yogaSession.class.instructor.createdAt.toISOString(),
          updatedAt: b.yogaSession.class.instructor.updatedAt.toISOString(),
        },
      },
    },
  }));

  return (
    <div className="space-y-8">
      <FadeUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-sage/15 pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
              <Sparkles size={11} className="text-accent-gold" />
              Yoga Bookings Control Center
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
              Manage Bookings & Attendance
            </h1>
            <p className="text-xs text-foreground/60 font-light">
              Track session capacities, update booking statuses, mark attendance, and manage internal notes.
            </p>
          </div>
        </div>
      </FadeUp>

      <FadeUp delay={0.05}>
        <BookingsAdminClient
          initialBookings={serializedInitialBookings}
          initialTotal={totalBookings}
          classes={classes}
          instructors={instructors}
        />
      </FadeUp>
    </div>
  );
}
