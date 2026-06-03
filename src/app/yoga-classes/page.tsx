import { db } from "@/lib/db";
import { YogaClassStatus } from "@prisma/client";
import YogaClassesPublicClient from "@/components/cms/YogaClassesPublicClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const revalidate = 0; // Fresh database query results

export default async function YogaClassesPage() {
  const classes = await db.yogaClass.findMany({
    where: { status: YogaClassStatus.PUBLISHED },
    include: {
      instructor: {
        select: {
          id: true,
          name: true,
          slug: true,
          profileImage: true,
          specialization: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        {/* Visual Banner */}
        <section className="relative py-20 bg-primary-forest text-secondary-cream px-6 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Expand Your Inner Life Force
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none text-[#FCFCFA]">
              Classical <span className="italic font-normal text-secondary-white">Yoga Sanctuary</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Lubricate joints, expand vital prana, and cultivate quietude. Discover online live streaming and physical studio classes led by dedicated guides.
            </p>
          </div>
        </section>

        {/* Classes grid and filters */}
        <YogaClassesPublicClient classes={classes} />
      </main>
      <Footer />
    </>
  );
}
