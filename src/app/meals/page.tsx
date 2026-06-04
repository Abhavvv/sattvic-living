/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, CheckCircle2, X, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";

interface DBMeal {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  ingredients: string;
  benefits: string;
  doshaVata: string;
  doshaPitta: string;
  doshaKapha: string;
}

interface ParsedMeal {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  macros: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
  ingredients: string[];
  benefits: string[];
  doshaSuitability: {
    vata: string;
    pitta: string;
    kapha: string;
  };
}

export default function SattvicMealsPage() {
  const [meals, setMeals] = useState<ParsedMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string; period: string; desc: string; features: string[]; recommended?: boolean } | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [address, setAddress] = useState("");
  const [zipcode, setZipcode] = useState("");

  useEffect(() => {
    async function loadMeals() {
      try {
        const res = await fetch("/api/meals");
        if (!res.ok) throw new Error("Failed to fetch meals");
        const data: DBMeal[] = await res.json();
        const parsed = data.map((meal) => ({
          id: meal.id,
          name: meal.name,
          category: meal.category,
          description: meal.description,
          image: meal.image,
          macros: {
            calories: meal.calories,
            carbs: meal.carbs,
            protein: meal.protein,
            fat: meal.fat,
          },
          ingredients: meal.ingredients.split(",").map((s) => s.trim()),
          benefits: meal.benefits.split(",").map((s) => s.trim()),
          doshaSuitability: {
            vata: meal.doshaVata,
            pitta: meal.doshaPitta,
            kapha: meal.doshaKapha,
          },
        }));
        setMeals(parsed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMeals();
  }, []);

  const mealPlans = [
    {
      name: "Vata-Balancing Weekly Plan",
      price: "$140",
      period: "per week",
      desc: "Deeply grounding, warm, oily, and nourishing cooked dishes to soothe restlessness and dry biological channels.",
      features: ["7 breakfast bowls & 7 grounding dinners", "Spiced Ashwagandha Moon Milk included", "Daily early morning hot delivery", "Reusable insulated glass containers"],
    },
    {
      name: "Pitta-Cooling Weekly Plan",
      price: "$140",
      period: "per week",
      desc: "Cooling, dry, high-fiber, and naturally sweet recipes to pacify heat, calm inflammation, and steady sharp tempers.",
      features: ["7 cooling oatmeal bowls & 7 kitcharis", "Cooling fresh juices & herbal teas", "Daily early morning cold delivery", "100% allergy-safe preparation guidelines"],
    },
    {
      name: "Sattvic Daily Nourishment Plan",
      price: "$390",
      period: "per month",
      desc: "Our gold standard. A complete seasonal rotation of breakfasts, lunches, and beverages for absolute spiritual purity.",
      features: ["Daily delivery: Breakfast, Lunch, & drink", "Weekly Ayurvedic practitioner consultation", "Complimentary yoga schedule access", "Priority early morning deliveries"],
      recommended: true,
    },
  ];

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address && zipcode) {
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setSelectedPlan(null);
        setAddress("");
        setZipcode("");
      }, 3000);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        {/* BANNER */}
        <section className="relative py-20 bg-primary-forest text-secondary-cream px-6 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Pranic Nutrition
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              The Sattvic <br />
              <span className="italic font-normal text-secondary-white">Sacred Kitchen</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Nourish your mind with high-prana organic ingredients. Prepped fresh daily, completely vegetarian, and tailored to constitutional metabolic needs.
            </p>
          </div>
        </section>

        {/* SATTVIC MEALS DECK SHOWCASE */}
        <section className="py-20 px-6 max-w-7xl mx-auto flex flex-col gap-12 bg-[#FCFCFA]">
          <div className="flex flex-col gap-3 text-center max-w-xl mx-auto">
            <span className="text-xs uppercase tracking-widest text-primary-sage font-bold">Chef Creations</span>
            <h2 className="font-serif text-3xl font-bold text-primary-forest">Our Signature Recipes</h2>
            <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-light">
              Explore how each dish balance proteins, healthy fats, and elements, meticulously calculated to align your energy centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            {loading ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-accent-gold" size={28} />
                <span className="text-xs font-semibold text-primary-forest uppercase tracking-widest">Nourishing Recipe Deck...</span>
              </div>
            ) : meals.length === 0 ? (
              <div className="col-span-full py-12 text-center text-foreground/45 italic font-light">
                No signature recipes found in our kitchen records.
              </div>
            ) : meals.map((meal, idx) => (
                <FadeUp key={meal.id} delay={idx * 0.08} className="group bg-[#F8F4EC] rounded-3xl p-6 sm:p-8 border border-primary-sage/10 hover:shadow-xl hover:border-accent-gold/25 transition-all duration-300 flex flex-col lg:flex-row gap-6">
                
                {/* Meal image zoomed */}
                <div className="w-full lg:w-48 h-48 lg:h-full shrink-0 rounded-2xl overflow-hidden shadow border border-primary-sage/10 relative bg-primary-forest/5">
                  <img
                    src={meal.image}
                    alt={meal.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                  <span className="absolute top-3 left-3 text-[9px] uppercase tracking-widest font-bold text-[#FCFCFA] bg-primary-forest/85 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    {meal.category}
                  </span>
                </div>

                {/* Details layout */}
                <div className="flex flex-col gap-3.5 flex-1 text-left">
                  <h3 className="font-serif text-xl font-bold text-primary-forest">
                    {meal.name}
                  </h3>
                  
                  <p className="text-xs text-foreground/75 leading-relaxed font-light">
                    {meal.description}
                  </p>

                  {/* Macro indices breakdown */}
                  <div className="grid grid-cols-4 gap-2 bg-[#FCFCFA] p-3 rounded-lg border border-primary-sage/5 text-center shadow-inner">
                    <div>
                      <span className="block text-[9px] text-foreground/50 leading-none">Calories</span>
                      <span className="text-xs font-bold text-primary-forest">{meal.macros.calories}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-foreground/50 leading-none">Carbs</span>
                      <span className="text-xs font-bold text-primary-forest">{meal.macros.carbs}g</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-foreground/50 leading-none">Protein</span>
                      <span className="text-xs font-bold text-primary-forest">{meal.macros.protein}g</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-foreground/50 leading-none">Fats</span>
                      <span className="text-xs font-bold text-primary-forest">{meal.macros.fat}g</span>
                    </div>
                  </div>

                  {/* Dosha suitability meters */}
                  <div className="flex flex-col gap-1.5 mt-1 border-t border-primary-sage/10 pt-3">
                    <span className="text-[10px] uppercase font-bold text-primary-sage">Constitutional Suitability:</span>
                    <div className="flex items-center gap-3 text-[10px]">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary-sage rounded-full" />
                        <span className="text-foreground/70">Vata:</span>
                        <span className="font-semibold text-primary-forest">{meal.doshaSuitability.vata}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                        <span className="text-foreground/70">Pitta:</span>
                        <span className="font-semibold text-accent-gold">{meal.doshaSuitability.pitta}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-primary-forest rounded-full" />
                        <span className="text-foreground/70">Kapha:</span>
                        <span className="font-semibold text-primary-forest">{meal.doshaSuitability.kapha}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* SUBSCRIPTIONS PRICING PLAN CARDS */}
        <section className="py-24 px-6 bg-[#F8F4EC]">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col gap-3 text-center max-w-xl mx-auto">
              <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">Sanctuary Nourishment</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest">Kitchen Subscription Plans</h2>
              <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-light">
                Subscribe to receive fresh meals delivered in insulated glass containers early morning. Tailored to your active doshic metabolism.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4 items-stretch">
              {mealPlans.map((plan) => (
                <FadeUp
                  key={plan.name}
                  className={`relative flex flex-col p-8 rounded-3xl bg-[#FCFCFA] border hover:shadow-xl transition-all duration-300 ${
                    plan.recommended
                      ? "border-accent-gold shadow-md gold-glow scale-103 z-10"
                      : "border-primary-sage/10"
                  }`}
                >
                  {plan.recommended && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest font-bold text-[#FCFCFA] bg-accent-gold px-4 py-1.5 rounded-full shadow-sm">
                      Highly Recommended
                    </span>
                  )}

                  <div className="flex flex-col gap-1 border-b border-primary-sage/10 pb-6 mb-6 text-left">
                    <h3 className="font-serif text-xl font-bold text-primary-forest">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-foreground/60 leading-relaxed font-light mt-1.5 h-12">
                      {plan.desc}
                    </p>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="font-serif text-4xl font-bold text-primary-forest">{plan.price}</span>
                      <span className="text-xs text-foreground/50 font-light">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="flex flex-col gap-3.5 text-left mb-8 flex-1">
                    {plan.features.map((feat) => (
                      <li key={feat} className="text-xs text-foreground/80 flex items-start gap-2.5 font-light leading-snug">
                        <CheckCircle2 size={15} className="text-accent-gold shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full text-xs font-bold uppercase tracking-widest py-4 rounded-full transition-all focus:outline-none ${
                      plan.recommended
                        ? "text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage shadow-md"
                        : "text-primary-forest border border-primary-forest/35 hover:bg-primary-forest hover:text-[#FCFCFA]"
                    }`}
                  >
                    Select Plan
                  </button>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* SUBSCRIPTION checkout MODAL */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-[#2D3E35]/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl border border-primary-sage/15 z-10 gold-glow flex flex-col gap-5 text-left"
            >
              <button
                onClick={() => setSelectedPlan(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F8F4EC] hover:bg-primary-sage/10 text-primary-forest transition-colors focus:outline-none"
                aria-label="Close subscription form"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col gap-1.5 border-b border-primary-sage/10 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1">
                  <Leaf size={12} /> Pure Kitchen Subscription
                </span>
                <h3 className="font-serif text-2xl font-bold text-primary-forest leading-tight">
                  {selectedPlan.name}
                </h3>
                <span className="text-xs text-foreground/50">
                  Rate: <strong>{selectedPlan.price}</strong> {selectedPlan.period}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {!orderSuccess ? (
                  <motion.form
                    key="order-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleOrderSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <label htmlFor="address-input" className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Delivery Address
                      </label>
                      <input
                        id="address-input"
                        required
                        type="text"
                        placeholder="Ex: 108 Sanctuary Way, Lotus Hills"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="bg-[#F8F4EC] border border-primary-sage/10 text-foreground text-sm rounded-lg p-3 w-full focus:outline-none focus:border-accent-gold"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="zipcode-input" className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Postal Code / ZIP
                      </label>
                      <input
                        id="zipcode-input"
                        required
                        type="text"
                        placeholder="Ex: 90210"
                        value={zipcode}
                        onChange={(e) => setZipcode(e.target.value)}
                        className="bg-[#F8F4EC] border border-primary-sage/10 text-foreground text-sm rounded-lg p-3 w-full focus:outline-none focus:border-accent-gold"
                      />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-accent-gold/5 rounded-lg border border-accent-gold/15 text-xs text-foreground/85 leading-relaxed font-light mt-1">
                      <AlertCircle size={14} className="text-accent-gold shrink-0" />
                      <span>Delivery zones are mock locations for demonstration. Checkouts simulate immediately.</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-4 rounded-full bg-primary-forest hover:bg-primary-sage transition-all shadow-md hover:shadow-lg focus:outline-none mt-2"
                    >
                      Subscribe Now
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="order-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 flex flex-col items-center justify-center text-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary-sage/15 flex items-center justify-center text-primary-forest border-2 border-primary-forest/30">
                      <ShieldCheck size={36} />
                    </div>
                    <div>
                      <h4 className="font-serif text-xl font-bold text-primary-forest">
                        Subscription Complete!
                      </h4>
                      <p className="text-xs text-foreground/70 leading-relaxed font-light mt-2 max-w-xs">
                        A kitchen manager is prepped to commence morning delivery at <strong>{address}</strong> starting tomorrow morning.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}
