import { db } from "@/lib/db";
import FadeUp from "@/components/animations/FadeUp";
import {
  FileText,
  BookOpen,
  Book,
  HelpCircle,
  FolderOpen,
  PlusCircle,
  Eye,
  Settings,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Disable caching to ensure counts are always accurate

export default async function AdminDashboardPage() {
  // Query counts for each resource
  const [
    articlesCount,
    ayurvedaCount,
    booksCount,
    faqCount,
    categoriesCount
  ] = await Promise.all([
    db.article.count(),
    db.ayurvedaContent.count(),
    db.book.count(),
    db.fAQ.count(),
    db.category.count()
  ]);

  const cards = [
    {
      title: "Wisdom Articles",
      count: articlesCount,
      description: "Vedic philosophy & habits",
      icon: FileText,
      color: "text-primary-forest bg-primary-sage/10",
      link: "/admin/content?tab=articles",
    },
    {
      title: "Ayurveda Content",
      count: ayurvedaCount,
      description: "Dosha guides & recipes",
      icon: BookOpen,
      color: "text-accent-gold bg-accent-gold/10",
      link: "/admin/content?tab=ayurveda",
    },
    {
      title: "Sacred Books",
      count: booksCount,
      description: "PDF library & translations",
      icon: Book,
      color: "text-primary-forest bg-[#355E3B]/10",
      link: "/admin/content?tab=books",
    },
    {
      title: "FAQs & Inquiries",
      count: faqCount,
      description: "Support questions & answers",
      icon: HelpCircle,
      color: "text-primary-forest bg-primary-sage/15",
      link: "/admin/content?tab=faqs",
    },
    {
      title: "Categories",
      count: categoriesCount,
      description: "Content organization taxonomy",
      icon: FolderOpen,
      color: "text-[#8DAA91] bg-secondary-cream",
      link: "/admin/content?tab=categories",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <FadeUp>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary-sage/15 pb-8">
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
              <Sparkles size={12} className="text-accent-gold" />
              Administrative Command
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary-forest leading-tight">
              CMS <span className="italic font-normal text-foreground">Overview</span>
            </h1>
            <p className="text-sm text-foreground/75 font-light max-w-2xl leading-relaxed">
              Manage database collections, modify wisdom texts, and monitor portal publications. Adjust content taxonomies and library books below.
            </p>
          </div>

          <Link
            href="/admin/content"
            className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-6 py-3 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm flex items-center justify-center gap-2 w-fit"
          >
            <Settings size={12} />
            Manage Content
          </Link>
        </div>
      </FadeUp>

      {/* Database Count Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <FadeUp key={card.title} delay={idx * 0.05}>
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col justify-between h-[180px] transition-organic hover:-translate-y-1 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-accent-gold/5 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-foreground/50 font-bold uppercase tracking-wider">
                      {card.title}
                    </span>
                    <span className="font-serif text-3xl font-bold text-primary-forest mt-1">
                      {card.count}
                    </span>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${card.color}`}>
                    <Icon size={22} />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-primary-sage/10 pt-4">
                  <span className="text-[11px] text-foreground/60 font-light">
                    {card.description}
                  </span>
                  <Link
                    href={card.link}
                    className="text-[10px] uppercase font-bold tracking-wider text-accent-gold hover:text-primary-forest flex items-center gap-1 transition-colors"
                  >
                    View
                    <Eye size={10} />
                  </Link>
                </div>
              </div>
            </FadeUp>
          );
        })}
      </div>

      {/* Action Center & Quick Links */}
      <FadeUp delay={0.3}>
        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-primary-sage/10 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-primary-forest border-b border-primary-sage/10 pb-4 mb-6">
            CMS Action Center
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/content?tab=articles&action=create"
              className="flex items-center gap-3 p-4 rounded-xl border border-primary-sage/15 bg-[#FCFCFA] hover:bg-primary-sage/10 hover:border-primary-sage/40 transition-colors"
            >
              <PlusCircle size={18} className="text-primary-forest shrink-0" />
              <div>
                <p className="text-xs font-bold text-primary-forest">Write Article</p>
                <p className="text-[10px] text-foreground/60">Publish new wisdom</p>
              </div>
            </Link>

            <Link
              href="/admin/content?tab=ayurveda&action=create"
              className="flex items-center gap-3 p-4 rounded-xl border border-primary-sage/15 bg-[#FCFCFA] hover:bg-primary-sage/10 hover:border-primary-sage/40 transition-colors"
            >
              <PlusCircle size={18} className="text-accent-gold shrink-0" />
              <div>
                <p className="text-xs font-bold text-primary-forest">Add Ayurveda Guide</p>
                <p className="text-[10px] text-foreground/60">Create dosha wellness text</p>
              </div>
            </Link>

            <Link
              href="/admin/content?tab=books&action=create"
              className="flex items-center gap-3 p-4 rounded-xl border border-primary-sage/15 bg-[#FCFCFA] hover:bg-primary-sage/10 hover:border-primary-sage/40 transition-colors"
            >
              <PlusCircle size={18} className="text-primary-forest shrink-0" />
              <div>
                <p className="text-xs font-bold text-primary-forest">Upload Book</p>
                <p className="text-[10px] text-foreground/60">Add digital PDF literature</p>
              </div>
            </Link>

            <Link
              href="/admin/content?tab=categories&action=create"
              className="flex items-center gap-3 p-4 rounded-xl border border-primary-sage/15 bg-[#FCFCFA] hover:bg-primary-sage/10 hover:border-primary-sage/40 transition-colors"
            >
              <PlusCircle size={18} className="text-[#8DAA91] shrink-0" />
              <div>
                <p className="text-xs font-bold text-primary-forest">New Category</p>
                <p className="text-[10px] text-foreground/60">Manage content tags</p>
              </div>
            </Link>
          </div>
        </div>
      </FadeUp>
    </div>
  );
}
