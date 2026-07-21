import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Calendar,
  Utensils,
  BookOpen,
  Book,
  User,
  Phone,
  Mail,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  Edit2
} from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function DashboardPage() {
  // Retrieve session on the server to prevent flash of unauthenticated content
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user;

  // Resolve true database createdAt timestamp instead of parsing CUIDs
  const dbUser = user.id
    ? await db.user.findUnique({
        where: { id: user.id },
        select: { createdAt: true },
      })
    : null;

  const joinDate = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently Joined";

  // Query next upcoming booking
  const upcomingBooking = await db.booking.findFirst({
    where: {
      userId: user.id!,
      bookingStatus: { in: ["CONFIRMED", "PENDING"] },
      yogaSession: {
        startTime: { gte: new Date() },
      },
    },
    include: {
      yogaSession: {
        include: {
          class: {
            include: {
              instructor: true,
            },
          },
        },
      },
    },
    orderBy: {
      yogaSession: {
        startTime: "asc",
      },
    },
  });

  // Query latest order for client dashboard card
  const latestOrder = await db.mealOrder.findFirst({
    where: {
      userId: user.id!,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F4EC] pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary-sage/15 pb-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
                <Sparkles size={12} className="text-accent-gold" />
                Inner Sanctuary
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary-forest leading-tight">
                Namaste, <span className="italic font-normal text-foreground">{user.name || "Seeker"}</span>
              </h1>
              <p className="text-sm text-foreground/75 font-light max-w-2xl leading-relaxed">
                Welcome back to your quiet harbor. Take a slow, intentional breath, and align your choices today with physical vitality, mental clarity, and spiritual tranquility.
              </p>
            </div>
            
            <Link
              href="/profile"
              className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-6 py-3 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm flex items-center justify-center gap-2 w-fit"
            >
              <Edit2 size={12} />
              Modify Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Profile Summary & Account Information */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Profile Card */}
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 relative overflow-hidden shadow-sm flex flex-col items-center text-center gap-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 rounded-full blur-xl pointer-events-none" />
                
                {/* User Avatar */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-gold/45 shadow-md bg-secondary-cream flex items-center justify-center relative">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name || "User Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-primary-sage" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h2 className="font-serif text-xl font-bold text-primary-forest leading-snug">
                    {user.name || "Sattvic Soul"}
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider badge-sage px-3 py-0.5 rounded-full w-fit mx-auto">
                    {user.role || "USER"}
                  </span>
                </div>

                <div className="w-full border-t border-primary-sage/10 pt-4 text-left space-y-3">
                  <div className="flex items-center gap-2.5 text-xs text-foreground/85">
                    <Mail size={14} className="text-primary-sage shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2.5 text-xs text-foreground/85">
                      <Phone size={14} className="text-primary-sage shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-xs text-foreground/85">
                    <Clock size={14} className="text-primary-sage shrink-0" />
                    <span>Member since {joinDate}</span>
                  </div>
                </div>
              </div>

              {/* Bio & Information Card */}
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col gap-4">
                <h3 className="font-serif text-lg font-bold text-primary-forest border-b border-primary-sage/10 pb-2 flex items-center gap-2">
                  <Shield size={16} className="text-accent-gold" />
                  Bio & Insights
                </h3>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-wider text-foreground/50 font-bold">
                    Somatic Biography
                  </span>
                  {user.bio ? (
                    <p className="text-xs text-foreground/80 leading-relaxed font-light italic">
                      &ldquo;{user.bio}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-foreground/50 leading-relaxed font-light italic">
                      &ldquo;No biography written yet. Take a moment to describe your spiritual background or wellness goals in your profile.&rdquo;
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1 pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-foreground/50 font-bold">
                    Dosha Status
                  </span>
                  <div className="text-xs text-foreground/80 leading-relaxed font-light">
                    Take the <Link href="/ayurveda" className="text-accent-gold font-bold hover:underline">Dosha Quiz</Link> to analyze your biological humors and receive personalized nutrition guides.
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Placeholder Cards for Future Modules */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Upcoming Yoga Classes */}
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col justify-between h-[230px] transition-organic hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#FCFCFA] flex items-center justify-center border border-primary-sage/15 shrink-0 text-accent-gold">
                    <Calendar size={22} />
                  </div>
                  <div className="flex flex-col gap-1.5 overflow-hidden w-full">
                    <h3 className="font-serif text-lg font-bold text-primary-forest leading-snug">
                      Upcoming Yoga Classes
                    </h3>
                    <p className="text-xs text-foreground/75 leading-relaxed font-light">
                      Align your structural skeleton and deep respiratory breathwork with live lineage guidance.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {upcomingBooking ? (
                    <div className="text-left space-y-1">
                      <div className="text-xs font-bold text-primary-forest leading-tight truncate">
                        {upcomingBooking.yogaSession.class.title}
                      </div>
                      <div className="text-[10px] text-foreground/60 leading-none">
                        {upcomingBooking.yogaSession.startTime.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        at{" "}
                        {upcomingBooking.yogaSession.startTime.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="text-[10px] text-accent-gold font-semibold leading-none mt-1">
                        Guide: {upcomingBooking.yogaSession.class.instructor.name} &bull;{" "}
                        {upcomingBooking.yogaSession.class.isOnline ? "Online" : "Studio"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-foreground/50 italic font-light">
                      No active yoga course bookings found.
                    </div>
                  )}
                  <Link
                    href={upcomingBooking ? "/dashboard/bookings" : "/yoga-classes"}
                    className="text-xs font-bold uppercase tracking-widest text-primary-forest hover:text-accent-gold transition-colors flex items-center gap-1.5 group w-fit"
                  >
                    {upcomingBooking ? "Manage Bookings" : "Explore Yoga Classes"}
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Meal Orders */}
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col justify-between h-[230px] transition-organic hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#FCFCFA] flex items-center justify-center border border-primary-sage/15 shrink-0 text-accent-gold">
                    <Utensils size={22} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-lg font-bold text-primary-forest leading-snug">
                      Sattvic Meal Orders
                    </h3>
                    <p className="text-xs text-foreground/75 leading-relaxed font-light">
                      Nourish biological ojas and brain clarity through pure, fresh organic meals.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {latestOrder ? (
                    <div className="text-left space-y-1">
                      <div className="text-xs font-bold text-primary-forest leading-tight truncate">
                        Order: {latestOrder.orderNumber}
                      </div>
                      <div className="text-[10px] text-foreground/60 leading-none">
                        Scheduled: {latestOrder.deliveryDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-accent-gold font-semibold leading-none mt-1 uppercase tracking-wider">
                        Status: {latestOrder.status}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-foreground/50 italic font-light">
                      No active meal orders in progress.
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    {latestOrder && (
                      <Link
                        href="/dashboard/orders"
                        className="text-xs font-bold uppercase tracking-widest text-primary-forest hover:text-accent-gold transition-colors flex items-center gap-1.5 group"
                      >
                        Track Orders
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                    <Link
                      href="/meals"
                      className={`text-xs font-bold uppercase tracking-widest hover:text-accent-gold transition-colors flex items-center gap-1.5 group ${
                        latestOrder ? "text-foreground/50 font-normal" : "text-primary-forest"
                      }`}
                    >
                      {latestOrder ? "New Order" : "Browse Menu"}
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Saved Articles */}
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col justify-between h-[230px] transition-organic hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#FCFCFA] flex items-center justify-center border border-primary-sage/15 shrink-0 text-accent-gold">
                    <BookOpen size={22} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-lg font-bold text-primary-forest leading-snug">
                      Saved Wisdom Articles
                    </h3>
                    <p className="text-xs text-foreground/75 leading-relaxed font-light">
                      Collect deep essays on Vedic philosophy, seasonal habits, and herbal medicines.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="text-[11px] text-foreground/50 italic font-light">
                    Your reading list is currently empty.
                  </div>
                  <Link
                    href="/ayurveda-learning"
                    className="text-xs font-bold uppercase tracking-widest text-primary-forest hover:text-accent-gold transition-colors flex items-center gap-1.5 group"
                  >
                    Read Ayurveda Guides
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Purchased Books */}
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col justify-between h-[230px] transition-organic hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#FCFCFA] flex items-center justify-center border border-primary-sage/15 shrink-0 text-accent-gold">
                    <Book size={22} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-lg font-bold text-primary-forest leading-snug">
                      Purchased Sacred Books
                    </h3>
                    <p className="text-xs text-foreground/75 leading-relaxed font-light">
                      Review your owned translations of core yogic texts and diagnostic journals.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="text-[11px] text-foreground/50 italic font-light">
                    No books in your digital library yet.
                  </div>
                  <Link
                    href="/online-books"
                    className="text-xs font-bold uppercase tracking-widest text-primary-forest hover:text-accent-gold transition-colors flex items-center gap-1.5 group"
                  >
                    Browse Book Library
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
