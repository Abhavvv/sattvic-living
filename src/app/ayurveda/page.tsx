/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Flame, Wind, Layers, Sparkles, BookOpen, Clock, RefreshCw, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import { ayurvedaArticles } from "@/data/mockData";

export default function AyurvedaPage() {
  // Search and Article Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Dosha Quiz States
  const [quizStep, setQuizStep] = useState(0); // 0 = start, 1-4 = questions, 5 = results
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [doshaResult, setDoshaResult] = useState<{ vata: number; pitta: number; kapha: number } | null>(null);

  const categories = ["All", "Lifestyle", "Foundations", "Herbalism", "Food"];

  const quizQuestions = [
    {
      question: "Which describes your physical frame and structural build?",
      options: [
        { text: "Light, slender, bones prominent, joints tend to crack, tall or short.", type: "vata" },
        { text: "Medium build, muscular, athletic, easily gain/lose muscle, average height.", type: "pitta" },
        { text: "Large frame, sturdy, rounded, broad shoulders, gain weight easily.", type: "kapha" },
      ],
    },
    {
      question: "How does your skin typically look and feel?",
      options: [
        { text: "Dry, rough, thin, cool to touch, easily dehydrates in winter.", type: "vata" },
        { text: "Warm, ruddy, prone to redness, moles, freckles, or sensitivity.", type: "pitta" },
        { text: "Thick, soft, cool, smooth, tends to be slightly damp or oily.", type: "kapha" },
      ],
    },
    {
      question: "Which statement best describes your natural response to acute stress?",
      options: [
        { text: "My mind races, I feel anxious, fearful, and suffer immediate insomnia.", type: "vata" },
        { text: "I become impatient, highly irritable, competitive, or quick to anger.", type: "pitta" },
        { text: "I shut down, react slowly, seek comfort in food, and avoid conflict.", type: "kapha" },
      ],
    },
    {
      question: "Which describes your typical digestive power (Agni)?",
      options: [
        { text: "Irregular, erratic appetite, prone to immediate bloating or gas.", type: "vata" },
        { text: "Strong, sharp, intense hunger. Acid reflux if meals are delayed.", type: "pitta" },
        { text: "Slow, heavy, feel full for hours. Weight builds easily even on light diet.", type: "kapha" },
      ],
    },
  ];

  // Handle Dosha Quiz selection
  const handleQuizAnswer = (type: string) => {
    const updatedAnswers = [...quizAnswers, type];
    setQuizAnswers(updatedAnswers);

    if (quizStep < quizQuestions.length) {
      setQuizStep(quizStep + 1);
    }

    if (quizStep === quizQuestions.length) {
      // Calculate results
      const counts = { vata: 0, pitta: 0, kapha: 0 };
      [...quizAnswers, type].forEach((ans) => {
        if (ans === "vata") counts.vata += 1;
        if (ans === "pitta") counts.pitta += 1;
        if (ans === "kapha") counts.kapha += 1;
      });
      setDoshaResult(counts);
      setQuizStep(5); // Show results step
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers([]);
    setDoshaResult(null);
  };

  // Filtered Articles based on search and category
  const filteredArticles = ayurvedaArticles.filter((art) => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Calculate Primary Dosha Profile Text and Recommends
  const getDoshaProfile = () => {
    if (!doshaResult) return null;
    const { vata, pitta, kapha } = doshaResult;
    const maxVal = Math.max(vata, pitta, kapha);

    let primary = "Vata";
    let desc = "You are primarily Air and Ether. You possess high creativity, rapid intellect, and enthusiasm. However, when imbalanced, you are prone to anxiety, dry skin, fatigue, and digestive irregularity.";
    let mealsRec = "Warm, oily, grounding cooked dishes. Restorative golden kitchari prepped with ghee and mild warming spices.";
    let yogaRec = "Yin Yoga Restorative and static Hatha postures that ground the nervous system and warm the lower spine.";
    let lifestyleRec = "Self-massage with warm sesame oil (Abhyanga) before 8:00 AM, and establishing regular sleep cycles.";
    let elementIcon = <Wind className="text-primary-sage shrink-0" size={32} />;

    if (pitta === maxVal) {
      primary = "Pitta";
      desc = "You are primarily Fire and Water. You possess highly sharp intellect, determined focus, and structural passion. Imbalanced, you manifest as quick to anger, highly critical, suffering inflammation or acidity.";
      mealsRec = "Cooling, dry, high-fiber meals. Organic green mung soup, sweet fruits, and nourishing coconut golden beverages.";
      lifestyleRec = "Quiet sound baths, keeping cool in summer, and practicing meditation to temper competitive urges.";
      yogaRec = "Vinyasa flow at moderate speed, and deep cooling Pranayama (Sitali breath) to release physical heat.";
      elementIcon = <Flame className="text-accent-gold shrink-0" size={32} />;
    } else if (kapha === maxVal) {
      primary = "Kapha";
      desc = "You are primarily Water and Earth. You possess quiet emotional stability, deep compassion, and excellent immunity. When imbalanced, you manifest as lethargy, physical congestion, weight gain, and stubborness.";
      mealsRec = "Light, stimulating, dry, hot meals. Bitter greens, sprouted whole mung beans with fresh ginger, and minimal fats.";
      lifestyleRec = "Daily vigorous exercise, rising before 6:00 AM, and seeking variety to stimulate the mind.";
      yogaRec = "Dynamic, heat-building Kundalini Kriyas and rapid solar salutations to challenge muscle groups and clear congestion.";
      elementIcon = <Layers className="text-primary-forest shrink-0" size={32} />;
    }

    return { primary, desc, mealsRec, yogaRec, lifestyleRec, elementIcon };
  };

  const doshaProfile = getDoshaProfile();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        {/* BANNER */}
        <section className="relative py-20 bg-primary-forest text-secondary-cream px-6 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Metabolic Science
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              The Science of <br />
              <span className="italic font-normal text-secondary-white">Ayurvedic Healing</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Ayurveda is a 5,000-year-old medical system defining health as the dynamic balance of nature&apos;s elements inside your individual biology.
            </p>
          </div>
        </section>

        {/* INTERACTIVE DOSHA QUIZ CARD PANEL */}
        <section className="py-20 px-6 bg-[#FCFCFA] max-w-4xl mx-auto">
          <FadeUp className="relative rounded-3xl glass-panel p-8 sm:p-12 border border-primary-sage/15 shadow-xl gold-glow overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent-gold/5 rounded-full blur-2xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {/* Step 0: Welcome Screen */}
              {quizStep === 0 && (
                <motion.div
                  key="step-welcome"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-6 text-center items-center"
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold bg-primary-forest/5 border border-accent-gold/30 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
                    <Sparkles size={12} /> Diagnostic Matrix
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
                    Determine Your Vedic Constitution (Prakriti)
                  </h2>
                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-light max-w-xl">
                    Take our 4-step interactive metabolic quiz. This analyses your structural skeletal form, skin tendencies, and cognitive stress responses to determine your primary Dosha constitution.
                  </p>
                  <button
                    onClick={() => setQuizStep(1)}
                    className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all focus:outline-none mt-2"
                  >
                    Start Assessment
                  </button>
                </motion.div>
              )}

              {/* Steps 1-4: Questions */}
              {quizStep > 0 && quizStep <= 4 && (
                <motion.div
                  key={`step-${quizStep}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-6 text-left"
                >
                  <div className="flex items-center justify-between border-b border-primary-sage/10 pb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent-gold">
                      Question {quizStep} of 4
                    </span>
                    <div className="w-24 h-1.5 bg-[#F8F4EC] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-sage transition-all duration-300"
                        style={{ width: `${(quizStep / 4) * 100}%` }}
                      />
                    </div>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary-forest">
                    {quizQuestions[quizStep - 1].question}
                  </h3>

                  <div className="flex flex-col gap-3.5 mt-2">
                    {quizQuestions[quizStep - 1].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(opt.type)}
                        className="text-xs sm:text-sm text-foreground/85 text-left p-5 rounded-xl bg-[#F8F4EC] border border-primary-sage/10 hover:border-accent-gold/45 hover:bg-[#FCFCFA] transition-all duration-200 shadow-sm focus:outline-none flex items-center justify-between gap-4 group"
                      >
                        <span>{opt.text}</span>
                        <ChevronRight size={16} className="text-primary-sage group-hover:translate-x-1.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Results */}
              {quizStep === 5 && doshaResult && doshaProfile && (
                <motion.div
                  key="step-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-8 text-left"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-primary-sage/10 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                      {doshaProfile.elementIcon}
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-accent-gold">Your Primary Doshic Force</span>
                        <h3 className="font-serif text-2xl font-bold text-primary-forest leading-none">
                          {doshaProfile.primary} Type
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={resetQuiz}
                      className="text-[10px] font-bold uppercase tracking-wider text-foreground/50 hover:text-primary-forest flex items-center gap-1.5 focus:outline-none border border-primary-sage/15 px-3.5 py-2 rounded-full bg-[#F8F4EC] hover:bg-[#FCFCFA] transition-all"
                    >
                      <RefreshCw size={12} /> Retake Assessment
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-light">
                    {doshaProfile.desc}
                  </p>

                  {/* Metabolic bar breakdown */}
                  <div className="flex flex-col gap-3.5 p-5 bg-[#F8F4EC] rounded-xl border border-primary-sage/10">
                    <h4 className="font-serif text-sm font-bold text-primary-forest leading-none border-b border-primary-sage/5 pb-2">
                      Doshic Balance Percentages
                    </h4>
                    <div className="flex flex-col gap-2.5">
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-foreground/75 mb-1 uppercase">
                          <span>Vata (Air & Ether)</span>
                          <span>{Math.round((doshaResult.vata / 4) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#FCFCFA] rounded-full overflow-hidden">
                          <div className="h-full bg-primary-sage" style={{ width: `${(doshaResult.vata / 4) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-foreground/75 mb-1 uppercase">
                          <span>Pitta (Fire & Water)</span>
                          <span>{Math.round((doshaResult.pitta / 4) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#FCFCFA] rounded-full overflow-hidden">
                          <div className="h-full bg-accent-gold" style={{ width: `${(doshaResult.pitta / 4) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-foreground/75 mb-1 uppercase">
                          <span>Kapha (Water & Earth)</span>
                          <span>{Math.round((doshaResult.kapha / 4) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#FCFCFA] rounded-full overflow-hidden">
                          <div className="h-full bg-primary-forest" style={{ width: `${(doshaResult.kapha / 4) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="p-4 bg-[#FCFCFA] border border-primary-sage/10 rounded-xl flex flex-col gap-1.5 shadow-sm">
                      <span className="text-[9px] uppercase font-bold text-primary-sage">Nourishment</span>
                      <h4 className="font-serif text-sm font-bold text-primary-forest leading-snug">Diet Recommendations</h4>
                      <p className="text-[11px] text-foreground/75 leading-relaxed font-light mt-1">
                        {doshaProfile.mealsRec}
                      </p>
                    </div>

                    <div className="p-4 bg-[#FCFCFA] border border-primary-sage/10 rounded-xl flex flex-col gap-1.5 shadow-sm">
                      <span className="text-[9px] uppercase font-bold text-accent-gold">Movement</span>
                      <h4 className="font-serif text-sm font-bold text-primary-forest leading-snug">Somatic Alignment</h4>
                      <p className="text-[11px] text-foreground/75 leading-relaxed font-light mt-1">
                        {doshaProfile.yogaRec}
                      </p>
                    </div>

                    <div className="p-4 bg-[#FCFCFA] border border-primary-sage/10 rounded-xl flex flex-col gap-1.5 shadow-sm">
                      <span className="text-[9px] uppercase font-bold text-primary-forest">Rituals</span>
                      <h4 className="font-serif text-sm font-bold text-primary-forest leading-snug">Lifestyle Anchors</h4>
                      <p className="text-[11px] text-foreground/75 leading-relaxed font-light mt-1">
                        {doshaProfile.lifestyleRec}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </FadeUp>
        </section>

        {/* ARTICLES SECTIONS */}
        <section className="py-16 px-6 bg-[#F8F4EC]">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-primary-sage/10 pb-8">
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase tracking-widest text-primary-forest font-bold">
                  Sacred Library
                </span>
                <h2 className="font-serif text-3xl font-bold text-primary-forest leading-none">
                  Vedic Knowledge Articles
                </h2>
              </div>

              {/* Fuzzy Search and Categories Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                {/* Search Bar Input */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary-sage">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search articles, herbs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#FCFCFA] border border-primary-sage/15 rounded-full py-2.5 pl-10 pr-4 text-xs w-full text-foreground placeholder:text-foreground/45 focus:outline-none focus:border-accent-gold"
                  />
                </div>

                {/* Categories */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full border shrink-0 transition-colors focus:outline-none ${
                        selectedCategory === cat
                          ? "bg-primary-forest text-[#FCFCFA] border-primary-forest"
                          : "bg-[#FCFCFA] text-foreground/80 border-primary-sage/10 hover:border-primary-sage"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((art, idx) => (
                    <motion.article
                      key={art.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="group flex flex-col bg-[#FCFCFA] rounded-2xl overflow-hidden border border-primary-sage/10 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative h-48 overflow-hidden bg-primary-forest/5">
                        <img
                          src={art.image}
                          alt={art.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                        <span className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-bold text-primary-forest bg-[#F8F4EC]/95 px-2.5 py-1 rounded-sm">
                          {art.category}
                        </span>
                      </div>

                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <div className="flex items-center justify-between text-[9px] text-foreground/50 font-bold border-b border-primary-sage/5 pb-2">
                          <span>By {art.author}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} /> {art.readTime} Min
                          </span>
                        </div>

                        <h3 className="font-serif text-base font-bold text-primary-forest leading-snug group-hover:text-primary-sage transition-colors line-clamp-2">
                          {art.title}
                        </h3>

                        <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-3">
                          {art.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-1 mt-auto pt-4">
                          {art.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[9px] font-medium text-primary-forest bg-primary-sage/10 px-2 py-0.5 rounded-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  ))
                ) : (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-2">
                    <BookOpen size={48} className="text-primary-sage/40" />
                    <span className="font-serif text-lg font-bold text-primary-forest">No articles found</span>
                    <span className="text-xs text-foreground/50">Try broadening your search term or selection.</span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
