import { db } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import { Clock, Calendar, ArrowLeft, BookOpen, Sparkles, Hash } from "lucide-react";
import { Metadata } from "next";

export const revalidate = 0; // Immediate updates from database

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate Dynamic SEO Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
  });

  if (!article || article.status !== ArticleStatus.PUBLISHED) {
    return {
      title: "Article Not Found | Sattvic Living",
    };
  }

  return {
    title: `${article.metaTitle || article.title} | Sattvic Living`,
    description: article.metaDescription || article.excerpt || "Read our dynamic article.",
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Query current article
  const article = await db.article.findUnique({
    where: { slug },
    include: { category: true },
  });

  // Verify existence and status
  if (!article || article.status !== ArticleStatus.PUBLISHED) {
    notFound();
  }

  // Query related articles (same category, excluding current, up to 3)
  const relatedArticles = await db.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      categoryId: article.categoryId,
      id: { not: article.id },
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });

  // Fallback to general featured articles if category doesn't yield enough
  let fallbackRelated = relatedArticles;
  if (relatedArticles.length < 3) {
    const additional = await db.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        id: { notIn: [article.id, ...relatedArticles.map((r) => r.id)] },
      },
      take: 3 - relatedArticles.length,
      orderBy: { publishedAt: "desc" },
      include: { category: true },
    });
    fallbackRelated = [...relatedArticles, ...additional];
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
            href="/articles"
            className="text-xs font-semibold text-primary-sage hover:text-primary-forest flex items-center gap-1.5 transition-colors group w-fit focus:outline-none"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to All Articles
          </Link>

          {/* Header Metadata */}
          <FadeUp className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              {article.category && (
                <span className="badge-gold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded leading-none">
                  {article.category.name}
                </span>
              )}
              <span className="text-[10px] text-foreground/50 font-medium flex items-center gap-1">
                <Calendar size={11} /> {formatDate(article.publishedAt || article.createdAt)}
              </span>
              <span className="text-[10px] text-foreground/50 font-medium flex items-center gap-1">
                <Clock size={11} /> {calculateReadTime(article.content)} Min Read
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary-forest leading-[1.15] tracking-tight">
              {article.title}
            </h1>

            <div className="text-xs text-foreground/60 font-light border-b border-primary-sage/15 pb-6">
              Published by <span className="font-semibold text-primary-forest">Sattvic Living Team</span>
            </div>
          </FadeUp>

          {/* Featured Image */}
          {article.featuredImage && (
            <FadeUp delay={0.05} className="w-full h-[320px] sm:h-[450px] rounded-2xl overflow-hidden shadow-md border border-primary-sage/10 relative">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </FadeUp>
          )}

          {/* Article content & sidebar wrapper */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
            {/* Rich Content column */}
            <FadeUp delay={0.1} className="lg:col-span-8 flex flex-col gap-6">
              {article.excerpt && (
                <div className="text-sm text-foreground/80 leading-relaxed font-light italic border-l-2 border-accent-gold pl-4 bg-secondary-cream py-3 pr-3 rounded-r-md">
                  {article.excerpt}
                </div>
              )}

              {/* Renders HTML from Tiptap Editor */}
              <div
                className="prose prose-forest max-w-none text-xs sm:text-sm text-foreground/85 leading-relaxed font-light space-y-4"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags panel */}
              {article.tags && (
                <div className="flex flex-wrap items-center gap-2 border-t border-primary-sage/10 pt-6 mt-6">
                  <Hash size={13} className="text-primary-sage" />
                  {article.tags.split(",").map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[9px] font-bold text-primary-forest bg-primary-sage/10 px-2.5 py-0.5 rounded-sm"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </FadeUp>

            {/* Sidebar Column: Related articles */}
            <FadeUp delay={0.15} className="lg:col-span-4 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-primary-sage/10 pt-8 lg:pt-0 lg:pl-8">
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1.5 leading-none">
                <Sparkles size={11} className="text-accent-gold" />
                Vedic Context
              </span>
              <h3 className="font-serif text-lg font-bold text-primary-forest leading-none border-b border-primary-sage/5 pb-2">
                Related Reading
              </h3>

              <div className="flex flex-col gap-5">
                {fallbackRelated.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex gap-3 group relative border-b border-primary-sage/5 pb-4 last:border-none last:pb-0"
                  >
                    {/* Tiny thumbnail */}
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

                    {/* Metadata summary */}
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <h4 className="font-serif text-xs font-bold text-primary-forest group-hover:text-primary-sage transition-colors leading-snug line-clamp-2">
                        {rel.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-foreground/50">
                        <span>{formatDate(rel.publishedAt || rel.createdAt)}</span>
                        <span>&bull;</span>
                        <span>{calculateReadTime(rel.content)} Min</span>
                      </div>
                    </div>

                    <Link href={`/articles/${rel.slug}`} className="absolute inset-0 z-10" />
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
