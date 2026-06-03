/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Compass, ShieldCheck, Plus, Minus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";

interface AboutInstructor {
  id: string;
  name: string;
  slug: string;
  bio: string;
  profileImage: string | null;
  certifications: string | null;
  specialization: string;
}

interface AboutFaq {
  id: string;
  question: string;
  answer: string;
}

interface AboutClientProps {
  initialInstructors: AboutInstructor[];
  initialFaqs: AboutFaq[];
}

export default function AboutClient({ initialInstructors, initialFaqs }: AboutClientProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const values = [
    {
      icon: <Sparkles className="text-accent-gold" size={24} />,
      title: "Sattva (Purity)",
      desc: "We commit to absolute purity in materials, teachings, and food. Our actions and ingredients prioritize light, high life force (Prana), and peaceful mental states.",
    },
    {
      icon: <Heart className="text-accent-gold" size={24} />,
      title: "Ahimsa (Compassion)",
      desc: "Our lifestyle is non-harming. We practice radical compassion toward all sentient creatures, reflected in our 100% organic, plant-based culinary choices.",
    },
    {
      icon: <Compass className="text-accent-gold" size={24} />,
      title: "Parampara (Lineage)",
      desc: "We respect ancient traditions. Our yoga and metabolic sciences are not diluted modern trends, but faithful expressions of authentic Vedic scriptures.",
    },
    {
      icon: <ShieldCheck className="text-accent-gold" size={24} />,
      title: "Svadhyaya (Self-Study)",
      desc: "We encourage continuous reflection. Balance is not static; it requires daily curiosity, self-investigation, and adjusting to the cycles of life.",
    },
  ];

  const timelineSteps = [
    {
      year: "2012",
      title: "The Himalayan Spark",
      desc: "Founded in the high caves of Rishikesh, India, following a 12-month silent retreat, with a vision to make ancient metabolic wisdom completely accessible.",
    },
    {
      year: "2016",
      title: "The Rishikesh Sanctuary",
      desc: "Opened our first brick-and-mortar ashram hosting global seekers, offering classical Hatha training and deep silent Vipassana meditation retreats.",
    },
    {
      year: "2020",
      title: "The Sattvic Kitchen",
      desc: "Began preparing high-prana organic foods for ashram residents. Demand exploded, prompting the launch of daily fresh meal deliveries for local communities.",
    },
    {
      year: "2026",
      title: "The Universal Sanctuary",
      desc: "Launched our digital portal, seamlessly connecting practitioners worldwide to hand-curated yoga, Ayurvedic assessments, and kitchen subscriptions.",
    },
  ];

  const toggleFaq = (idx: number) => {
    if (activeFaq === idx) {
      setActiveFaq(null);
    } else {
      setActiveFaq(idx);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#FCFCFA]">
        {/* BANNER HEADER */}
        <section className="relative py-24 bg-primary-forest text-secondary-cream px-6 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-sage/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Our Essence
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              The Path of <br />
              <span className="italic font-normal text-secondary-white">Sattvic Living</span>
            </h1>
            <p className="text-sm sm:text-base text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Discover our history, our commitment to lineage, and the core values that shape our modern sanctuary of wellness.
            </p>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="py-24 px-6 bg-[#FCFCFA]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeUp className="flex flex-col gap-5">
              <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
                Mission Statement
              </span>
              <h2 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
                To simplify ancient biological alignment for modern lives.
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed font-light">
                We believe that modern exhaustion, anxiety, and physiological imbalance are primarily errors of disconnection. Our mission is to build highly aesthetic, reliable, and accessible gateways back to biological nature, empowering seekers to heal themselves from the inside out.
              </p>
              <div className="w-16 h-0.5 bg-accent-gold mt-2" />
            </FadeUp>

            <FadeUp delay={0.1} className="flex flex-col gap-5">
              <span className="text-xs uppercase tracking-widest text-primary-sage font-bold">
                Our Vision
              </span>
              <h2 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
                A world grounded in quietude, truth, and vitality.
              </h2>
              <p className="text-sm text-foreground/80 leading-relaxed font-light">
                We envision global communities where food is viewed as primary medicine, physical movement represents structural worship, and daily life operates in perfect synchronization with natural solar and seasonal cycles. A world where Sattva—clarity and harmony—is our natural state.
              </p>
              <div className="w-16 h-0.5 bg-primary-sage mt-2" />
            </FadeUp>
          </div>
        </section>

        {/* STORY */}
        <section className="py-24 px-6 bg-[#F8F4EC] relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-lg h-[450px] relative border border-primary-sage/15">
              <img
                src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800"
                alt="Meditation inside natural ashram"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-[#2D3E35]/15" />
            </div>

            <div className="lg:col-span-6 flex flex-col gap-6">
              <span className="text-xs uppercase tracking-widest text-primary-forest font-bold">
                The Sacred Chronicle
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest">
                A Sanctuary Born in the Mountains.
              </h2>
              <p className="text-sm text-foreground/85 leading-relaxed font-light">
                In 2012, our founders retreated to a small ashram overlooking the Ganges River in the Himalayas. Disillusioned by the commercialization and fast-paced nature of modern fitness classes, they sought to understand classical Hatha, pranayama, and Ayurvedic lifestyle medicine in their pure, unadulterated forms.
              </p>
              <p className="text-sm text-foreground/85 leading-relaxed font-light">
                What began as a personal journal of somatic healing blossomed into deep community studies. Local elders shared recipes, master yogis instructed on breathing locks (bandhas), and expert herbalists provided formulas for restoring exhausted adrenals. 
              </p>
              <p className="text-sm text-foreground/85 leading-relaxed font-light">
                Sattvic Living represents this accumulated wisdom. We are proud to serve as a modern digital conduit, preserving the pristine depth of ancient lineages while offering frictionless tools for today&apos;s seekers.
              </p>
            </div>
          </div>
        </section>

        {/* TIMELINE */}
        <section className="py-24 px-6 bg-[#FCFCFA]">
          <div className="max-w-4xl mx-auto flex flex-col gap-12">
            <div className="text-center flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-primary-sage font-bold">
                The Chronology
              </span>
              <h2 className="font-serif text-3xl font-bold text-primary-forest">
                Our Evolution Over the Years
              </h2>
            </div>

            <div className="relative border-l border-primary-sage/20 ml-4 md:ml-32 mt-6 flex flex-col gap-12">
              {timelineSteps.map((step, idx) => (
                <FadeUp key={step.year} delay={idx * 0.1} className="relative pl-6 md:pl-10">
                  {/* Timeline bullet */}
                  <span className="absolute -left-[9px] top-1.5 w-4.5 h-4.5 rounded-full bg-[#FCFCFA] border-2 border-accent-gold flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />
                  </span>
                  
                  {/* Year display left-side on md */}
                  <span className="hidden md:block absolute -left-32 top-0.5 text-right w-24 font-serif text-xl font-bold text-accent-gold">
                    {step.year}
                  </span>

                  <div className="p-6 bg-[#F8F4EC] rounded-xl border border-primary-sage/10 hover:shadow-md transition-shadow">
                    <span className="md:hidden block font-serif text-lg font-bold text-accent-gold mb-1">
                      {step.year}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-primary-forest mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-foreground/75 leading-relaxed font-light">
                      {step.desc}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="py-24 px-6 bg-[#F8F4EC]">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="text-center flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
                Core Philosophy
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest">
                The Pillars of Our Sanctuary
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {values.map((v, idx) => (
                <FadeUp key={v.title} delay={idx * 0.1} className="p-6 bg-[#FCFCFA] rounded-2xl border border-primary-sage/15 hover:shadow-lg hover:border-accent-gold/45 transition-all duration-300 flex flex-col gap-3 group">
                  <div className="w-12 h-12 rounded-lg bg-[#F8F4EC] flex items-center justify-center border border-primary-sage/10 group-hover:bg-primary-forest/5 transition-colors">
                    {v.icon}
                  </div>
                  <h3 className="font-serif text-lg font-bold text-primary-forest">
                    {v.title}
                  </h3>
                  <p className="text-xs text-foreground/75 leading-relaxed font-light">
                    {v.desc}
                  </p>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM */}
        <section className="py-24 px-6 bg-[#FCFCFA]">
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            <div className="text-center flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-primary-sage font-bold">
                Our Guardians
              </span>
              <h2 className="font-serif text-3xl font-bold text-primary-forest">
                Our Founders & Lineage Guides
              </h2>
              <p className="text-sm text-foreground/75 font-light max-w-xl mx-auto">
                Dedicated practitioners, Ayurvedic researchers, and alignment masters who preserve and share the teachings daily.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {initialInstructors.length > 0 ? (
                initialInstructors.map((ins, idx) => (
                  <FadeUp key={ins.id} delay={idx * 0.08} className="group bg-[#F8F4EC] rounded-2xl overflow-hidden border border-primary-sage/10 hover:shadow-lg transition-all duration-300 flex flex-col relative">
                    <Link href={`/instructors/${ins.slug}`} className="absolute inset-0 z-10" />
                    <div className="relative h-64 overflow-hidden bg-primary-forest/5">
                      {ins.profileImage ? (
                        <img
                          src={ins.profileImage}
                          alt={ins.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary-sage/20 flex items-center justify-center text-2xl font-bold text-primary-forest">
                          {ins.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col gap-2 flex-1 text-left z-20">
                      <h3 className="font-serif text-lg font-bold text-primary-forest leading-none">
                        {ins.name}
                      </h3>
                      <span className="text-[11px] font-medium tracking-wide uppercase text-accent-gold">
                        {ins.specialization}
                      </span>
                      <p className="text-xs text-foreground/75 leading-relaxed font-light mt-1">
                        {ins.bio.slice(0, 140)}...
                      </p>
                    </div>
                  </FadeUp>
                ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center gap-2 text-foreground/50 bg-[#F8F4EC] border border-primary-sage/10 rounded-2xl">
                  <Heart size={36} className="stroke-[1.25] text-primary-sage/40" />
                  <p className="text-xs font-medium">No instructors registered yet</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQs ACCORDION */}
        <section className="py-24 px-6 bg-[#F8F4EC]">
          <div className="max-w-3xl mx-auto flex flex-col gap-12">
            <div className="text-center flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
                Inquiries & Truths
              </span>
              <h2 className="font-serif text-3xl font-bold text-primary-forest">
                Frequently Asked Inquiries
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {initialFaqs.length > 0 ? (
                initialFaqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <FadeUp key={faq.id} delay={idx * 0.05} className="bg-[#FCFCFA] rounded-xl border border-primary-sage/10 overflow-hidden shadow-sm">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full text-left p-6 flex items-center justify-between gap-4 font-serif text-base font-bold text-primary-forest hover:text-primary-sage transition-colors focus:outline-none"
                        aria-expanded={isOpen}
                      >
                        <span>{faq.question}</span>
                        <span className="shrink-0 p-1 bg-[#F8F4EC] rounded-full text-primary-forest">
                          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-foreground/75 leading-relaxed font-light border-t border-primary-sage/5">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FadeUp>
                  );
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-foreground/50 bg-[#FCFCFA] border border-primary-sage/10 rounded-2xl">
                  <Compass size={36} className="stroke-[1.25] text-primary-sage/40" />
                  <p className="text-xs font-medium">No active FAQs found</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
