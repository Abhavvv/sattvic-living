/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Sun, Heart, Sparkles, ChevronRight, Star } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import { yogaPrograms, ayurvedaArticles, sattvicMeals, books, instructors } from "@/data/mockData";

export default function HomePage() {
  // Grab a subset of mock data for featured listings
  const featuredYoga = yogaPrograms.slice(0, 3);
  const featuredArticles = ayurvedaArticles.slice(0, 3);
  const featuredMeals = sattvicMeals.slice(0, 3);
  const featuredBooks = books.slice(0, 3);
  const spotlightInstructors = instructors.slice(0, 3);

  const benefits = [
    {
      icon: <Sparkles className="text-accent-gold" size={24} />,
      title: "Clarity of Mind (Sattva)",
      desc: "Nourish the subtle channels of the brain to unlock continuous clarity, sustained concentration, and natural creative flow.",
    },
    {
      icon: <Sun className="text-accent-gold" size={24} />,
      title: "Pranic Vitality",
      desc: "Expand your cellular energy reserves (Ojas) through clean breathwork, structural movement, and high-prana organic meals.",
    },
    {
      icon: <Heart className="text-accent-gold" size={24} />,
      title: "Nervous System Rest",
      desc: "Soothe chronic modern stress, balance endocrine secretions, and establish a deeply grounded feeling inside your own body.",
    },
    {
      icon: <Compass className="text-accent-gold" size={24} />,
      title: "Biological Balance",
      desc: "Learn to identify physical and mental signs of doshic imbalance and proactively adjust habits with seasonal routines.",
    },
  ];

  const testimonials = [
    {
      quote: "Sattvic Living completely transformed my approach to health. Incorporating the restorative Yin practices alongside the Kitchari cleansing recipes cleared my chronic bloating and anxiety within weeks.",
      author: "Sarah K.",
      role: "Mindfulness Teacher, 38",
      rating: 5,
    },
    {
      quote: "The Ayurvedic guides are incredibly accessible. I completed the Dosha Quiz, realized my Pitta was highly inflamed, and changed my routine. The daily morning routine (Dinacharya) is now my sacred anchor.",
      author: "Marcus D.",
      role: "Creative Director, 44",
      rating: 5,
    },
    {
      quote: "As a yoga practitioner of ten years, I am highly impressed by the lineage authenticity. Swami Kripal's Kundalini modules are a profound masterclass in respiratory mechanics and bio-energy.",
      author: "Elena V.",
      role: "Holistic Practitioner, 32",
      rating: 5,
    },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* HERO SECTION */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Nature Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 ease-out scale-105"
            style={{
              backgroundImage: `linear-gradient(rgba(45, 62, 53, 0.45), rgba(45, 62, 53, 0.65)), url('https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1920')`,
            }}
          />
          
          {/* Subtle gold visual flare */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-[#FCFCFA] flex flex-col items-center gap-6">
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xs uppercase tracking-widest text-accent-gold border border-accent-gold/45 px-3 py-1 rounded-full font-semibold"
            >
              A Sanctuary for Conscious Wholeness
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.3 }}
              className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] max-w-4xl"
            >
              Return to Your <br />
              <span className="text-secondary-cream italic font-normal">Pristine Nature</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.5 }}
              className="text-lg sm:text-xl text-[#FCFCFA]/85 max-w-2xl font-light leading-relaxed"
            >
              Align your modern life with the eternal rhythms of classical Yoga, Ayurvedic diagnostic wisdom, and high-prana organic meals.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98], delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center gap-4 mt-4"
            >
              <Link
                href="/yoga"
                className="w-full sm:w-auto text-xs font-bold uppercase tracking-widest text-primary-forest px-8 py-4 rounded-full bg-secondary-cream hover:bg-accent-gold hover:text-primary-forest transition-all duration-300 shadow-lg hover:shadow-accent-gold/25 text-center flex items-center justify-center gap-2 group"
              >
                Explore Yoga
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                href="/ayurveda"
                className="w-full sm:w-auto text-xs font-bold uppercase tracking-widest text-secondary-white px-8 py-4 rounded-full bg-primary-forest/40 border border-secondary-white/35 backdrop-blur-sm hover:bg-primary-forest/80 transition-all duration-300 text-center"
              >
                Determine Your Dosha
              </Link>
            </motion.div>
          </div>

          {/* Scroll Down Hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#FCFCFA]/60 flex flex-col items-center gap-2 text-[10px] uppercase tracking-widest animate-bounce">
            <span>Scroll to Enter</span>
            <div className="w-0.5 h-6 bg-accent-gold/50 rounded-full" />
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="py-24 px-6 bg-[#FCFCFA]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 flex flex-col gap-5">
                <span className="text-xs uppercase tracking-widest text-primary-forest font-bold">
                  Sattvic Path
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary-forest leading-tight">
                  Restore the sacred harmony of mind, breath, and cell.
                </h2>
                <p className="text-sm text-foreground/80 leading-relaxed font-light">
                  Modern living creates high biological noise. By returning to seasonal living, intentional alignment, and highly pure nutrition, the body naturally discharges accumulated toxicity and restores deep vitality.
                </p>
                <div className="mt-2">
                  <Link
                    href="/about"
                    className="text-xs font-bold uppercase tracking-widest text-accent-gold hover:text-primary-forest transition-colors flex items-center gap-1 group"
                  >
                    Learn Our Core Lineage
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map((benefit, idx) => (
                  <FadeUp key={benefit.title} delay={idx * 0.1} className="p-6 rounded-xl bg-[#F8F4EC] border border-primary-sage/10 hover:shadow-md transition-shadow flex flex-col gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#FCFCFA] flex items-center justify-center border border-primary-sage/15">
                      {benefit.icon}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary-forest">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-foreground/75 leading-relaxed font-light">
                      {benefit.desc}
                    </p>
                  </FadeUp>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURED YOGA PROGRAMS */}
        <section className="py-24 px-6 bg-[#F8F4EC]">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase tracking-widest text-primary-sage font-bold">
                  Pranic Movement
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest">
                  Featured Yoga Programs
                </h2>
              </div>
              <Link
                href="/yoga"
                className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-6 py-3 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm"
              >
                View Class Schedule
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredYoga.map((prog, idx) => {
                const instructor = instructors.find((i) => i.id === prog.instructorId);
                return (
                  <FadeUp key={prog.id} delay={idx * 0.1} className="group flex flex-col bg-[#FCFCFA] rounded-2xl overflow-hidden border border-primary-sage/10 hover:shadow-xl transition-all duration-300">
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={prog.image}
                        alt={prog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold text-[#FCFCFA] bg-primary-forest/85 px-3 py-1 rounded-full backdrop-blur-sm">
                        {prog.category}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col gap-3 flex-1">
                      <div className="flex items-center justify-between text-xs text-foreground/60">
                        <span>{prog.duration} Minutes</span>
                        <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                        <span>{prog.level}</span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-primary-forest group-hover:text-primary-sage transition-colors">
                        {prog.title}
                      </h3>

                      <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-2">
                        {prog.description}
                      </p>

                      <div className="border-t border-primary-sage/10 pt-4 mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={instructor?.image}
                            alt={instructor?.name}
                            className="w-8 h-8 rounded-full object-cover border border-primary-sage/20"
                          />
                          <span className="text-[11px] font-medium text-foreground/80">
                            {instructor?.name}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-accent-gold">
                          {prog.sessions} Sessions
                        </span>
                      </div>
                    </div>
                  </FadeUp>
                );
              })}
            </div>
          </div>
        </section>

        {/* AYURVEDA KNOWLEDGE HIGHLIGHTS */}
        <section className="py-24 px-6 bg-[#FCFCFA]">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
                Vedic Wisdom
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest">
                Ayurveda Knowledge Highlights
              </h2>
              <p className="text-sm text-foreground/75 font-light">
                Discover clean guidelines on seasonal lifestyle adjustments, herbal formulations, and elemental therapies to build resilient immunity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredArticles.map((art, idx) => (
                <FadeUp key={art.id} delay={idx * 0.1} className="flex flex-col bg-[#F8F4EC] rounded-2xl overflow-hidden border border-primary-sage/10 hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold text-primary-forest bg-secondary-cream/90 px-3 py-1 rounded-full">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between text-[10px] text-foreground/50 font-medium">
                      <span>{art.publishedDate}</span>
                      <span>{art.readTime} Min Read</span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-primary-forest line-clamp-2 leading-snug">
                      {art.title}
                    </h3>

                    <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-3">
                      {art.description}
                    </p>

                    <Link
                      href="/ayurveda"
                      className="text-xs font-bold uppercase tracking-wider text-accent-gold hover:text-primary-forest transition-colors mt-auto pt-2 flex items-center gap-1 group"
                    >
                      Read Article
                      <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* SATTVIC MEAL SHOWCASE */}
        <section className="py-24 px-6 bg-[#F8F4EC] relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase tracking-widest text-primary-sage font-bold">
                  Sattvic Kitchen
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest">
                  Pure Nourishment Showcase
                </h2>
              </div>
              <Link
                href="/meals"
                className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-6 py-3 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300"
              >
                Browse Weekly Plans
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredMeals.map((meal, idx) => (
                <FadeUp key={meal.id} delay={idx * 0.1} className="group bg-[#FCFCFA] rounded-2xl overflow-hidden border border-primary-sage/10 hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-forest/80 via-transparent to-transparent opacity-60" />
                    <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold text-[#FCFCFA] bg-primary-forest/85 px-3 py-1 rounded-full backdrop-blur-sm">
                      {meal.category}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <h3 className="font-serif text-xl font-bold text-primary-forest">
                      {meal.name}
                    </h3>
                    <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-2">
                      {meal.description}
                    </p>

                    {/* Nutrition highlights panel */}
                    <div className="grid grid-cols-4 gap-2 bg-[#F8F4EC] p-3 rounded-lg border border-primary-sage/5 text-center">
                      <div>
                        <span className="block text-[10px] text-foreground/50">Cals</span>
                        <span className="text-xs font-bold text-primary-forest">{meal.macros.calories}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-foreground/50">Carb</span>
                        <span className="text-xs font-bold text-primary-forest">{meal.macros.carbs}g</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-foreground/50">Prot</span>
                        <span className="text-xs font-bold text-primary-forest">{meal.macros.protein}g</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-foreground/50">Fat</span>
                        <span className="text-xs font-bold text-primary-forest">{meal.macros.fat}g</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-primary-sage/10 text-[10px]">
                      <span className="text-foreground/50">Dosha Suitability:</span>
                      <span className="badge-sage px-2 py-0.5 rounded-sm">Vata</span>
                      <span className="badge-gold px-2 py-0.5 rounded-sm">Pitta</span>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED BOOKS */}
        <section className="py-24 px-6 bg-[#FCFCFA]">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
                  Sacred Texts
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest">
                  Featured Book Library
                </h2>
              </div>
              <Link
                href="/library"
                className="text-xs font-bold uppercase tracking-widest text-primary-forest border border-primary-forest/35 hover:bg-primary-forest hover:text-[#FCFCFA] px-6 py-3 rounded-full transition-colors"
              >
                Browse Library
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredBooks.map((book, idx) => (
                <FadeUp key={book.id} delay={idx * 0.1} className="bg-[#F8F4EC] rounded-2xl p-6 border border-primary-sage/10 hover:shadow-lg transition-all duration-300 flex items-start gap-4">
                  <div className="w-24 sm:w-28 h-36 sm:h-40 shrink-0 shadow-md rounded-md overflow-hidden relative border border-primary-sage/10 bg-primary-forest/5">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-2 h-full flex-1">
                    <span className="badge-gold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded w-fit leading-none">
                      {book.category}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-primary-forest leading-tight line-clamp-2">
                      {book.title}
                    </h3>
                    <span className="text-xs text-foreground/70 font-light">
                      By {book.author}
                    </span>

                    {/* Ratings */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center text-accent-gold">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={11} className="fill-accent-gold text-accent-gold" />
                        ))}
                      </div>
                      <span className="text-[10px] text-foreground/50 font-bold">
                        ({book.reviewsCount} Reviews)
                      </span>
                    </div>

                    <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-2 mt-1">
                      {book.description}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* INSTRUCTOR SPOTLIGHT */}
        <section className="py-24 px-6 bg-[#F8F4EC]">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-primary-forest font-bold">
                Divine Lineage
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest">
                Instructor Spotlight
              </h2>
              <p className="text-sm text-foreground/75 font-light">
                Meet our certified lineage guides who share their deep realization, anatomical expertise, and somatic healing practices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {spotlightInstructors.map((ins, idx) => (
                <FadeUp key={ins.id} delay={idx * 0.1} className="bg-[#FCFCFA] rounded-2xl overflow-hidden border border-primary-sage/10 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center p-6 gap-4">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-accent-gold/45 relative shadow-inner">
                    <img
                      src={ins.image}
                      alt={ins.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-lg font-bold text-primary-forest">
                      {ins.name}
                    </h3>
                    <span className="text-xs text-accent-gold font-medium tracking-wide uppercase">
                      {ins.specialty}
                    </span>
                  </div>

                  <p className="text-xs text-foreground/75 leading-relaxed font-light italic px-2">
                    &ldquo;{ins.bio.slice(0, 120)}...&rdquo;
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-1.5 mt-auto pt-4 border-t border-primary-sage/10 w-full">
                    {ins.certifications.slice(0, 2).map((cert) => (
                      <span key={cert} className="text-[9px] text-foreground/60 bg-[#F8F4EC] border border-primary-sage/5 px-2 py-0.5 rounded-sm">
                        {cert}
                      </span>
                    ))}
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-24 px-6 bg-[#FCFCFA] relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-sage/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="text-center max-w-2xl mx-auto flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
                Inner Reflections
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest">
                What Our Members Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <FadeUp key={t.author} delay={idx * 0.1} className="bg-[#F8F4EC] p-8 rounded-2xl border border-primary-sage/10 relative flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center text-accent-gold mb-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={14} className="fill-accent-gold text-accent-gold" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed font-light italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex flex-col border-t border-primary-sage/10 pt-4 mt-auto">
                    <span className="font-serif text-base font-bold text-primary-forest">
                      {t.author}
                    </span>
                    <span className="text-xs text-foreground/50">
                      {t.role}
                    </span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER SIGNUP BANNER */}
        <section className="py-20 px-6 bg-primary-forest text-[#FCFCFA] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-forest via-primary-forest to-[#2D3E35] opacity-50" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary-sage/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Weekly Sanctuary Notes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight max-w-2xl">
              Nourish your inner stillness directly in your inbox.
            </h2>
            <p className="text-sm sm:text-base text-[#FCFCFA]/80 leading-relaxed font-light max-w-xl">
              Join 12,000+ souls who receive our weekly handwritten essays on Vedic philosophy, seasonal diet tips, and soothing somatic rituals.
            </p>

            <Link
              href="/contact"
              className="text-xs font-bold uppercase tracking-widest text-primary-forest px-8 py-4 rounded-full bg-secondary-cream hover:bg-accent-gold transition-colors mt-2"
            >
              Join Our Circle
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
