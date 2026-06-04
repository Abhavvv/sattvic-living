import { db } from "@/lib/db";
import BooksPublicClient from "@/components/cms/BooksPublicClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const revalidate = 0; // Immediate updates from database

export const metadata: Metadata = {
  title: "Sacred Online Books | Sattvic Living",
  description: "Browse translations, original manuscripts, and instructional handbooks on yoga, nutrition, and Vedic self-realization.",
};

export default async function OnlineBooksPage() {
  const books = await db.book.findMany({
    orderBy: { createdAt: "desc" },
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
              backgroundImage: `url('https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Sanctuary Manuals
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Sacred Books <br />
              <span className="italic font-normal text-secondary-white">Vedic Library</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Explore primary source translations, nutritional cookbooks, and anatomical textbooks dedicated to conscious self-realization and dynamic harmony.
            </p>
          </div>
        </section>

        {/* Dynamic client bookshelf */}
        <BooksPublicClient initialBooks={books} />
      </main>
      <Footer />
    </>
  );
}
