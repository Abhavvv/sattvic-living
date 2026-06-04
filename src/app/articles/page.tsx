import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import ArticlesPublicClient from "@/components/cms/ArticlesPublicClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const revalidate = 0; // Immediate updates from database

export const metadata: Metadata = {
  title: "Vedic Knowledge Articles | Sattvic Living",
  description: "Browse articles on Ayurvedic knowledge, holistic living, yoga philosophy, and seasonal wellness routines.",
};

export default async function ArticlesPublicPage() {
  const articles = await db.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        {/* Banner */}
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
              Sacred Library Repository
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Vedic Wisdom <br />
              <span className="italic font-normal text-secondary-white">Knowledge Articles</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Explore primary manuals, philosophical essays, and seasonal wellness practices dedicated to conscious self-realization and dynamic balance.
            </p>
          </div>
        </section>

        {/* Dynamic client component */}
        <ArticlesPublicClient initialArticles={articles} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
