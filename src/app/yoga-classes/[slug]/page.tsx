import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import { auth } from "@/auth";
import SessionBookingList from "@/components/yoga/SessionBookingList";
import {
  Clock,
  Sparkles,
  Award,
  Calendar,
  AlertCircle,
  ArrowLeft,
  ChevronRight
} from "lucide-react";

export const revalidate = 0; // Fresh database query results

interface YogaClassDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function YogaClassDetailPage({ params }: YogaClassDetailPageProps) {
  const { slug } = await params;

  const yogaClass = await db.yogaClass.findUnique({
    where: { slug },
    include: {
      instructor: true,
      sessions: {
        where: {
          startTime: { gte: new Date() },
          status: "SCHEDULED",
        },
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!yogaClass || yogaClass.status !== "PUBLISHED") {
    notFound();
  }

  const session = await auth();
  let userBookedSessionIds: string[] = [];

  if (session && session.user && session.user.id) {
    const bookings = await db.booking.findMany({
      where: {
        userId: session.user.id,
        yogaSession: {
          classId: yogaClass.id,
        },
        bookingStatus: { not: "CANCELLED" },
      },
      select: {
        yogaSessionId: true,
      },
    });
    userBookedSessionIds = bookings.map((b) => b.yogaSessionId);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        {/* Editorial Top Bar (Back button) */}
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <Link
            href="/yoga-classes"
            className="inline-flex items-center gap-1 text-xs uppercase font-bold tracking-wider text-primary-sage hover:text-primary-forest transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Directory
          </Link>
        </div>

        {/* Hero Section */}
        <section className="py-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <FadeUp>
              <div className="flex flex-wrap gap-2.5 items-center">
                <span className="badge-sage px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase text-primary-forest">
                  {yogaClass.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-sm bg-accent-gold/15 text-primary-forest text-[9px] uppercase tracking-widest font-bold border border-accent-gold/25">
                  {yogaClass.difficulty}
                </span>
                <span className="flex items-center gap-1 text-xs text-foreground/50 font-medium">
                  <Clock size={14} className="text-primary-sage" /> {yogaClass.duration} Min
                </span>
              </div>
            </FadeUp>

            <FadeUp delay={0.05}>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary-forest leading-tight">
                {yogaClass.title}
              </h1>
            </FadeUp>

            {/* Featured Image */}
            <FadeUp delay={0.1}>
              <div className="relative h-[300px] sm:h-[450px] w-full rounded-2xl overflow-hidden border border-primary-sage/10 bg-primary-forest/5 shadow-md">
                {yogaClass.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={yogaClass.featuredImage}
                    alt={yogaClass.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-forest/15 via-primary-sage/10 to-secondary-cream flex items-center justify-center text-primary-sage/35">
                    <Sparkles size={80} className="stroke-[1]" />
                  </div>
                )}
              </div>
            </FadeUp>

            {/* Description HTML */}
            <FadeUp delay={0.15}>
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-primary-sage/10 bg-[#FCFCFA] space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary-forest">
                  Practice Essence & Philosophy
                </h2>
                <div
                  className="prose prose-stone text-sm leading-relaxed text-foreground/85 font-light"
                  dangerouslySetInnerHTML={{ __html: yogaClass.description }}
                />
              </div>
            </FadeUp>

            {/* Upcoming Timetable Sessions */}
            <FadeUp delay={0.2}>
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-primary-sage/10 bg-[#FCFCFA] space-y-6">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary-forest flex items-center gap-2">
                  <Calendar size={20} className="text-accent-gold" />
                  Upcoming Scheduled Timetable
                </h2>
                <p className="text-xs text-foreground/60 leading-normal font-light">
                  Reserve a spot in any of our scheduled live streams or physical sessions below.
                </p>

                <SessionBookingList
                  sessions={yogaClass.sessions.map((s) => ({
                    id: s.id,
                    startTime: s.startTime.toISOString(),
                    endTime: s.endTime.toISOString(),
                    location: s.location,
                    meetingLink: s.meetingLink,
                    capacity: s.capacity,
                    availableSeats: s.availableSeats,
                    status: s.status,
                  }))}
                  classId={yogaClass.id}
                  classSlug={yogaClass.slug}
                  classTitle={yogaClass.title}
                  price={yogaClass.price}
                  isOnline={yogaClass.isOnline}
                  currentUser={session && session.user ? { id: session.user.id!, email: session.user.email! } : null}
                  initialBookedSessionIds={userBookedSessionIds}
                />
              </div>
            </FadeUp>
          </div>

          {/* Sidebar Widgets (Pricing, Instructor Spotlight) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* Pricing Widget */}
            <FadeUp delay={0.1}>
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 bg-[#FCFCFA] relative overflow-hidden flex flex-col gap-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[10px] uppercase tracking-widest text-primary-sage font-bold">
                  Class Access Fee
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-primary-forest">
                    {yogaClass.price === 0 ? "Free" : `₹${yogaClass.price}`}
                  </span>
                  {yogaClass.price > 0 && (
                    <span className="text-xs text-foreground/50 font-light">/ class session</span>
                  )}
                </div>

                <div className="p-3 bg-accent-gold/5 border border-accent-gold/15 text-[11px] leading-relaxed text-foreground/80 font-light rounded-xl flex items-start gap-2">
                  <AlertCircle size={14} className="text-accent-gold shrink-0 mt-0.5" />
                  <span>
                    Select any of the upcoming scheduled slots on the left to register for classes instantly.
                  </span>
                </div>

                <div className="w-full text-center text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage py-3.5 rounded-full shadow transition-all">
                  Registrations Active
                </div>
              </div>
            </FadeUp>

            {/* Instructor Spotlight Widget */}
            <FadeUp delay={0.15}>
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 bg-[#FCFCFA] flex flex-col gap-4">
                <span className="text-[10px] uppercase tracking-widest text-primary-sage font-bold">
                  Assigned Guide
                </span>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-accent-gold/30 shrink-0 bg-primary-forest/5">
                    {yogaClass.instructor.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={yogaClass.instructor.profileImage}
                        alt={yogaClass.instructor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Award size={18} className="text-primary-sage/50" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-primary-forest leading-tight">
                      {yogaClass.instructor.name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-accent-gold leading-none">
                      {yogaClass.instructor.specialization}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-4">
                  {yogaClass.instructor.bio}
                </p>

                <Link
                  href={`/instructors/${yogaClass.instructor.slug}`}
                  className="text-xs font-semibold text-accent-gold hover:text-primary-forest flex items-center gap-1 transition-colors mt-2"
                >
                  View Guide Profile
                  <ChevronRight size={14} />
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
