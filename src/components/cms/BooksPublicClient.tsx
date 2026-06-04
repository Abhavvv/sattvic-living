"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, BookOpen, Star } from "lucide-react";

interface Book {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  coverImage: string | null;
  pdfUrl: string | null;
  isPremium: boolean;
  createdAt: Date | string | null;
}

interface BooksPublicClientProps {
  initialBooks: Book[];
}

const ITEMS_PER_PAGE = 6;

export default function BooksPublicClient({ initialBooks }: BooksPublicClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter books based on search query
  const filteredBooks = initialBooks.filter((book) => {
    return (
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Calculate pagination details
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE) || 1;
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Filtering header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary-sage/10 pb-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-primary-forest font-bold flex items-center gap-1.5">
            <Sparkles size={11} className="text-accent-gold" />
            Sacred Texts
          </span>
          <h2 className="font-serif text-3xl font-bold text-primary-forest leading-none">
            Curated Bookshelf
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
              placeholder="Search titles, authors, translators..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-secondary-cream border border-primary-sage/15 rounded-full py-2.5 pl-10 pr-4 text-xs w-full text-foreground placeholder:text-foreground/45 focus:outline-none focus:border-accent-gold transition-colors focus:ring-1 focus:ring-accent-gold"
            />
          </div>
        </div>
      </div>

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[350px]">
        <AnimatePresence mode="popLayout">
          {paginatedBooks.length > 0 ? (
            paginatedBooks.map((book, idx) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: (idx % 3) * 0.05 }}
                className="group bg-[#F8F4EC] rounded-2xl p-6 border border-primary-sage/10 hover:shadow-xl hover:border-accent-gold/20 transition-all duration-300 flex items-start gap-5 relative gold-glow"
              >
                {/* Book cover artwork */}
                <div className="w-24 sm:w-28 h-36 sm:h-40 shrink-0 shadow-md rounded-md overflow-hidden relative border border-primary-sage/10 bg-primary-forest/5">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-forest/10 to-primary-sage/10 flex items-center justify-center text-primary-sage/40">
                      <BookOpen size={36} className="stroke-[1.25]" />
                    </div>
                  )}
                </div>

                {/* Metadata details */}
                <div className="flex flex-col gap-2 h-full flex-1 text-left">
                  {book.isPremium ? (
                    <span className="badge-gold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded w-fit leading-none font-bold">
                      Premium
                    </span>
                  ) : (
                    <span className="badge-sage text-[8px] uppercase tracking-widest px-2 py-0.5 rounded w-fit leading-none font-bold">
                      Free Access
                    </span>
                  )}

                  <h3 className="font-serif text-base sm:text-lg font-bold text-primary-forest leading-tight line-clamp-2">
                    {book.title}
                  </h3>

                  <span className="text-xs text-foreground/70 font-light leading-none">
                    By {book.author}
                  </span>

                  {/* Rating Stars Visual */}
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex items-center text-accent-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={11} className="fill-accent-gold text-accent-gold" />
                      ))}
                    </div>
                    <span className="text-[10px] text-foreground/50 font-bold leading-none">
                      (5.0)
                    </span>
                  </div>

                  <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-2 mt-1">
                    {book.description}
                  </p>

                  <Link
                    href={`/online-books/${book.slug}`}
                    className="text-[10px] uppercase font-bold tracking-widest text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage transition-all px-4 py-2.5 rounded-full shadow-sm hover:shadow mt-2 w-fit focus:outline-none"
                  >
                    Read Details
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-3">
              <BookOpen size={52} className="text-primary-sage/30 stroke-[1.25]" />
              <span className="font-serif text-lg font-bold text-primary-forest">No books found</span>
              <span className="text-xs text-foreground/50 max-w-xs">
                We couldn&apos;t find any books matching your search. Try adjusting your query or look for free access catalogs.
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
