import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import { ArrowLeft, BookOpen, Star, Sparkles, ExternalLink, ShieldAlert, FileText } from "lucide-react";
import { Metadata } from "next";

export const revalidate = 0; // Immediate updates from database

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await db.book.findUnique({
    where: { slug },
  });

  if (!book) {
    return {
      title: "Book Not Found | Sattvic Living",
    };
  }

  return {
    title: `${book.title} | Sacred Books | Sattvic Living`,
    description: `Read about ${book.title} by ${book.author}.`,
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const book = await db.book.findUnique({
    where: { slug },
  });

  if (!book) {
    notFound();
  }

  // Fetch some other featured books to recommend
  const otherBooks = await db.book.findMany({
    where: {
      id: { not: book.id },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
          {/* Back button */}
          <Link
            href="/online-books"
            className="text-xs font-semibold text-primary-sage hover:text-primary-forest flex items-center gap-1.5 transition-colors group w-fit focus:outline-none"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Library
          </Link>

          {/* Main Book Panel */}
          <div className="relative rounded-3xl glass-panel p-6 sm:p-10 border border-primary-sage/15 shadow-xl gold-glow flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Cover Artwork */}
              <FadeUp className="w-40 h-56 shrink-0 shadow-lg rounded-lg overflow-hidden border border-primary-sage/15 bg-primary-forest/5 relative mx-auto sm:mx-0">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-forest/10 to-primary-sage/10 flex items-center justify-center text-primary-sage/40">
                    <BookOpen size={48} className="stroke-[1.25]" />
                  </div>
                )}
              </FadeUp>

              {/* Description metadata */}
              <FadeUp delay={0.05} className="flex flex-col gap-3 flex-1 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  {book.isPremium ? (
                    <span className="badge-gold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded leading-none font-bold">
                      Premium
                    </span>
                  ) : (
                    <span className="badge-sage text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded leading-none font-bold">
                      Free Text
                    </span>
                  )}
                  <span className="text-[10px] text-foreground/50 font-medium flex items-center gap-1">
                    Uploaded {new Date(book.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
                  {book.title}
                </h1>

                <span className="text-sm font-medium text-foreground/80 leading-none">
                  Written by {book.author}
                </span>

                <div className="flex items-center gap-2">
                  <div className="flex items-center text-accent-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-accent-gold text-accent-gold" />
                    ))}
                  </div>
                  <span className="text-xs text-foreground/60 font-bold">
                    (5.0 out of 5 stars)
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-light mt-1 whitespace-pre-line">
                  {book.description}
                </p>
              </FadeUp>
            </div>

            {/* Premium Notice or Attachment Section */}
            <FadeUp delay={0.1} className="border-t border-primary-sage/10 pt-6 mt-4 flex flex-col gap-4">
              {book.isPremium ? (
                <div className="p-5 bg-accent-gold/10 rounded-xl border border-accent-gold/25 flex items-start gap-3">
                  <ShieldAlert className="text-accent-gold shrink-0 mt-0.5" size={18} />
                  <div className="flex flex-col gap-1 text-left">
                    <h4 className="font-serif text-sm font-bold text-primary-forest">Premium Circle Text</h4>
                    <p className="text-xs text-foreground/80 leading-relaxed font-light">
                      This volume is part of our advanced Vedic collection. Access to the digital PDF and direct translations requires a premium subscriber plan or community initiation.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-foreground/50 italic leading-relaxed font-light max-w-md text-left">
                  Sattvic Library offers dynamic cataloging of Vedic literature. Purchase links and attachments are provided for digital review.
                </span>

                {book.pdfUrl ? (
                  <a
                    href={book.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage px-6 py-3.5 rounded-full flex items-center gap-2 shrink-0 transition-colors focus:outline-none"
                  >
                    <FileText size={14} />
                    Open PDF File
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <button
                    disabled
                    className="text-xs font-bold uppercase tracking-widest text-foreground/40 bg-foreground/10 px-6 py-3.5 rounded-full flex items-center gap-1.5 shrink-0 cursor-not-allowed border border-primary-sage/10"
                  >
                    No PDF Attached
                  </button>
                )}
              </div>
            </FadeUp>
          </div>

          {/* Recommendations list */}
          <FadeUp delay={0.15} className="flex flex-col gap-6 mt-8">
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1.5 leading-none">
              <Sparkles size={11} className="text-accent-gold" />
              Sanctuary Bookshelf
            </span>
            <h3 className="font-serif text-xl font-bold text-primary-forest leading-none border-b border-primary-sage/5 pb-2 text-left">
              Other Curated Titles
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {otherBooks.map((ob) => (
                <div
                  key={ob.id}
                  className="bg-[#F8F4EC] rounded-xl p-4 border border-primary-sage/10 flex flex-col gap-3 group relative hover:shadow-md transition-all duration-300"
                >
                  <div className="w-16 h-24 shrink-0 rounded overflow-hidden shadow relative mx-auto bg-primary-forest/5 border border-primary-sage/10">
                    {ob.coverImage ? (
                      <img src={ob.coverImage} alt={ob.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-forest/10 to-primary-sage/10 flex items-center justify-center text-primary-sage/35">
                        <BookOpen size={20} className="stroke-[1.25]" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-center">
                    <h4 className="font-serif text-xs font-bold text-primary-forest group-hover:text-primary-sage transition-colors leading-snug line-clamp-1">
                      {ob.title}
                    </h4>
                    <span className="text-[10px] text-foreground/50">By {ob.author}</span>
                  </div>
                  <Link href={`/online-books/${ob.slug}`} className="absolute inset-0 z-10" />
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </main>
      <Footer />
    </>
  );
}
