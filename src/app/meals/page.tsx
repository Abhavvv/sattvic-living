import { db } from "@/lib/db";
import MealsCatalog from "@/components/meals/MealsCatalog";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import { Sparkles } from "lucide-react";
import { Metadata } from "next";

export const revalidate = 0; // Fresh database query results on every request

export const metadata: Metadata = {
  title: "Sattvic Nutrition Catalog | Pure Organic Meals",
  description: "Nourish your physical temple. Browse high-prana organic meals, restorative soups, and adaptogenic beverages designed to balance your Doshas.",
};

export default async function SattvicMealsPage() {
  // Query active meal categories for the filter panel
  const categories = await db.mealCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#F8F4EC] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-12 px-6 max-w-7xl w-full mx-auto space-y-12">
        {/* Hero Section */}
        <FadeUp>
          <div className="text-center space-y-4 max-w-2xl mx-auto border-b border-primary-sage/10 pb-8">
            <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold flex items-center justify-center gap-1.5">
              <Sparkles size={11} className="text-accent-gold" />
              High-Prana Nutrition
            </span>
            <h1 className="font-serif text-4xl font-bold text-primary-forest leading-tight">
              Ayurvedic Meal Catalog
            </h1>
            <p className="text-sm text-foreground/75 font-light leading-relaxed">
              Explore dynamic menus prepared with locally harvested organic ingredients, grass-fed ghee, and balancing botanicals tailored to soothe Vata, Pitta, and Kapha systems.
            </p>
          </div>
        </FadeUp>

        {/* Catalog Main browser */}
        <FadeUp delay={0.05}>
          <MealsCatalog categories={categories} />
        </FadeUp>
      </main>

      <Footer />
    </div>
  );
}
