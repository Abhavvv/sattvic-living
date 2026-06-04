import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import {
  Award,
  Clock,
  ArrowLeft,
  Mail,
  Phone,
  Bookmark,
  ChevronRight
} from "lucide-react";

export const revalidate = 0; // Fresh database query results

interface InstructorDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function InstructorDetailPage({ params }: InstructorDetailPageProps) {
  const { slug } = await params;

  const instructor = await db.instructor.findUnique({
    where: { slug },
    include: {
      classes: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!instructor || !instructor.isActive) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        {/* Back Link */}
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <Link
            href="/instructors"
            className="inline-flex items-center gap-1 text-xs uppercase font-bold tracking-wider text-primary-sage hover:text-primary-forest transition-colors"
          >
            <ArrowLeft size={12} />
            Back to Guides Registry
          </Link>
        </div>

        {/* Detailed Layout */}
        <section className="py-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column Profile Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <FadeUp>
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-primary-sage/10 bg-[#FCFCFA] flex flex-col items-center text-center gap-5">
                {/* Profile Photo */}
                <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-accent-gold/45 relative shadow-md bg-primary-forest/5">
                  {instructor.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={instructor.profileImage}
                      alt={instructor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary-sage/40">
                      <Award size={64} className="stroke-[1.25]" />
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <h1 className="font-serif text-2xl font-bold text-primary-forest">
                    {instructor.name}
                  </h1>
                  <span className="text-xs uppercase font-bold text-accent-gold block mt-1">
                    {instructor.specialization}
                  </span>
                </div>

                {/* Profile Stats */}
                <div className="w-full grid grid-cols-2 gap-4 py-4 border-y border-primary-sage/10 text-xs">
                  <div className="text-center">
                    <span className="text-foreground/50 block font-light">Experience</span>
                    <span className="font-bold text-primary-forest text-sm mt-0.5 block">
                      {instructor.experienceYears} Years
                    </span>
                  </div>
                  <div className="text-center border-l border-primary-sage/10">
                    <span className="text-foreground/50 block font-light">Classes</span>
                    <span className="font-bold text-primary-forest text-sm mt-0.5 block">
                      {instructor.classes.length} Active
                    </span>
                  </div>
                </div>

                {/* Contact info */}
                <div className="w-full space-y-3 text-left">
                  <div className="flex items-center gap-2 text-xs text-foreground/80 font-light">
                    <Mail size={14} className="text-primary-sage shrink-0" />
                    <span className="truncate" title={instructor.email}>
                      {instructor.email}
                    </span>
                  </div>
                  {instructor.phone && (
                    <div className="flex items-center gap-2 text-xs text-foreground/80 font-light">
                      <Phone size={14} className="text-primary-sage shrink-0" />
                      <span>{instructor.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </FadeUp>

            {/* Certifications Box */}
            {instructor.certifications && (
              <FadeUp delay={0.1}>
                <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 bg-[#FCFCFA] space-y-4">
                  <h3 className="font-serif text-base font-bold text-primary-forest flex items-center gap-1.5 border-b border-primary-sage/10 pb-3">
                    <Award size={16} className="text-accent-gold" />
                    Credentials & Accreditations
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {instructor.certifications.split(",").map((cert) => (
                      <li
                        key={cert}
                        className="text-xs text-foreground/80 flex items-start gap-1.5 font-light"
                      >
                        <span className="w-1.5 h-1.5 bg-accent-gold rounded-full shrink-0 mt-1.5" />
                        <span>{cert.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            )}
          </div>

          {/* Right Column Profile Details */}
          <div className="lg:col-span-8 space-y-8">
            <FadeUp>
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-primary-sage/10 bg-[#FCFCFA] space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary-forest">
                  Teaching Philosophy & Lineage
                </h2>
                <div className="text-sm leading-relaxed text-foreground/85 font-light whitespace-pre-wrap">
                  {instructor.bio}
                </div>
              </div>
            </FadeUp>

            {/* Classes Taught by Instructor */}
            <FadeUp delay={0.05}>
              <div className="space-y-6">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary-forest flex items-center gap-2 border-b border-primary-sage/10 pb-4">
                  <Bookmark size={20} className="text-accent-gold" />
                  Yoga Lineages Taught by {instructor.name}
                </h2>

                {instructor.classes.length === 0 ? (
                  <p className="text-xs italic text-foreground/50">
                    No classes are currently cataloged for this instructor.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {instructor.classes.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-5 bg-[#FCFCFA] rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col justify-between h-[180px] hover:border-accent-gold/20 transition-all group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[9px] font-bold text-foreground/45 uppercase tracking-wider">
                            <span className="badge-sage px-2 py-0.5 rounded-full text-primary-forest">
                              {cls.category}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock size={11} /> {cls.duration} Min
                            </span>
                          </div>

                          <h4 className="font-serif text-base font-bold text-primary-forest leading-snug group-hover:text-primary-sage transition-colors line-clamp-1">
                            {cls.title}
                          </h4>
                          <p className="text-xs text-foreground/70 leading-relaxed font-light line-clamp-2">
                            {cls.description.replace(/<[^>]*>/g, "").slice(0, 100)}...
                          </p>
                        </div>

                        <div className="border-t border-primary-sage/10 pt-3 mt-4 flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-primary-forest">
                            {cls.price === 0 ? "Free" : `₹${cls.price}`}
                          </span>
                          <Link
                            href={`/yoga-classes/${cls.slug}`}
                            className="text-[10px] uppercase font-bold tracking-wider text-accent-gold group-hover:text-primary-forest flex items-center gap-0.5 transition-colors"
                          >
                            Explore Class
                            <ChevronRight size={12} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeUp>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
