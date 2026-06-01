"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Flower, Flame, Layers } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when path changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/yoga", label: "Yoga" },
    { href: "/ayurveda", label: "Ayurveda" },
    { href: "/library", label: "Library" },
    { href: "/meals", label: "Meals" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "glass-panel py-3 shadow-sm border-b border-primary-sage/10"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus:outline-none"
            aria-label="Sattvic Living Homepage"
          >
            <span className="font-serif text-2xl font-bold tracking-wide text-primary-forest transition-colors group-hover:text-primary-sage flex items-center gap-1.5">
              SATTVIC
              <span className="text-accent-gold font-sans font-light tracking-widest text-xs border border-accent-gold/30 px-1.5 py-0.5 rounded-sm">
                LIVING
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {/* Mega Menu Toggle Link */}
            <div
              className="relative"
              onMouseEnter={() => setMegaMenuOpen(true)}
              onMouseLeave={() => setMegaMenuOpen(false)}
            >
              <button
                className={`flex items-center gap-1 font-medium text-sm transition-colors py-2 focus:outline-none ${
                  megaMenuOpen || ["/yoga", "/ayurveda", "/meals"].some((p) => pathname === p)
                    ? "text-primary-forest"
                    : "text-foreground/80 hover:text-primary-forest"
                }`}
                aria-expanded={megaMenuOpen}
                aria-haspopup="true"
              >
                Journey <ChevronDown size={14} className={`transition-transform duration-300 ${megaMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Mega Menu Dropdown */}
              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[580px] glass-panel p-6 rounded-lg shadow-xl border border-primary-sage/10 grid grid-cols-3 gap-6 z-50 gold-glow"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-primary-forest font-semibold text-sm border-b border-primary-sage/10 pb-2">
                        <Flower size={16} className="text-primary-sage" />
                        <span>Yoga</span>
                      </div>
                      <p className="text-xs text-foreground/75 mb-2 leading-relaxed">
                        Flow in mindfulness. Rejuvenate structural balance & sacred pranayama.
                      </p>
                      <Link
                        href="/yoga"
                        className="text-xs font-semibold text-accent-gold hover:text-primary-forest flex items-center gap-1 transition-colors mt-auto"
                      >
                        Explore Classes &rarr;
                      </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-primary-forest font-semibold text-sm border-b border-primary-sage/10 pb-2">
                        <Flame size={16} className="text-accent-gold" />
                        <span>Ayurveda</span>
                      </div>
                      <p className="text-xs text-foreground/75 mb-2 leading-relaxed">
                        Discover your unique metabolic constitution. Balance doshas and habits.
                      </p>
                      <Link
                        href="/ayurveda"
                        className="text-xs font-semibold text-accent-gold hover:text-primary-forest flex items-center gap-1 transition-colors mt-auto"
                      >
                        Read Guides &rarr;
                      </Link>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-primary-forest font-semibold text-sm border-b border-primary-sage/10 pb-2">
                        <Layers size={16} className="text-primary-forest" />
                        <span>Nourishment</span>
                      </div>
                      <p className="text-xs text-foreground/75 mb-2 leading-relaxed">
                        Sattvic meal options prepared fresh daily to elevate mental calm and ojas.
                      </p>
                      <Link
                        href="/meals"
                        className="text-xs font-semibold text-accent-gold hover:text-primary-forest flex items-center gap-1 transition-colors mt-auto"
                      >
                        Browse Meals &rarr;
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Static Nav Links */}
            {navLinks.filter(link => !["Yoga", "Ayurveda", "Meals"].includes(link.label)).map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-medium text-sm transition-colors py-2 focus:outline-none ${
                    isActive ? "text-primary-forest" : "text-foreground/80 hover:text-primary-forest"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-gold rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Action */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/yoga"
              className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-5 py-2.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Begin Journey
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-primary-forest hover:text-primary-sage transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed inset-0 z-40 bg-[#F8F4EC] flex flex-col justify-between p-8 pt-24"
          >
            {/* Background design elements */}
            <div className="absolute top-20 right-0 w-72 h-72 bg-primary-sage/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-20 left-0 w-72 h-72 bg-accent-gold/10 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col gap-6 mt-4">
              <span className="font-serif text-sm tracking-widest text-primary-sage uppercase border-b border-primary-sage/10 pb-2">
                Sacred Navigation
              </span>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link, idx) => {
                  const isActive = pathname === link.href;
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={`font-serif text-2xl transition-colors flex items-center justify-between ${
                          isActive ? "text-primary-forest font-semibold" : "text-foreground/80 hover:text-primary-forest"
                        }`}
                      >
                        {link.label}
                        {isActive && <span className="w-1.5 h-1.5 bg-accent-gold rounded-full" />}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Bottom Info */}
            <div className="flex flex-col gap-4 border-t border-primary-sage/10 pt-6">
              <p className="text-xs text-foreground/60 italic leading-relaxed">
                &ldquo;Purity of body yields clarity of mind, which blossoms into spiritual tranquility.&rdquo;
              </p>
              <Link
                href="/contact"
                className="w-full text-center text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-3 rounded-full bg-primary-forest hover:bg-primary-sage transition-colors"
              >
                Schedule Consultation
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
