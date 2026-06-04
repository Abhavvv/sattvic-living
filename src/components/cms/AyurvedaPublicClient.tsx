"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, BookOpen, Clock, Activity } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface AyurvedaContent {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string | null;
  createdAt: Date | string | null;
  category: Category | null;
  categoryId: string | null;
}

interface AyurvedaPublicClientProps {
  initialContents: AyurvedaContent[];
  categories: Category[];
}

const ITEMS_PER_PAGE = 8;

export default function AyurvedaPublicClient({
  initialContents,
  categories,
}: AyurvedaPublicClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Ayurveda content based on search query and category ID
  const filteredContents = initialContents.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryId === "All" || item.categoryId === selectedCategoryId;

    return matchesSearch && matchesCategory;
  });

  // Calculate pagination details
  const totalPages = Math.ceil(filteredContents.length / ITEMS_PER_PAGE) || 1;
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const calculateReadTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / 225);
    return time < 1 ? 1 : time;
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Quiz Callout Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl glass-panel p-8 sm:p-10 border border-primary-sage/15 shadow-md gold-glow overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 gold-glow"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-gold/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col gap-2 max-w-2xl text-left">
          <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold bg-primary-forest/5 border border-accent-gold/25 px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit leading-none">
            <Sparkles size={11} /> Metabolic Assessment
          </span>
          <h3 className="font-serif text-2xl font-bold text-primary-forest leading-tight">
            Determine Your Vedic Dosha Constitution (Prakriti)
          </h3>
          <p className="text-xs text-foreground/80 leading-relaxed font-light">
            Not sure whether your system is governed by Vata (Air & Ether), Pitta (Fire & Water), or Kapha (Water & Earth)? Take our interactive 4-step diagnostic assessment to receive personalized nutrition, lifestyle, and exercise anchors.
          </p>
        </div>
        <Link
          href="/ayurveda"
          className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage px-6 py-3.5 rounded-full shadow-sm hover:shadow-md transition-colors shrink-0 focus:outline-none"
        >
          Take Dosha Quiz
        </Link>
      </motion.div>

      {/* Filtering Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary-sage/10 pb-8 mt-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-primary-sage font-bold flex items-center gap-1.5">
            <Activity size={11} className="text-accent-gold" />
            Biological Alignment
          </span>
          <h2 className="font-serif text-3xl font-bold text-primary-forest leading-none">
            Vedic Health Manuals
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-sage/60">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search lifestyle routines, herbs..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-secondary-cream border border-primary-sage/15 rounded-full py-2.5 pl-10 pr-4 text-xs w-full text-foreground placeholder:text-foreground/45 focus:outline-none focus:border-accent-gold transition-colors focus:ring-1 focus:ring-accent-gold"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => handleCategoryChange("All")}
              className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-full border shrink-0 transition-all focus:outline-none ${
                selectedCategoryId === "All"
                  ? "bg-primary-forest text-[#FCFCFA] border-primary-forest shadow-sm"
                  : "bg-secondary-cream text-foreground/80 border-primary-sage/10 hover:border-primary-sage"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-full border shrink-0 transition-all focus:outline-none ${
                  selectedCategoryId === cat.id
                    ? "bg-primary-forest text-[#FCFCFA] border-primary-forest shadow-sm"
                    : "bg-secondary-cream text-foreground/80 border-primary-sage/10 hover:border-primary-sage"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ayurveda Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[350px]">
        <AnimatePresence mode="popLayout">
          {paginatedContents.length > 0 ? (
            paginatedContents.map((item, idx) => (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: (idx % 4) * 0.05 }}
                className="group flex flex-col bg-[#FCFCFA] rounded-2xl overflow-hidden border border-primary-sage/10 hover:shadow-xl transition-all duration-300 relative gold-glow"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-primary-forest/5">
                  {item.featuredImage ? (
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-forest/10 to-primary-sage/10 flex items-center justify-center text-primary-sage/40">
                      <BookOpen size={48} className="stroke-[1.25]" />
                    </div>
                  )}
                  {item.category && (
                    <span className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-bold text-primary-forest bg-secondary-cream/95 px-2.5 py-1 rounded-sm border border-primary-sage/10">
                      {item.category.name}
                    </span>
                  )}
                </div>

                {/* Metadata */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between text-[9px] text-foreground/50 font-bold border-b border-primary-sage/5 pb-2">
                    <span>Sattvic Scholar</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {calculateReadTime(item.content)} Min Read
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-primary-forest leading-snug group-hover:text-primary-sage transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-3">
                    {item.content.replace(/<[^>]*>/g, "").slice(0, 130) + "..."}
                  </p>

                  <Link
                    href={`/ayurveda-learning/${item.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Read Ayurveda guide: ${item.title}`}
                  />
                </div>
              </motion.article>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-3">
              <BookOpen size={52} className="text-primary-sage/30 stroke-[1.25]" />
              <span className="font-serif text-lg font-bold text-primary-forest">No manuals found</span>
              <span className="text-xs text-foreground/50 max-w-xs">
                We couldn&apos;t find any manuals matching your search selection. Try a different category or search query.
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-primary-sage/10 pt-6 mt-4">
          <span className="text-xs text-foreground/50">
            Showing Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-primary-sage/15 hover:border-primary-sage bg-[#FCFCFA] text-foreground/80 hover:text-primary-forest disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-primary-sage/15 hover:border-primary-sage bg-[#FCFCFA] text-foreground/80 hover:text-primary-forest disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
