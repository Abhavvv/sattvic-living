import { db } from "@/lib/db";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import { Award, ArrowRight } from "lucide-react";

export const revalidate = 0; // Fresh database query results

export default async function InstructorsPage() {
  const instructors = await db.instructor.findMany({
    where: { isActive: true },
    include: {
      classes: {
        where: { status: "PUBLISHED" },
        select: { id: true, title: true, slug: true, category: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        {/* Banner */}
        <section className="relative py-20 bg-primary-forest text-secondary-cream px-6 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Teachers Spotlights
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none text-[#FCFCFA]">
              Masters of the <span className="italic font-normal text-secondary-white">Sacred Practice</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Our guides are dedicated practitioners who bring lineages of wisdom, anatomical clarity, and compassionate presence to the mat.
            </p>
          </div>
        </section>

        {/* Instructors Portfolio Listing */}
        <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
          {instructors.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center gap-3">
              <Award size={52} className="text-primary-sage/35 stroke-[1.25]" />
              <span className="font-serif text-lg font-bold text-primary-forest">No Registered Guides</span>
              <span className="text-xs text-foreground/50">
                Check back shortly. Our team of classical instructors is being finalized.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {instructors.map((ins, idx) => (
                <FadeUp
                  key={ins.id}
                  delay={idx * 0.1}
                  className="p-8 bg-[#F8F4EC] rounded-2xl border border-primary-sage/10 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow relative"
                >
                  {/* Avatar Profile */}
                  <div className="w-28 h-28 rounded-full overflow-hidden shrink-0 border-2 border-accent-gold/35 relative shadow bg-primary-forest/5 mx-auto sm:mx-0">
                    {ins.profileImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ins.profileImage}
                        alt={ins.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-sage">
                        <Award size={36} className="stroke-[1.25]" />
                      </div>
                    )}
                  </div>

                  {/* Information block */}
                  <div className="flex flex-col gap-3 text-center sm:text-left flex-1">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-primary-forest">
                        {ins.name}
                      </h3>
                      <span className="text-xs uppercase font-bold tracking-wide text-accent-gold block mt-0.5">
                        {ins.specialization} &bull; {ins.experienceYears} Years Experience
                      </span>
                    </div>

                    <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-3">
                      {ins.bio}
                    </p>

                    {/* Certifications tags */}
                    {ins.certifications && (
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-1.5 mt-1">
                        {ins.certifications.split(",").slice(0, 3).map((c) => (
                          <span
                            key={c}
                            className="text-[9px] font-medium text-foreground/60 bg-[#FCFCFA] border border-primary-sage/10 px-2 py-0.5 rounded-sm"
                          >
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Classes taught list */}
                    {ins.classes.length > 0 && (
                      <div className="mt-3 flex flex-col gap-1.5 border-t border-primary-sage/5 pt-3">
                        <span className="text-[9px] uppercase font-bold text-foreground/45 tracking-wider">
                          Classes Taught:
                        </span>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                          {ins.classes.map((cls) => (
                            <Link
                              key={cls.id}
                              href={`/yoga-classes/${cls.slug}`}
                              className="text-[10px] text-primary-forest font-medium bg-primary-sage/10 hover:bg-primary-sage/20 border border-primary-sage/15 px-2 py-0.5 rounded transition-colors"
                            >
                              {cls.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details Link */}
                    <div className="mt-auto pt-4 flex justify-end">
                      <Link
                        href={`/instructors/${ins.slug}`}
                        className="text-[10px] uppercase font-bold tracking-widest text-accent-gold hover:text-primary-forest transition-colors flex items-center gap-1 focus:outline-none"
                      >
                        View Guide Profile
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
