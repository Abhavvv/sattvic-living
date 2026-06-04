"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Clock, Sparkles, BookOpenCheck } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  tags: string | null;
  publishedAt: Date | string | null;
  category: Category | null;
  categoryId: string | null;
}

interface ArticlesPublicClientProps {
  initialArticles: Article[];
  categories: Category[];
}

const ITEMS_PER_PAGE = 8;

export default function ArticlesPublicClient({
  initialArticles,
  categories,
}: ArticlesPublicClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter articles based on search query and category ID
  const filteredArticles = initialArticles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.excerpt && art.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.tags && art.tags.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategoryId === "All" || art.categoryId === selectedCategoryId;

    return matchesSearch && matchesCategory;
  });

  // Calculate pagination details
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
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
    const time = Math.ceil(words / 225); // average reading speed
    return time < 1 ? 1 : time;
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Filtering Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary-sage/10 pb-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-primary-sage font-bold flex items-center gap-1.5">
            <Sparkles size={11} className="text-accent-gold" />
            Knowledge Repository
          </span>
          <h2 className="font-serif text-3xl font-bold text-primary-forest leading-none">
            Browse Dynamic Wisdom
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
              placeholder="Search wisdom guides, tags..."
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

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {paginatedArticles.length > 0 ? (
            paginatedArticles.map((art, idx) => (
              <motion.article
                key={art.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: (idx % 4) * 0.05 }}
                className="group flex flex-col bg-[#FCFCFA] rounded-2xl overflow-hidden border border-primary-sage/10 hover:shadow-xl transition-all duration-300 relative gold-glow"
              >
                {/* Featured Image */}
                <div className="relative h-48 overflow-hidden bg-primary-forest/5">
                  {art.featuredImage ? (
                    <img
                      src={art.featuredImage}
                      alt={art.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-forest/10 to-primary-sage/10 flex items-center justify-center text-primary-sage/40">
                      <BookOpen size={48} className="stroke-[1.25]" />
                    </div>
                  )}
                  {art.category && (
                    <span className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-bold text-primary-forest bg-secondary-cream/95 px-2.5 py-1 rounded-sm border border-primary-sage/10">
                      {art.category.name}
                    </span>
                  )}
                </div>

                {/* Metadata & Title */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between text-[9px] text-foreground/50 font-bold border-b border-primary-sage/5 pb-2">
                    <span>By Sattvic Living Team</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {calculateReadTime(art.content)} Min Read
                    </span>
                  </div>

                  <h3 className="font-serif text-base font-bold text-primary-forest leading-snug group-hover:text-primary-sage transition-colors line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-3">
                    {art.excerpt || art.content.replace(/<[^>]*>/g, "").slice(0, 120) + "..."}
                  </p>

                  {/* Tags */}
                  {art.tags && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-3 border-t border-primary-sage/5">
                      {art.tags.split(",").slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[9px] font-medium text-primary-forest bg-primary-sage/10 px-2 py-0.5 rounded-sm"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Read Link */}
                  <Link
                    href={`/articles/${art.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Read article: ${art.title}`}
                  />
                </div>
              </motion.article>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-3">
              <BookOpenCheck size={52} className="text-primary-sage/30 stroke-[1.25]" />
              <span className="font-serif text-lg font-bold text-primary-forest">No articles found</span>
              <span className="text-xs text-foreground/50 max-w-xs">
                We couldn&apos;t find any articles matching your search query. Try broadening your keywords.
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
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
