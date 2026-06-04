"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, Sparkles, Activity, MapPin, Video, Award, CircleDollarSign } from "lucide-react";

interface Instructor {
  id: string;
  name: string;
  slug: string;
  profileImage: string | null;
  specialization: string;
}

interface YogaSessionRef {
  id: string;
  availableSeats: number;
  capacity: number;
}

interface YogaClass {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  capacity: number;
  price: number;
  featuredImage: string | null;
  isOnline: boolean;
  instructor: Instructor;
  sessions: YogaSessionRef[];
}

interface YogaClassesPublicClientProps {
  classes: YogaClass[];
}

const ITEMS_PER_PAGE = 8;
const DIFFICULTY_LEVELS = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];
const FORMATS = ["All", "Online", "Studio"];

export default function YogaClassesPublicClient({ classes }: YogaClassesPublicClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedFormat, setSelectedFormat] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique categories from classes
  const categories = ["All", ...Array.from(new Set(classes.map((c) => c.category)))];

  // Filtering logic
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "All" || cls.category === selectedCategory;

    const matchesDifficulty = selectedDifficulty === "All" || cls.difficulty === selectedDifficulty;

    const matchesFormat =
      selectedFormat === "All"
        ? true
        : selectedFormat === "Online"
        ? cls.isOnline
        : !cls.isOnline;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesFormat;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE) || 1;
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleDifficultyChange = (diff: string) => {
    setSelectedDifficulty(diff);
    setCurrentPage(1);
  };

  const handleFormatChange = (fmt: string) => {
    setSelectedFormat(fmt);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Filtering Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-primary-sage/10 pb-8">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-primary-sage font-bold flex items-center gap-1.5">
            <Sparkles size={11} className="text-accent-gold" />
            Yogic Lineages
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest leading-none">
            Sacred Practice Directory
          </h2>
          <p className="text-xs text-foreground/60 font-light mt-1 max-w-md">
            Align body and breath. Filter our seasonal yoga offerings to begin your wellness journey.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full lg:w-auto">
          {/* Search bar */}
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-sage/60">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search classes, styles, instructors..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-[#F8F4EC] border border-primary-sage/15 rounded-full py-2.5 pl-10 pr-4 text-xs w-full lg:w-96 text-foreground placeholder:text-foreground/45 focus:outline-none focus:border-accent-gold transition-colors focus:ring-1 focus:ring-accent-gold"
            />
          </div>

          {/* Quick Filters Group */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Difficulty Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
                className="bg-[#F8F4EC] border border-primary-sage/15 rounded-full px-3 py-1.5 text-xs text-foreground/80 cursor-pointer focus:outline-none focus:border-accent-gold"
              >
                {DIFFICULTY_LEVELS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">Location:</span>
              <select
                value={selectedFormat}
                onChange={(e) => handleFormatChange(e.target.value)}
                className="bg-[#F8F4EC] border border-primary-sage/15 rounded-full px-3 py-1.5 text-xs text-foreground/80 cursor-pointer focus:outline-none focus:border-accent-gold"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`text-[10px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-full border shrink-0 transition-all focus:outline-none cursor-pointer ${
              selectedCategory === cat
                ? "bg-primary-forest text-[#FCFCFA] border-primary-forest shadow-sm"
                : "bg-[#F8F4EC] text-foreground/85 border-primary-sage/10 hover:border-primary-sage"
            }`}
          >
            {cat === "All" ? "All Styles" : cat}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {paginatedClasses.length > 0 ? (
            paginatedClasses.map((cls, idx) => (
              <motion.div
                key={cls.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, delay: (idx % 4) * 0.05 }}
                className="group flex flex-col bg-[#FCFCFA] rounded-2xl overflow-hidden border border-primary-sage/10 hover:shadow-xl transition-all duration-300 relative gold-glow"
              >
                {/* Featured image with online/offline badge */}
                <div className="relative h-48 overflow-hidden bg-primary-forest/5">
                  {cls.featuredImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cls.featuredImage}
                      alt={cls.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-forest/10 to-primary-sage/10 flex items-center justify-center text-primary-sage/40">
                      <Activity size={48} className="stroke-[1.25]" />
                    </div>
                  )}

                  {/* Format Badge */}
                  <span
                    className={`absolute top-4 left-4 text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-sm border ${
                      cls.isOnline
                        ? "bg-blue-500/90 text-white border-blue-600/30"
                        : "bg-amber-500/90 text-white border-amber-600/30"
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {cls.isOnline ? <Video size={10} /> : <MapPin size={10} />}
                      {cls.isOnline ? "Online Live" : "Physical Studio"}
                    </span>
                  </span>

                  {/* Difficulty Badge */}
                  <span className="absolute top-4 right-4 text-[8px] uppercase tracking-widest font-bold text-primary-forest bg-secondary-cream/90 border border-primary-sage/10 px-2.5 py-1 rounded-sm">
                    {cls.difficulty}
                  </span>
                </div>

                {/* Card content */}
                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between text-[9px] text-foreground/50 font-bold border-b border-primary-sage/5 pb-2">
                    <span className="badge-sage px-2 py-0.5 rounded-full text-[9px] font-semibold text-primary-forest">
                      {cls.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} className="text-primary-sage" /> {cls.duration} Mins
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-base font-bold text-primary-forest leading-snug group-hover:text-primary-sage transition-colors line-clamp-1">
                      {cls.title}
                    </h3>

                    <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-3">
                      {cls.description.replace(/<[^>]*>/g, "").slice(0, 140)}...
                    </p>

                    <div className="mt-2 text-[10px] text-primary-sage font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                      {cls.sessions && cls.sessions.length > 0 ? (
                        <span>
                          {cls.sessions.length} session{cls.sessions.length > 1 ? "s" : ""} scheduled &bull;{" "}
                          {cls.sessions.reduce((sum, s) => sum + s.availableSeats, 0)} spots left
                        </span>
                      ) : (
                        <span className="text-foreground/40">No sessions scheduled</span>
                      )}
                    </div>
                  </div>

                  {/* Instructor cardlet & Pricing */}
                  <div className="mt-auto pt-4 border-t border-primary-sage/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border border-primary-sage/15 bg-[#F8F4EC] overflow-hidden flex items-center justify-center shrink-0">
                        {cls.instructor.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cls.instructor.profileImage}
                            alt={cls.instructor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Award size={12} className="text-primary-sage" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-foreground/50 font-bold">Guide</span>
                        <span className="text-[11px] font-semibold text-primary-forest hover:text-accent-gold transition-colors leading-none mt-0.5">
                          {cls.instructor.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] text-foreground/50 font-bold">Class Fee</span>
                      <span className="font-mono text-sm font-bold text-primary-forest leading-none mt-0.5 flex items-center gap-0.5">
                        <CircleDollarSign size={13} className="text-accent-gold" />
                        {cls.price === 0 ? "Free" : `₹${cls.price}`}
                      </span>
                    </div>
                  </div>

                  {/* Read Link */}
                  <Link
                    href={`/yoga-classes/${cls.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={`View class: ${cls.title}`}
                  />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center gap-3">
              <Activity size={52} className="text-primary-sage/30 stroke-[1.25]" />
              <span className="font-serif text-lg font-bold text-primary-forest">No Classes Found</span>
              <span className="text-xs text-foreground/50 max-w-xs">
                We couldn&apos;t find any yoga lineages matching your filter settings. Try relaxing your search filters.
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
