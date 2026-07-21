"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShieldAlert, SlidersHorizontal, ArrowRight, Sparkles, AlertCircle, X, Leaf, RotateCcw, Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Meal {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  image: string | null;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isFeatured: boolean;
  isAvailable: boolean;
  category: {
    name: string;
    slug: string;
  };
}

interface MealsCatalogProps {
  categories: Category[];
}

export default function MealsCatalog({ categories }: MealsCatalogProps) {
  // Query Filter States
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [maxPrice, setMaxPrice] = useState(30);
  const [minProtein, setMinProtein] = useState(0);
  const [maxCalories, setMaxCalories] = useState(800);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 6;

  // Mobile Filter Sidebar Toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch meals on filter changes
  const loadMeals = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const queryParams = new URLSearchParams({
        search,
        category: selectedCategory,
        isAvailable: onlyAvailable ? "true" : "",
        isFeatured: onlyFeatured ? "true" : "",
        maxPrice: maxPrice.toString(),
        minProtein: minProtein.toString(),
        maxCalories: maxCalories.toString(),
        page: page.toString(),
        limit: limit.toString(),
      });

      const res = await fetch(`/api/meals?${queryParams.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch meals.");

      setMeals(data.meals);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load meal catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      loadMeals();
    }, 250); // Debounce typing input

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory, onlyAvailable, onlyFeatured, maxPrice, minProtein, maxCalories, page]);

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setOnlyAvailable(false);
    setOnlyFeatured(false);
    setMaxPrice(30);
    setMinProtein(0);
    setMaxCalories(800);
    setPage(1);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category Tags */}
      <div>
        <h4 className="font-serif text-sm font-bold text-primary-forest border-b border-primary-sage/10 pb-2 mb-3">
          Meal Category
        </h4>
        <div className="flex flex-wrap md:flex-col gap-2">
          <button
            onClick={() => { setSelectedCategory(""); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-left text-xs font-medium transition-all ${
              selectedCategory === ""
                ? "bg-primary-forest text-[#FCFCFA] font-semibold"
                : "bg-secondary-cream/50 text-foreground/75 hover:bg-[#F8F4EC] border border-primary-sage/10"
            }`}
          >
            All Nourishments
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-left text-xs font-medium transition-all ${
                selectedCategory === cat.slug
                  ? "bg-primary-forest text-[#FCFCFA] font-semibold"
                  : "bg-secondary-cream/50 text-foreground/75 hover:bg-[#F8F4EC] border border-primary-sage/10"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing Filters */}
      <div>
        <div className="flex justify-between items-center mb-2 border-b border-primary-sage/10 pb-2">
          <h4 className="font-serif text-sm font-bold text-primary-forest">Price Limit</h4>
          <span className="text-xs font-bold text-primary-forest font-mono">${maxPrice}</span>
        </div>
        <input
          type="range"
          min="5"
          max="40"
          step="0.5"
          value={maxPrice}
          onChange={(e) => { setMaxPrice(parseFloat(e.target.value)); setPage(1); }}
          className="w-full h-1 bg-primary-sage/20 rounded-lg appearance-none cursor-pointer accent-primary-forest"
        />
        <div className="flex justify-between text-[10px] text-foreground/50 mt-1 font-mono">
          <span>$5</span>
          <span>$40</span>
        </div>
      </div>

      {/* Nutrition Benchmarks */}
      <div className="space-y-4">
        <h4 className="font-serif text-sm font-bold text-primary-forest border-b border-primary-sage/10 pb-2">
          Nutrition Focus
        </h4>

        {/* Max Calories */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-foreground/70">Max Calories</span>
            <span className="font-bold text-primary-forest font-mono">{maxCalories} kcal</span>
          </div>
          <input
            type="range"
            min="200"
            max="1000"
            step="25"
            value={maxCalories}
            onChange={(e) => { setMaxCalories(parseInt(e.target.value, 10)); setPage(1); }}
            className="w-full h-1 bg-primary-sage/20 rounded-lg appearance-none cursor-pointer accent-primary-forest"
          />
        </div>

        {/* Min Protein */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-foreground/70">Min Protein</span>
            <span className="font-bold text-primary-forest font-mono">{minProtein}g</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="2"
            value={minProtein}
            onChange={(e) => { setMinProtein(parseInt(e.target.value, 10)); setPage(1); }}
            className="w-full h-1 bg-primary-sage/20 rounded-lg appearance-none cursor-pointer accent-primary-forest"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2.5 pt-2 border-t border-primary-sage/10">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => { setOnlyAvailable(e.target.checked); setPage(1); }}
            className="rounded text-primary-forest border-primary-sage/30 focus:ring-primary-forest w-4 h-4"
          />
          <span className="text-xs text-foreground/80">Available Today Only</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyFeatured}
            onChange={(e) => { setOnlyFeatured(e.target.checked); setPage(1); }}
            className="rounded text-primary-forest border-primary-sage/30 focus:ring-primary-forest w-4 h-4"
          />
          <span className="text-xs text-foreground/80 flex items-center gap-1">
            <Sparkles size={11} className="text-accent-gold fill-accent-gold" />
            Featured Chef Specialties
          </span>
        </label>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="flex items-center justify-center gap-2 w-full border border-primary-sage/20 text-primary-forest text-xs font-semibold py-2 rounded-lg hover:bg-primary-forest/5 transition-all mt-4"
      >
        <RotateCcw size={13} />
        Clear Filters
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#FCFCFA]/80 backdrop-blur-md p-4 rounded-xl border border-primary-sage/10 shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/45" />
          <input
            type="text"
            placeholder="Search healthy bowls, adaptogenic milks, soups..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-forest/20 focus:border-primary-forest transition-all"
          />
        </div>

        {/* Total counts / Mobile trigger */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
          <span className="text-xs text-foreground/50 font-light hidden md:inline">
            Showing <strong className="font-semibold text-primary-forest">{totalCount}</strong> dynamic recipes
          </span>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center gap-2 border border-primary-sage/35 text-primary-forest text-xs font-bold px-3 py-2 rounded-lg"
          >
            <SlidersHorizontal size={14} />
            Filters
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Left Side: Desktop Filters */}
        <div className="hidden md:block md:col-span-1 bg-[#FCFCFA] p-6 rounded-xl border border-primary-sage/15 shadow-sm space-y-6 sticky top-24">
          <FilterPanel />
        </div>

        {/* Right Side: Meals list */}
        <div className="md:col-span-3 space-y-8 min-h-[400px] relative">
          {errorMsg && (
            <div className="p-4 bg-red-500/5 border border-red-500/15 text-xs text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="animate-spin text-primary-forest" size={32} />
              <span className="text-xs text-foreground/45">Harvesting recipes from the kitchen database...</span>
            </div>
          ) : meals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {meals.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group flex flex-col justify-between bg-[#FCFCFA] rounded-xl border border-primary-sage/15 overflow-hidden shadow-sm hover:shadow-md hover:border-primary-forest/20 transition-all duration-300 relative"
                >
                  {/* Tags Overlay */}
                  <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                    {meal.isFeatured && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent-gold text-primary-forest shadow-sm border border-accent-gold/20">
                        <Sparkles size={9} className="fill-primary-forest" />
                        Featured
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-primary-forest text-[#FCFCFA] shadow-sm border border-primary-sage/10 self-start">
                      {meal.category.name}
                    </span>
                  </div>

                  {/* Meal Picture */}
                  <Link href={`/meals/${meal.slug}`} className="block overflow-hidden relative aspect-[4/3] bg-primary-sage/5">
                    {meal.image ? (
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-sage">
                        <Leaf size={32} />
                      </div>
                    )}
                    
                    {/* Out of stock banner */}
                    {!meal.isAvailable && (
                      <div className="absolute inset-0 bg-[#2D3E35]/40 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-[#FCFCFA]/90 text-primary-forest text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-primary-sage/20 flex items-center gap-1.5 shadow-sm">
                          <ShieldAlert size={12} className="text-red-500" />
                          Sold Out
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Body details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Name & price */}
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <h3 className="font-serif text-sm font-bold text-primary-forest group-hover:text-accent-gold-dark transition-colors line-clamp-1">
                          {meal.name}
                        </h3>
                        <span className="text-xs font-bold text-primary-forest font-mono">${meal.price.toFixed(2)}</span>
                      </div>

                      <p className="text-[11px] text-foreground/60 leading-relaxed line-clamp-2 mb-3.5">
                        {meal.shortDescription}
                      </p>
                    </div>

                    {/* Macros bottom section */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 text-center border-t border-primary-sage/10 pt-3 text-[10px]">
                        <div>
                          <div className="font-bold text-primary-forest font-mono">{meal.calories}</div>
                          <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-light">Cal</div>
                        </div>
                        <div>
                          <div className="font-bold text-primary-forest font-mono">{meal.protein}g</div>
                          <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-light">Prot</div>
                        </div>
                        <div>
                          <div className="font-bold text-primary-forest font-mono">{meal.carbs}g</div>
                          <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-light">Carb</div>
                        </div>
                        <div>
                          <div className="font-bold text-primary-forest font-mono">{meal.fat}g</div>
                          <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-light">Fat</div>
                        </div>
                      </div>

                      <Link
                        href={`/meals/${meal.slug}`}
                        className="flex items-center justify-center gap-1.5 w-full bg-[#F8F4EC] hover:bg-primary-forest hover:text-[#FCFCFA] text-primary-forest text-[10px] uppercase tracking-widest font-bold py-2 rounded-lg transition-all duration-300 focus:outline-none"
                      >
                        Wellness Profile
                        <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-[#FCFCFA] rounded-xl border border-primary-sage/15 p-12 text-center text-foreground/40 font-light flex flex-col items-center justify-center space-y-3">
              <Leaf size={32} className="text-primary-sage/40" />
              <div>
                <p className="font-medium text-primary-forest">No recipes found matching your filters.</p>
                <button
                  onClick={resetFilters}
                  className="text-xs text-accent-gold hover:underline mt-1 font-semibold"
                >
                  Clear all search filters and start over
                </button>
              </div>
            </div>
          )}

          {/* Catalog Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-primary-sage/10 bg-[#FCFCFA] rounded-xl border">
              <span className="text-[10px] text-foreground/60">
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} meals found)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg border border-primary-sage/20 disabled:opacity-40 hover:bg-[#F8F4EC] text-primary-forest transition-colors focus:outline-none"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-[10px] uppercase font-bold rounded-lg border border-primary-sage/20 disabled:opacity-40 hover:bg-[#F8F4EC] text-primary-forest transition-colors focus:outline-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Slide-over */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 md:hidden bg-primary-forest/30 backdrop-blur-sm">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-80 max-w-xs h-full bg-[#FCFCFA] p-6 border-r border-primary-sage/20 shadow-2xl relative flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between border-b border-primary-sage/10 pb-3.5 mb-6">
                  <h3 className="font-serif text-base font-bold text-primary-forest">Catalog Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="text-foreground/45 hover:text-foreground">
                    <X size={18} />
                  </button>
                </div>

                <FilterPanel />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
