"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, HelpCircle, Sparkles } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

interface FaqPublicClientProps {
  initialFaqs: FAQ[];
}

export default function FaqPublicClient({ initialFaqs }: FaqPublicClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter FAQs based on search
  const filteredFaqs = initialFaqs.filter((faq) => {
    return (
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const toggleAccordion = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <section className="py-16 px-6 max-w-3xl mx-auto flex flex-col gap-8">
      {/* Filtering header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary-sage/10 pb-6">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-xs uppercase tracking-widest text-primary-sage font-bold flex items-center gap-1.5">
            <Sparkles size={11} className="text-accent-gold" />
            Support Desk
          </span>
          <h2 className="font-serif text-2xl font-bold text-primary-forest leading-none">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-sage/60">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search FAQs, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary-cream border border-primary-sage/15 rounded-full py-2.5 pl-10 pr-4 text-xs w-full text-foreground placeholder:text-foreground/45 focus:outline-none focus:border-accent-gold transition-colors focus:ring-1 focus:ring-accent-gold"
          />
        </div>
      </div>

      {/* Accordion Layout list */}
      <div className="flex flex-col gap-4 min-h-[250px]">
        <AnimatePresence mode="popLayout">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className="rounded-xl border border-primary-sage/10 bg-[#F8F4EC] overflow-hidden transition-all hover:border-primary-sage/20 shadow-sm"
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left font-serif text-sm sm:text-base font-bold text-primary-forest focus:outline-none select-none gap-4"
                    aria-expanded={isExpanded}
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle size={16} className="text-accent-gold shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-primary-sage shrink-0 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden bg-[#FCFCFA] border-t border-primary-sage/10"
                      >
                        <div className="p-5 text-xs sm:text-sm text-foreground/80 leading-relaxed font-light whitespace-pre-line text-left">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
              <HelpCircle size={52} className="text-primary-sage/30 stroke-[1.25]" />
              <span className="font-serif text-lg font-bold text-primary-forest">No FAQs found</span>
              <span className="text-xs text-foreground/50 max-w-xs">
                We couldn&apos;t find any questions matching your keywords. Please try another search or contact support.
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
