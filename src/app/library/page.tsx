/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, BookOpen, X, Sparkles, ExternalLink, Calendar, Layers } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { books, Book } from "@/data/mockData";

export default function BookLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeBookModal, setActiveBookModal] = useState<Book | null>(null);

  const categories = ["All", "Philosophy", "Practice", "Recipes", "Ayurveda"];

  // Filter books based on search and category
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        {/* BANNER */}
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
              Sanctuary Texts
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              The Sacred <br />
              <span className="italic font-normal text-secondary-white">Wisdom Library</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Explore primary manuals, philosophical translations, culinary guidebooks, and medical textbooks dedicated to conscious self-realization.
            </p>
          </div>
        </section>

        {/* SEARCH & FILTERS CONTROLS */}
        <section className="py-16 px-6 bg-[#FCFCFA] max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-primary-sage/10 pb-8">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-primary-forest font-bold">
                Browse Repository
              </span>
              <h2 className="font-serif text-3xl font-bold text-primary-forest leading-none">
                Our Curated Bookshelf
              </h2>
            </div>

            {/* Inputs Panel */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              {/* Fuzzy Search */}
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-sage">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search titles, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#F8F4EC] border border-primary-sage/15 rounded-full py-2.5 pl-10 pr-4 text-xs w-full text-foreground placeholder:text-foreground/45 focus:outline-none focus:border-accent-gold"
                />
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border shrink-0 transition-colors focus:outline-none ${
                      selectedCategory === cat
                        ? "bg-primary-forest text-[#FCFCFA] border-primary-forest"
                        : "bg-[#F8F4EC] text-foreground/80 border-primary-sage/10 hover:border-primary-sage"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Book Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book, idx) => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group bg-[#F8F4EC] rounded-2xl p-6 border border-primary-sage/10 hover:shadow-xl hover:border-accent-gold/20 transition-all duration-300 flex items-start gap-5"
                  >
                    {/* Cover art container */}
                    <div className="w-24 sm:w-28 h-36 sm:h-40 shrink-0 shadow-md rounded-md overflow-hidden relative border border-primary-sage/10 bg-primary-forest/5">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                    </div>

                    {/* Book Metadata */}
                    <div className="flex flex-col gap-2 h-full flex-1 text-left">
                    <span className="badge-gold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded w-fit leading-none">
                      {book.category}
                    </span>
                      
                      <h3 className="font-serif text-base sm:text-lg font-bold text-primary-forest leading-tight line-clamp-2">
                        {book.title}
                      </h3>
                      
                      <span className="text-xs text-foreground/70 font-light leading-none">
                        By {book.author}
                      </span>

                      {/* Ratings stars display */}
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex items-center text-accent-gold">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={11} className="fill-accent-gold text-accent-gold" />
                          ))}
                        </div>
                        <span className="text-[10px] text-foreground/50 font-bold leading-none">
                          ({book.reviewsCount})
                        </span>
                      </div>

                      <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-2 mt-1">
                        {book.description}
                      </p>

                      <button
                        onClick={() => setActiveBookModal(book)}
                        className="text-[10px] uppercase font-bold tracking-widest text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage transition-all px-4 py-2.5 rounded-full shadow-sm hover:shadow mt-2 w-fit focus:outline-none"
                      >
                        Read Details
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-2">
                  <BookOpen size={48} className="text-primary-sage/40" />
                  <span className="font-serif text-lg font-bold text-primary-forest">No books matched</span>
                  <span className="text-xs text-foreground/50">Try broadening your search criteria.</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* DETAILED DIALOG MODAL */}
      <AnimatePresence>
        {activeBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveBookModal(null)}
              className="absolute inset-0 bg-[#2D3E35]/40 backdrop-blur-sm"
            />

            {/* Modal Content container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-primary-sage/15 z-10 gold-glow flex flex-col gap-6 text-left overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setActiveBookModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F8F4EC] hover:bg-primary-sage/10 text-primary-forest transition-colors focus:outline-none"
                aria-label="Close book details modal"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Book cover enlarged */}
                <div className="w-36 h-52 shrink-0 shadow-lg rounded-lg overflow-hidden border border-primary-sage/15 bg-primary-forest/5 relative mx-auto sm:mx-0">
                  <img
                    src={activeBookModal.image}
                    alt={activeBookModal.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Main description data */}
                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge-gold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded leading-none">
                      {activeBookModal.category}
                    </span>
                    <span className="text-[10px] text-foreground/50 font-medium flex items-center gap-1">
                      <Calendar size={11} /> Published {activeBookModal.publishYear}
                    </span>
                    <span className="text-[10px] text-foreground/50 font-medium flex items-center gap-1">
                      <Layers size={11} /> {activeBookModal.pages} Pages
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-primary-forest leading-tight">
                    {activeBookModal.title}
                  </h3>
                  
                  <span className="text-sm font-medium text-foreground/80 leading-none">
                    Written by {activeBookModal.author}
                  </span>

                  {/* Ratings */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-accent-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className="fill-accent-gold text-accent-gold" />
                      ))}
                    </div>
                    <span className="text-xs text-foreground/60 font-bold">
                      {activeBookModal.rating} out of 5 stars &bull; ({activeBookModal.reviewsCount} verified reviews)
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed font-light mt-1">
                    {activeBookModal.description}
                  </p>
                </div>
              </div>

              {/* Featured review section */}
              <div className="p-5 bg-[#F8F4EC] rounded-xl border border-primary-sage/10 flex flex-col gap-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1">
                  <Sparkles size={12} /> Highlighted Member Reflection
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-accent-gold">
                    {[...Array(activeBookModal.featuredReview.rating)].map((_, i) => (
                      <Star key={i} size={11} className="fill-accent-gold text-accent-gold" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-primary-forest leading-none">
                    Reviewed by {activeBookModal.featuredReview.user}
                  </span>
                </div>
                <p className="text-xs text-foreground/75 leading-relaxed font-light italic mt-1">
                  &ldquo;{activeBookModal.featuredReview.comment}&rdquo;
                </p>
              </div>

              {/* Action layout */}
              <div className="border-t border-primary-sage/10 pt-4 flex items-center justify-between gap-4 mt-auto">
                <span className="text-xs text-foreground/50 italic leading-relaxed font-light max-w-xs">
                  Sattvic Library offers reading recommendations. Purchase links are visual placeholders.
                </span>
                <a
                  href={activeBookModal.purchaseLink}
                  onClick={(e) => e.preventDefault()}
                  className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage px-6 py-3.5 rounded-full flex items-center gap-1.5 shrink-0 transition-colors focus:outline-none"
                >
                  Acquire Book
                  <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
