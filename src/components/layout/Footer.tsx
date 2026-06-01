"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, Heart, ShieldCheck, ArrowUp } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-primary-forest text-secondary-cream/90 pt-16 pb-8 px-6 border-t border-primary-sage/10 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-sage/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-secondary-cream/10 pb-12">
        {/* Brand info */}
        <div className="flex flex-col gap-4">
          <span className="font-serif text-xl font-bold tracking-wide text-secondary-white flex items-center gap-1.5">
            SATTVIC
            <span className="text-accent-gold font-sans font-light tracking-widest text-[9px] border border-accent-gold/30 px-1 py-0.5 rounded-sm">
              LIVING
            </span>
          </span>
          <p className="text-sm text-secondary-cream/70 leading-relaxed font-light">
            A premium sanctuary for spiritual alignment, ancient Ayurvedic wisdom, restorative yoga practices, and organic sattvic nourishment.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a
              href="#"
              className="p-2 rounded-full border border-secondary-cream/15 hover:border-accent-gold hover:text-accent-gold transition-colors"
              aria-label="Follow Sattvic Living on Instagram"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a
              href="#"
              className="p-2 rounded-full border border-secondary-cream/15 hover:border-accent-gold hover:text-accent-gold transition-colors"
              aria-label="Send us an Email"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Directory Columns */}
        <div>
          <h4 className="font-serif text-secondary-white font-medium text-base mb-4 tracking-wide">
            The Journey
          </h4>
          <nav className="flex flex-col gap-2.5 text-sm text-secondary-cream/75">
            <Link href="/yoga" className="hover:text-accent-gold hover:translate-x-1 transition-all duration-200">
              Yoga Practices
            </Link>
            <Link href="/ayurveda" className="hover:text-accent-gold hover:translate-x-1 transition-all duration-200">
              Ayurvedic Consultations
            </Link>
            <Link href="/meals" className="hover:text-accent-gold hover:translate-x-1 transition-all duration-200">
              Sattvic Kitchen & Nutrition
            </Link>
          </nav>
        </div>

        <div>
          <h4 className="font-serif text-secondary-white font-medium text-base mb-4 tracking-wide">
            Sanctuary Resources
          </h4>
          <nav className="flex flex-col gap-2.5 text-sm text-secondary-cream/75">
            <Link href="/library" className="hover:text-accent-gold hover:translate-x-1 transition-all duration-200">
              Sacred Book Library
            </Link>
            <Link href="/about" className="hover:text-accent-gold hover:translate-x-1 transition-all duration-200">
              Our Core Philosophy
            </Link>
            <Link href="/contact" className="hover:text-accent-gold hover:translate-x-1 transition-all duration-200">
              Schedule Consultation
            </Link>
          </nav>
        </div>

        {/* Newsletter column */}
        <div className="flex flex-col gap-4">
          <h4 className="font-serif text-secondary-white font-medium text-base tracking-wide">
            Weekly Inner Light
          </h4>
          <p className="text-xs text-secondary-cream/70 leading-relaxed font-light">
            Subscribe to receive hand-written notes on Ayurvedic wisdom, meditation prompts, and seasonal recipes.
          </p>

          <AnimatePresence mode="wait">
            {!subscribed ? (
              <motion.form
                key="subscription-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex items-center border-b border-secondary-cream/20 py-1.5 focus-within:border-accent-gold transition-colors"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-transparent border-none text-secondary-cream placeholder:text-secondary-cream/45 text-sm focus:outline-none w-full pr-2"
                  aria-label="Email address for newsletter subscription"
                />
                <button
                  type="submit"
                  className="text-secondary-cream hover:text-accent-gold transition-colors focus:outline-none"
                  aria-label="Submit email address"
                >
                  <Send size={16} />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="subscription-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-3.5 rounded-lg bg-primary-sage/15 border border-primary-sage/20 flex items-center gap-2.5 text-xs text-accent-gold"
              >
                <ShieldCheck size={16} className="shrink-0" />
                <span>Deep gratitude. You are added to our circle.</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Bottom bar */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-secondary-cream/60">
        <div className="flex items-center gap-1.5 leading-none">
          <span>&copy; {new Date().getFullYear()} Sattvic Living. Created with</span>
          <Heart size={10} className="text-accent-gold fill-accent-gold" />
          <span>for spiritual harmony. All Rights Reserved.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="#" className="hover:text-accent-gold transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-accent-gold transition-colors">
            Terms of Use
          </Link>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 hover:text-accent-gold transition-colors focus:outline-none py-1 px-2.5 rounded border border-secondary-cream/10 hover:border-accent-gold/45"
            aria-label="Scroll to top of page"
          >
            <span>Top</span>
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
    </footer>
  );
}
