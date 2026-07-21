"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Flower, Flame, Layers, LogOut, User, Shield, Settings, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";

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
    setAvatarMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home" },
    ...(isLoggedIn
      ? [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/profile", label: "Profile" },
          { href: "/settings", label: "Settings" },
        ]
      : []),
    { href: "/yoga-classes", label: "Yoga Classes" },
    { href: "/instructors", label: "Instructors" },
    { href: "/ayurveda-learning", label: "Ayurveda" },
    { href: "/online-books", label: "Library" },
    { href: "/articles", label: "Articles" },
    { href: "/meals", label: "Meals" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
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
                  megaMenuOpen || ["/yoga-classes", "/instructors", "/ayurveda-learning", "/meals"].some((p) => pathname.startsWith(p))
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
                      <div className="flex flex-col gap-1.5 mt-auto">
                        <Link
                          href="/yoga-classes"
                          className="text-xs font-semibold text-accent-gold hover:text-primary-forest flex items-center gap-1 transition-colors"
                        >
                          Explore Classes &rarr;
                        </Link>
                        <Link
                          href="/instructors"
                          className="text-xs font-semibold text-accent-gold hover:text-primary-forest flex items-center gap-1 transition-colors"
                        >
                          Meet Guides &rarr;
                        </Link>
                      </div>
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
                        href="/ayurveda-learning"
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
            {navLinks.filter(link => !["Yoga Classes", "Instructors", "Ayurveda", "Meals"].includes(link.label)).map((link) => {
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
            {isLoggedIn ? (
              <div className="flex items-center gap-4 relative">
                {/* Admin Mode Switcher Toggle */}
                {session?.user?.role === "ADMIN" && (
                  <Link
                    href={pathname.startsWith("/admin") ? "/dashboard" : "/admin"}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold tracking-wider text-accent-gold hover:text-accent-gold/80 bg-accent-gold/10 hover:bg-accent-gold/15 rounded-full transition-all duration-300 border border-accent-gold/20"
                    title={pathname.startsWith("/admin") ? "Switch to User Portal" : "Switch to Admin Portal"}
                  >
                    <Shield size={12} />
                    <span>{pathname.startsWith("/admin") ? "User Portal" : "Admin View"}</span>
                  </Link>
                )}

                {/* Avatar Menu Trigger Button */}
                <button
                  onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  className="flex items-center gap-1.5 focus:outline-none cursor-pointer group"
                  aria-expanded={avatarMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="relative">
                    {session?.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User Avatar"}
                        className="w-8 h-8 rounded-full object-cover border border-accent-gold/45 group-hover:border-accent-gold transition-colors shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-primary-sage/35 group-hover:border-primary-sage flex items-center justify-center bg-secondary-cream text-primary-sage shrink-0 transition-colors">
                        <User size={14} />
                      </div>
                    )}
                    {session?.user?.role === "ADMIN" && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-gold border-2 border-background rounded-full flex items-center justify-center" title="Admin User">
                        <span className="w-1 h-1 bg-white rounded-full" />
                      </span>
                    )}
                  </div>
                  <ChevronDown size={12} className={`text-foreground/60 group-hover:text-foreground transition-transform duration-200 ${avatarMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Avatar Dropdown Menu */}
                <AnimatePresence>
                  {avatarMenuOpen && (
                    <>
                      {/* Invisible backdrop to close menu on click outside */}
                      <div className="fixed inset-0 z-40" onClick={() => setAvatarMenuOpen(false)} />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl shadow-xl border border-primary-sage/10 p-2 z-50 flex flex-col gap-1 text-left gold-glow"
                      >
                        {/* Header User info */}
                        <div className="px-3 py-2 border-b border-primary-sage/10 mb-1">
                          <p className="text-xs font-bold text-primary-forest truncate">
                            {session.user.name || "Seeker"}
                          </p>
                          <p className="text-[10px] text-foreground/60 truncate mt-0.5">
                            {session.user.email}
                          </p>
                          {session.user.role === "ADMIN" && (
                            <span className="inline-block mt-1 text-[8px] uppercase tracking-wider font-bold badge-gold px-2 py-0.5 rounded-full">
                              Admin Role
                            </span>
                          )}
                        </div>

                        {/* Profile Link */}
                        <Link
                          href="/profile"
                          onClick={() => setAvatarMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground/80 hover:text-primary-forest hover:bg-secondary-cream/50 transition-colors ${
                            pathname === "/profile" ? "bg-secondary-cream text-primary-forest" : ""
                          }`}
                        >
                          <User size={14} className="text-primary-sage" />
                          <span>My Profile</span>
                        </Link>

                        {/* Dashboard Link */}
                        <Link
                          href="/dashboard"
                          onClick={() => setAvatarMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground/80 hover:text-primary-forest hover:bg-secondary-cream/50 transition-colors ${
                            pathname === "/dashboard" ? "bg-secondary-cream text-primary-forest" : ""
                          }`}
                        >
                          <LayoutDashboard size={14} className="text-primary-sage" />
                          <span>My Sanctuary</span>
                        </Link>

                        {/* Settings Link */}
                        <Link
                          href="/settings"
                          onClick={() => setAvatarMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground/80 hover:text-primary-forest hover:bg-secondary-cream/50 transition-colors ${
                            pathname === "/settings" ? "bg-secondary-cream text-primary-forest" : ""
                          }`}
                        >
                          <Settings size={14} className="text-primary-sage" />
                          <span>Account Settings</span>
                        </Link>

                        {/* Admin Link if admin */}
                        {session.user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setAvatarMenuOpen(false)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-foreground/80 hover:text-primary-forest hover:bg-secondary-cream/50 transition-colors ${
                              pathname.startsWith("/admin") ? "bg-secondary-cream text-primary-forest" : ""
                            }`}
                          >
                            <Shield size={14} className="text-accent-gold" />
                            <span>Admin CMS</span>
                          </Link>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-primary-sage/10 my-1" />

                        {/* Logout Trigger */}
                        <button
                          onClick={() => {
                            setAvatarMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-500/5 transition-colors cursor-pointer"
                        >
                          <LogOut size={14} className="text-red-500/80" />
                          <span>Log Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold uppercase tracking-widest text-primary-forest hover:text-accent-gold transition-colors py-2 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/yoga-classes"
                  className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-5 py-2.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  Begin Journey
                </Link>
              </>
            )}
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
              <div className="flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="w-full text-center text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-3 rounded-full bg-primary-forest hover:bg-primary-sage transition-colors"
                >
                  Schedule Consultation
                </Link>
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2 w-full">
                    {session?.user?.role === "ADMIN" && (
                      <Link
                        href={pathname.startsWith("/admin") ? "/dashboard" : "/admin"}
                        className="w-full text-center text-xs font-bold uppercase tracking-widest text-accent-gold border border-accent-gold/45 py-3 rounded-full transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Shield size={12} />
                        {pathname.startsWith("/admin") ? "User Portal" : "Admin Panel"}
                      </Link>
                    )}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-center text-xs font-bold uppercase tracking-widest text-primary-forest border border-primary-forest/35 hover:bg-primary-forest hover:text-[#FCFCFA] py-3 rounded-full transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut size={12} />
                      Log Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="w-full text-center text-xs font-bold uppercase tracking-widest text-accent-gold border border-accent-gold/45 py-3 rounded-full transition-colors"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
