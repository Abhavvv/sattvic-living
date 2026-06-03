import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import AyurvedaPublicClient from "@/components/cms/AyurvedaPublicClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const revalidate = 0; // Immediate updates from database

export const metadata: Metadata = {
  title: "Ayurveda Learning | Sattvic Living",
  description: "Explore classical guides on seasonal routines (Dinacharya), herbal medicine formulations, and elemental dietary therapy.",
};

export default async function AyurvedaLearningPage() {
  const contents = await db.ayurvedaContent.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        {/* Banner Section */}
        <section className="relative py-20 bg-primary-forest text-secondary-cream px-6 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              The Science of Life
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Ayurveda Learning <br />
              <span className="italic font-normal text-secondary-white">Vedic Health Guides</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Deep dive into metabolic sciences, herbal formulations, and lifestyle alignments designed to balance your doshas and build biological ojas.
            </p>
          </div>
        </section>

        {/* Dynamic client rendering */}
        <AyurvedaPublicClient initialContents={contents} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
