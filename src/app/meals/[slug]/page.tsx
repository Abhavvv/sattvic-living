import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import { ArrowLeft, Sparkles, Leaf, CheckCircle2, ShieldAlert, Clock, Salad, Heart } from "lucide-react";
import { Metadata } from "next";
import { auth } from "@/auth";
import OrderPanel from "@/components/meals/OrderPanel";

interface MealProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: MealProps): Promise<Metadata> {
  const { slug } = await params;
  const meal = await db.meal.findUnique({
    where: { slug },
    select: { name: true, shortDescription: true, metaTitle: true, metaDescription: true }
  });

  if (!meal) {
    return {
      title: "Meal Not Found | Sattvic Living",
    };
  }

  return {
    title: meal.metaTitle || `${meal.name} | Sattvic Nutrition Profile`,
    description: meal.metaDescription || meal.shortDescription,
  };
}

export default async function MealDetailPage({ params }: MealProps) {
  const { slug } = await params;
  const session = await auth();
  const meal = await db.meal.findUnique({
    where: { slug },
    include: { category: true }
  });

  if (!meal || !meal.isPublished) {
    notFound();
  }

  // Parse ingredients and benefits lists
  const ingredientsList = meal.ingredients.split(",").map(i => i.trim()).filter(Boolean);
  const benefitsList = meal.benefits.split(",").map(b => b.trim()).filter(Boolean);

  // Fetch 3 related meals from the same category, excluding current meal
  const relatedMeals = await db.meal.findMany({
    where: {
      categoryId: meal.categoryId,
      id: { not: meal.id },
      isPublished: true,
      isAvailable: true,
    },
    take: 3,
    include: { category: true }
  });

  return (
    <div className="min-h-screen bg-[#F8F4EC] flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-12 px-6 max-w-7xl w-full mx-auto space-y-10">
        {/* Back navigation */}
        <div className="flex items-center">
          <Link
            href="/meals"
            className="inline-flex items-center gap-2 text-xs font-bold text-primary-forest hover:text-accent-gold-dark transition-colors group focus:outline-none"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Nourishment Menu
          </Link>
        </div>

        {/* Hero split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Left Column: Meal Image */}
          <FadeUp>
            <div className="relative rounded-2xl border border-primary-sage/20 overflow-hidden shadow-md aspect-[4/3] bg-primary-sage/5">
              {meal.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-sage/45">
                  <Salad size={64} />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                <span className="px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-forest text-[#FCFCFA] shadow-sm">
                  {meal.category.name}
                </span>
                {meal.isFeatured && (
                  <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-gold text-primary-forest shadow-sm border border-accent-gold/20">
                    <Sparkles size={10} className="fill-primary-forest" />
                    Specialty
                  </span>
                )}
              </div>
            </div>
          </FadeUp>

          {/* Right Column: Nutrition profiling & basic details */}
          <FadeUp delay={0.05}>
            <div className="space-y-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5 mb-1.5">
                  <Leaf size={11} className="text-accent-gold" />
                  Prana-Infused Meal Profile
                </span>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-forest leading-tight">
                  {meal.name}
                </h1>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xl font-bold text-primary-forest font-mono">
                    ${meal.price.toFixed(2)}
                  </span>
                  
                  {/* Stock Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    meal.isAvailable
                      ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-700 border border-red-500/20"
                  }`}>
                    {meal.isAvailable ? (
                      <>
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Available for Daily Delivery
                      </>
                    ) : (
                      <>
                        <ShieldAlert size={12} className="text-red-500" />
                        Sold Out Today
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#FCFCFA] border border-primary-sage/15 rounded-xl shadow-sm space-y-3">
                <h3 className="font-serif text-xs font-bold text-primary-forest">Short Summary</h3>
                <p className="text-xs text-foreground/75 leading-relaxed font-light">
                  {meal.shortDescription}
                </p>
              </div>

              {/* Macro stats blocks */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-[#FCFCFA] p-3.5 rounded-xl border border-primary-sage/15 shadow-sm">
                  <div className="text-lg font-bold text-primary-forest font-mono">{meal.calories}</div>
                  <div className="text-[8px] uppercase tracking-wider text-foreground/50 font-light mt-0.5">Calories</div>
                </div>
                <div className="bg-[#FCFCFA] p-3.5 rounded-xl border border-primary-sage/15 shadow-sm">
                  <div className="text-lg font-bold text-primary-forest font-mono">{meal.protein}g</div>
                  <div className="text-[8px] uppercase tracking-wider text-foreground/50 font-light mt-0.5">Protein</div>
                </div>
                <div className="bg-[#FCFCFA] p-3.5 rounded-xl border border-primary-sage/15 shadow-sm">
                  <div className="text-lg font-bold text-primary-forest font-mono">{meal.carbs}g</div>
                  <div className="text-[8px] uppercase tracking-wider text-foreground/50 font-light mt-0.5">Carbohydrates</div>
                </div>
                <div className="bg-[#FCFCFA] p-3.5 rounded-xl border border-primary-sage/15 shadow-sm">
                  <div className="text-lg font-bold text-primary-forest font-mono">{meal.fat}g</div>
                  <div className="text-[8px] uppercase tracking-wider text-foreground/50 font-light mt-0.5">Fats</div>
                </div>
              </div>

              <div className="text-xs text-foreground/75 font-light leading-relaxed whitespace-pre-line border-t border-primary-sage/15 pt-5">
                {meal.description}
              </div>

              <div className="border-t border-primary-sage/15 pt-6">
                <OrderPanel
                  mealId={meal.id}
                  mealSlug={meal.slug}
                  price={meal.price}
                  isAvailable={meal.isAvailable}
                  isAuthenticated={!!session}
                  userPhone={session?.user?.phone}
                />
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Detailed Sections: Ingredients, preparation, benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Ingredients list */}
          <FadeUp delay={0.1}>
            <div className="bg-[#FCFCFA] p-6 rounded-xl border border-primary-sage/15 shadow-sm h-full space-y-4">
              <h3 className="font-serif text-sm font-bold text-primary-forest border-b border-primary-sage/10 pb-2 flex items-center gap-2">
                <Salad size={16} className="text-accent-gold" />
                Pure Ingredients
              </h3>
              <ul className="space-y-2.5">
                {ingredientsList.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/70 font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-sage mt-1.5 shrink-0" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          {/* Benefits list */}
          <FadeUp delay={0.15}>
            <div className="bg-[#FCFCFA] p-6 rounded-xl border border-primary-sage/15 shadow-sm h-full space-y-4">
              <h3 className="font-serif text-sm font-bold text-primary-forest border-b border-primary-sage/10 pb-2 flex items-center gap-2">
                <Heart size={16} className="text-accent-gold" />
                Doshic & Health Benefits
              </h3>
              <ul className="space-y-2.5">
                {benefitsList.map((ben, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/70 font-light">
                    <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span>{ben}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>

          {/* Preparation / Serving notes */}
          <FadeUp delay={0.2}>
            <div className="bg-[#FCFCFA] p-6 rounded-xl border border-primary-sage/15 shadow-sm h-full space-y-4">
              <h3 className="font-serif text-sm font-bold text-primary-forest border-b border-primary-sage/10 pb-2 flex items-center gap-2">
                <Clock size={16} className="text-accent-gold" />
                Preparation Notes
              </h3>
              <div className="text-xs text-foreground/70 leading-relaxed font-light whitespace-pre-line">
                {meal.preparationNotes}
              </div>
            </div>
          </FadeUp>
        </div>

        {/* Related Meals listing */}
        {relatedMeals.length > 0 && (
          <div className="space-y-6 border-t border-primary-sage/15 pt-10">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-primary-forest">
                Similar Nourishments
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedMeals.map((related) => (
                <div
                  key={related.id}
                  className="group bg-[#FCFCFA] rounded-xl border border-primary-sage/15 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <Link href={`/meals/${related.slug}`} className="block aspect-[4/3] overflow-hidden bg-primary-sage/5 relative">
                    {related.image ? (
                      <img
                        src={related.image}
                        alt={related.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-sage/35">
                        <Salad size={24} />
                      </div>
                    )}
                    <span className="absolute left-3 top-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary-forest text-[#FCFCFA] shadow-sm uppercase tracking-wide">
                      {related.category.name}
                    </span>
                  </Link>

                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-serif text-xs font-bold text-primary-forest truncate max-w-[70%]">
                        {related.name}
                      </h3>
                      <span className="text-[11px] font-bold text-primary-forest font-mono">
                        ${related.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-[10px] text-foreground/55 line-clamp-2 leading-relaxed">
                      {related.shortDescription}
                    </p>

                    <Link
                      href={`/meals/${related.slug}`}
                      className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-accent-gold hover:text-accent-gold-dark transition-colors pt-1"
                    >
                      View Recipe Profile &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
