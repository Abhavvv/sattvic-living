import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import {
  Clock,
  Sparkles,
  MapPin,
  Video,
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

  const formatDate = (dateObj: Date) => {
    return dateObj.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateObj: Date) => {
    return dateObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

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

                <div className="space-y-4">
                  {yogaClass.sessions.length === 0 ? (
                    <div className="p-6 bg-secondary-cream/50 border border-primary-sage/10 rounded-xl text-center">
                      <p className="text-xs italic text-foreground/50">
                        No upcoming timetable sessions are currently scheduled for this class style. Check back soon.
                      </p>
                    </div>
                  ) : (
                    yogaClass.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-5 bg-secondary-cream/20 border border-primary-sage/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent-gold/20 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="w-14 px-3 py-2 bg-secondary-cream border border-accent-gold/25 rounded-lg text-center text-accent-gold shrink-0">
                            <span className="block text-[9px] uppercase font-bold tracking-wider leading-none">
                              {formatDate(session.startTime).split(",")[1]?.trim().split(" ")[0]}
                            </span>
                            <span className="block text-base font-bold leading-none mt-0.5">
                              {formatDate(session.startTime).split(",")[1]?.trim().split(" ")[1]}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">
                              {formatDate(session.startTime).split(",")[0]}, {formatTime(session.startTime)} - {formatTime(session.endTime)}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-forest mt-1">
                              {yogaClass.isOnline ? (
                                <Video size={13} className="text-blue-500 shrink-0" />
                              ) : (
                                <MapPin size={13} className="text-amber-600 shrink-0" />
                              )}
                              <span>{session.location}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 leading-none">
                            {session.availableSeats} / {session.capacity} Slots Left
                          </span>
                          <button
                            disabled
                            className="px-4 py-1.5 rounded-full bg-primary-forest/10 border border-primary-forest/20 text-primary-forest text-[10px] uppercase font-bold tracking-wider cursor-not-allowed opacity-75"
                          >
                            Reserve Spot
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
                    <strong>Note:</strong> Class bookings and payment processing are coming soon in the next phase! Online classes will stream via Zoom.
                  </span>
                </div>

                <button
                  disabled
                  className="w-full text-center text-xs font-bold uppercase tracking-widest text-primary-forest/50 bg-[#F8F4EC] border border-primary-sage/20 py-3.5 rounded-full cursor-not-allowed opacity-75"
                >
                  Registrations Inactive
                </button>
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
