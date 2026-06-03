import { db } from "@/lib/db";
import FaqPublicClient from "@/components/cms/FaqPublicClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const revalidate = 0; // Immediate updates from database

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Sattvic Living",
  description: "Find clear answers on Ayurvedic consultations, organic meal plans, restorative yoga classes, and subscription memberships.",
};

export default async function FaqPublicPage() {
  const faqs = await db.fAQ.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
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
              backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Information Helpdesk
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Common Questions <br />
              <span className="italic font-normal text-secondary-white">FAQ Portal</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Clear references on class scheduling, Ayurvedic dietary protocols, meal subscription logistics, and account operations.
            </p>
          </div>
        </section>

        {/* Dynamic client FAQ component */}
        <FaqPublicClient initialFaqs={faqs} />
      </main>
      <Footer />
    </>
  );
}
