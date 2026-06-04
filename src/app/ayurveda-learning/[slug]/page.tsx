import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import { Clock, Calendar, ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { Metadata } from "next";

export const revalidate = 0; // Immediate updates from database

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await db.ayurvedaContent.findUnique({
    where: { slug },
  });

  if (!content || content.status !== ArticleStatus.PUBLISHED) {
    return {
      title: "Manual Not Found | Sattvic Living",
    };
  }

  return {
    title: `${content.title} | Ayurveda Guides | Sattvic Living`,
    description: "Read our dynamic Ayurveda health and lifestyle guide.",
  };
}

export default async function AyurvedaDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const content = await db.ayurvedaContent.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!content || content.status !== ArticleStatus.PUBLISHED) {
    notFound();
  }

  // Fetch related Ayurveda guides in the same category
  const relatedGuides = await db.ayurvedaContent.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      categoryId: content.categoryId,
      id: { not: content.id },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  // Fallback to general guides if needed
  let fallbackRelated = relatedGuides;
  if (relatedGuides.length < 3) {
    const additional = await db.ayurvedaContent.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        id: { notIn: [content.id, ...relatedGuides.map((r) => r.id)] },
      },
      take: 3 - relatedGuides.length,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });
    fallbackRelated = [...relatedGuides, ...additional];
  }

  const calculateReadTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / 225);
    return time < 1 ? 1 : time;
  };

  const formatDate = (dateVal: Date | string | null | undefined) => {
    if (!dateVal) return "Sattvic Living";
    const date = new Date(dateVal);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
          {/* Back button */}
          <Link
            href="/ayurveda-learning"
            className="text-xs font-semibold text-primary-sage hover:text-primary-forest flex items-center gap-1.5 transition-colors group w-fit focus:outline-none"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to All Manuals
          </Link>

          {/* Header */}
          <FadeUp className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {content.category && (
                <span className="badge-gold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded leading-none">
                  {content.category.name}
                </span>
              )}
              <span className="text-[10px] text-foreground/50 font-medium flex items-center gap-1">
                <Calendar size={11} /> {formatDate(content.createdAt)}
              </span>
              <span className="text-[10px] text-foreground/50 font-medium flex items-center gap-1">
                <Clock size={11} /> {calculateReadTime(content.content)} Min Read
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary-forest leading-[1.15] tracking-tight">
              {content.title}
            </h1>

            <div className="text-xs text-foreground/60 font-light border-b border-primary-sage/15 pb-6">
              Published by <span className="font-semibold text-primary-forest">Sattvic Living Scholar</span>
            </div>
          </FadeUp>

          {/* Featured Image */}
          {content.featuredImage && (
            <FadeUp delay={0.05} className="w-full h-[320px] sm:h-[450px] rounded-2xl overflow-hidden shadow-md border border-primary-sage/10 relative">
              <img
                src={content.featuredImage}
                alt={content.title}
                className="w-full h-full object-cover"
              />
            </FadeUp>
          )}

          {/* Layout Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
            {/* Rich Text Body */}
            <FadeUp delay={0.1} className="lg:col-span-8 flex flex-col gap-6">
              <div
                className="prose prose-forest max-w-none text-xs sm:text-sm text-foreground/85 leading-relaxed font-light space-y-4"
                dangerouslySetInnerHTML={{ __html: content.content }}
              />
            </FadeUp>

            {/* Related items */}
            <FadeUp delay={0.15} className="lg:col-span-4 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-primary-sage/10 pt-8 lg:pt-0 lg:pl-8">
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1.5 leading-none">
                <Sparkles size={11} className="text-accent-gold" />
                Lineage Wisdom
              </span>
              <h3 className="font-serif text-lg font-bold text-primary-forest leading-none border-b border-primary-sage/5 pb-2">
                Related Health Guides
              </h3>

              <div className="flex flex-col gap-5">
                {fallbackRelated.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex gap-3 group relative border-b border-primary-sage/5 pb-4 last:border-none last:pb-0"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-primary-forest/5 relative border border-primary-sage/10">
                      {rel.featuredImage ? (
                        <img
                          src={rel.featuredImage}
                          alt={rel.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-forest/10 to-primary-sage/10 flex items-center justify-center text-primary-sage/35">
                          <BookOpen size={20} className="stroke-[1.25]" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <h4 className="font-serif text-xs font-bold text-primary-forest group-hover:text-primary-sage transition-colors leading-snug line-clamp-2">
                        {rel.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-foreground/50">
                        <span>{formatDate(rel.createdAt)}</span>
                        <span>&bull;</span>
                        <span>{calculateReadTime(rel.content)} Min</span>
                      </div>
                    </div>

                    <Link href={`/ayurveda-learning/${rel.slug}`} className="absolute inset-0 z-10" />
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
