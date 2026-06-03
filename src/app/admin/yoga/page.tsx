import { db } from "@/lib/db";
import { YogaClassStatus, YogaSessionStatus } from "@prisma/client";
import FadeUp from "@/components/animations/FadeUp";
import {
  Calendar,
  Users,
  Activity,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Video,
  MapPin
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Fresh database query results

export default async function AdminYogaDashboard() {
  const [
    instructorsCount,
    classesCount,
    sessionsCount,
    sessionsList
  ] = await Promise.all([
    db.instructor.count({ where: { isActive: true } }),
    db.yogaClass.count({ where: { status: YogaClassStatus.PUBLISHED } }),
    db.yogaSession.count({ where: { status: YogaSessionStatus.SCHEDULED, startTime: { gte: new Date() } } }),
    db.yogaSession.findMany({
      where: { startTime: { gte: new Date() } },
      include: { class: { include: { instructor: true } } },
      orderBy: { startTime: "asc" },
      take: 5
    })
  ]);

  const cards = [
    {
      title: "Active Instructors",
      count: instructorsCount,
      description: "Listed yoga teachers",
      icon: Users,
      color: "text-accent-gold bg-accent-gold/10",
      link: "/admin/yoga/instructors",
    },
    {
      title: "Active Classes",
      count: classesCount,
      description: "Published lineages",
      icon: Activity,
      color: "text-primary-forest bg-primary-sage/10",
      link: "/admin/yoga/classes",
    },
    {
      title: "Scheduled Sessions",
      count: sessionsCount,
      description: "Timetable entries (future)",
      icon: Calendar,
      color: "text-primary-forest bg-[#355E3B]/10",
      link: "/admin/yoga/sessions",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <FadeUp>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary-sage/15 pb-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
              <Sparkles size={12} className="text-accent-gold" />
              Yoga Scheduling Command
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary-forest leading-tight">
              Yoga Engine <span className="italic font-normal text-foreground">Overview</span>
            </h1>
            <p className="text-sm text-foreground/75 font-light max-w-2xl leading-relaxed">
              Manage instructors, design classes, schedule weekly sessions, and monitor seat capacities. Changes reflect instantly on the public website.
            </p>
          </div>

          <Link
            href="/admin"
            className="text-xs font-bold uppercase tracking-widest text-primary-forest border border-primary-forest/35 hover:bg-primary-forest hover:text-[#FCFCFA] px-6 py-3 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center gap-2 w-fit"
          >
            Content CMS Overview
            <ArrowRight size={12} />
          </Link>
        </div>
      </FadeUp>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <FadeUp key={card.title} delay={idx * 0.05}>
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col justify-between h-[180px] transition-organic hover:-translate-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-accent-gold/5 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-foreground/50 font-bold uppercase tracking-wider">
                      {card.title}
                    </span>
                    <span className="font-serif text-3xl font-bold text-primary-forest mt-1">
                      {card.count}
                    </span>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon size={22} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-primary-sage/10 pt-4">
                  <span className="text-[11px] text-foreground/60 font-light">
                    {card.description}
                  </span>
                  <Link
                    href={card.link}
                    className="text-[10px] uppercase font-bold tracking-wider text-accent-gold hover:text-primary-forest flex items-center gap-1 transition-colors"
                  >
                    Manage
                    <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            </FadeUp>
          );
        })}
      </div>

      {/* Action Center & Next Sessions split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Action Center */}
        <div className="lg:col-span-1 space-y-6">
          <FadeUp delay={0.15}>
            <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm h-full flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-primary-forest border-b border-primary-sage/10 pb-4 mb-6">
                  Scheduling Actions
                </h2>
                <div className="flex flex-col gap-4">
                  <Link
                    href="/admin/yoga/instructors?action=create"
                    className="flex items-center gap-3 p-4 rounded-xl border border-primary-sage/15 bg-[#FCFCFA] hover:bg-primary-sage/10 hover:border-primary-sage/40 transition-colors"
                  >
                    <PlusCircle size={18} className="text-accent-gold shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-primary-forest">Add Instructor</p>
                      <p className="text-[10px] text-foreground/60">Register new guide profile</p>
                    </div>
                  </Link>

                  <Link
                    href="/admin/yoga/classes?action=create"
                    className="flex items-center gap-3 p-4 rounded-xl border border-primary-sage/15 bg-[#FCFCFA] hover:bg-primary-sage/10 hover:border-primary-sage/40 transition-colors"
                  >
                    <PlusCircle size={18} className="text-primary-forest shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-primary-forest">Create Yoga Class</p>
                      <p className="text-[10px] text-foreground/60">Configure class & capacity</p>
                    </div>
                  </Link>

                  <Link
                    href="/admin/yoga/sessions?action=create"
                    className="flex items-center gap-3 p-4 rounded-xl border border-primary-sage/15 bg-[#FCFCFA] hover:bg-primary-sage/10 hover:border-primary-sage/40 transition-colors"
                  >
                    <PlusCircle size={18} className="text-[#8DAA91] shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-primary-forest">Schedule Session</p>
                      <p className="text-[10px] text-foreground/60">Add date time blocks to calendar</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Upcoming Sessions List */}
        <div className="lg:col-span-2">
          <FadeUp delay={0.2}>
            <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm">
              <div className="flex items-center justify-between border-b border-primary-sage/10 pb-4 mb-6">
                <h2 className="font-serif text-xl font-bold text-primary-forest">
                  Next 5 Scheduled Sessions
                </h2>
                <Link
                  href="/admin/yoga/sessions"
                  className="text-xs text-accent-gold hover:text-primary-forest transition-colors font-medium"
                >
                  View Full Timetable &rarr;
                </Link>
              </div>

              <div className="space-y-4">
                {sessionsList.length === 0 ? (
                  <p className="text-sm italic text-foreground/50 text-center py-8">
                    No sessions scheduled for the near future.
                  </p>
                ) : (
                  sessionsList.map((session) => {
                    const sessionDate = new Date(session.startTime);
                    return (
                      <div
                        key={session.id}
                        className="p-4 bg-[#FCFCFA] rounded-xl border border-primary-sage/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="px-3 py-2 bg-secondary-cream border border-accent-gold/20 text-accent-gold font-bold uppercase text-[10px] text-center rounded-lg flex flex-col justify-center w-14 shrink-0">
                            <span>
                              {sessionDate.toLocaleDateString([], { month: "short" })}
                            </span>
                            <span className="text-base leading-none mt-0.5">
                              {sessionDate.toLocaleDateString([], { day: "numeric" })}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-serif text-sm font-bold text-primary-forest">
                              {session.class.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-foreground/50 mt-1">
                              <span className="flex items-center gap-0.5">
                                <Clock size={10} />
                                {sessionDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                              </span>
                              <span>&bull;</span>
                              <span>Instructor: {session.class.instructor.name}</span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-0.5 font-medium text-primary-forest">
                                {session.class.isOnline ? <Video size={10} /> : <MapPin size={10} />}
                                {session.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] font-bold uppercase tracking-wider text-right shrink-0">
                          <span className="text-foreground/50 block">Seats Available</span>
                          <span className="text-primary-forest text-xs mt-0.5 block">
                            {session.availableSeats} / {session.capacity}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
