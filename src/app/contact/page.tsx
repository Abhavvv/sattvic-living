/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Compass, Sparkles, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setName("");
        setEmail("");
        setMessage("");
      }, 4000);
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
              backgroundImage: `url('https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Reach Out
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Connect With <br />
              <span className="italic font-normal text-secondary-white">Our Sanctuary</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Have questions regarding class levels, Ayurvedic assessments, or custom meal subscriptions? We are here to guide you.
            </p>
          </div>
        </section>

        {/* TWO-COLUMN CONTACT DETAILS & FORM */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Side: Details & Map */}
            <div className="lg:col-span-5 flex flex-col gap-10 text-left">
              <div className="flex flex-col gap-3">
                <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">Sanctuary Hubs</span>
                <h2 className="font-serif text-3xl font-bold text-primary-forest">We are always close.</h2>
                <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed font-light">
                  Whether you are seeking custom advice, ordering seasonal meals, or wanting to join in-person retreats, get in touch with our global administrative offices.
                </p>
              </div>

              {/* Specific details items */}
              <div className="flex flex-col gap-6 text-sm text-foreground/80">
                <div className="flex items-start gap-4">
                  <span className="p-3 rounded-xl bg-[#F8F4EC] border border-primary-sage/10 text-primary-forest shrink-0">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <h4 className="font-serif font-bold text-primary-forest">Universal Offices</h4>
                    <p className="text-xs text-foreground/70 font-light leading-relaxed mt-1">
                      108 Lotus Sanctuary Way, Ganges Overlook, Rishikesh, India <br />
                      502 Beverly Hills Wellness Ridge, Los Angeles, CA 90210
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="p-3 rounded-xl bg-[#F8F4EC] border border-primary-sage/10 text-primary-forest shrink-0">
                    <Phone size={18} />
                  </span>
                  <div>
                    <h4 className="font-serif font-bold text-primary-forest">Call Us</h4>
                    <p className="text-xs text-foreground/70 font-light leading-relaxed mt-1">
                      +1 (800) SATTVIC (US) <br />
                      +91 (135) 244-SATT (India)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="p-3 rounded-xl bg-[#F8F4EC] border border-primary-sage/10 text-primary-forest shrink-0">
                    <Mail size={18} />
                  </span>
                  <div>
                    <h4 className="font-serif font-bold text-primary-forest">Email Us</h4>
                    <p className="text-xs text-foreground/70 font-light leading-relaxed mt-1">
                      sanctuary@sattvicliving.com <br />
                      support@sattvickitchen.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom styled artistic map placeholder */}
              <div className="rounded-2xl border border-primary-sage/15 bg-[#F8F4EC] p-6 h-60 relative overflow-hidden flex flex-col justify-between shadow-sm">
                {/* Decorative contour lines */}
                <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" />
                <div className="absolute top-1/4 left-1/3 w-32 h-32 rounded-full border border-primary-forest/20 blur-sm pointer-events-none" />
                <div className="absolute top-1/3 left-1/2 w-48 h-48 rounded-full border border-accent-gold/20 blur-sm pointer-events-none" />

                <div className="flex items-center justify-between z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent-gold bg-[#FCFCFA] px-3 py-1 rounded border border-accent-gold/20 flex items-center gap-1">
                    <Compass size={12} /> Rishikesh Headquarters
                  </span>
                  <span className="text-[9px] font-mono text-foreground/45">30.1264&deg; N, 78.3245&deg; E</span>
                </div>

                <div className="text-center z-10 flex flex-col items-center gap-2">
                  <span className="font-serif text-base font-bold text-primary-forest">Lotus Ganges Ashram</span>
                  <span className="text-[11px] text-foreground/60 leading-none">Main lineage archives and quietude temple</span>
                </div>

                <div className="flex items-center justify-between text-[9px] text-foreground/50 border-t border-primary-sage/5 pt-3 z-10">
                  <span>Interactive Map Placeholder</span>
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-accent-gold hover:text-primary-forest font-bold uppercase transition-colors">Enlarge Map &rarr;</a>
                </div>
              </div>

            </div>

            {/* Right Side: High-Fidelity Form */}
            <div className="lg:col-span-7">
              <FadeUp className="bg-[#F8F4EC] rounded-3xl p-8 sm:p-10 border border-primary-sage/10 shadow-lg relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

                <AnimatePresence mode="wait">
                  {!formSubmitted ? (
                    <motion.form
                      key="contact-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-5 text-left"
                    >
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold">Direct Inquiry</span>
                        <h3 className="font-serif text-2xl font-bold text-primary-forest">Send us a sacred note.</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
                        <div className="flex flex-col gap-1">
                          <label htmlFor="contact-name" className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                            Full Name
                          </label>
                          <input
                            id="contact-name"
                            required
                            type="text"
                            placeholder="Anjali Sharma"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-[#FCFCFA] border border-primary-sage/10 text-foreground text-sm rounded-lg p-3 w-full focus:outline-none focus:border-accent-gold"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label htmlFor="contact-email" className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                            Email Address
                          </label>
                          <input
                            id="contact-email"
                            required
                            type="email"
                            placeholder="anjali@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-[#FCFCFA] border border-primary-sage/10 text-foreground text-sm rounded-lg p-3 w-full focus:outline-none focus:border-accent-gold"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label htmlFor="contact-inquiry" className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                          Inquiry Type
                        </label>
                        <select
                          id="contact-inquiry"
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                          className="bg-[#FCFCFA] border border-primary-sage/10 text-foreground text-sm rounded-lg p-3 w-full focus:outline-none focus:border-accent-gold cursor-pointer"
                        >
                          <option>General Inquiry</option>
                          <option>Yoga Program Consultations</option>
                          <option>Ayurvedic Dosha Assessments</option>
                          <option>Sattvic Meal Subscriptions</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label htmlFor="contact-message" className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                          Message
                        </label>
                        <textarea
                          id="contact-message"
                          required
                          rows={5}
                          placeholder="How can we assist you along your spiritual and physical path of healing?"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="bg-[#FCFCFA] border border-primary-sage/10 text-foreground text-sm rounded-lg p-3 w-full focus:outline-none focus:border-accent-gold resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-4 rounded-full bg-primary-forest hover:bg-primary-sage transition-all shadow-md hover:shadow-lg focus:outline-none mt-2"
                      >
                        Send Message
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="form-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="py-16 flex flex-col items-center justify-center text-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary-sage/15 flex items-center justify-center text-primary-forest border-2 border-primary-forest/30">
                        <ShieldCheck size={36} />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1 justify-center">
                          <Sparkles size={12} /> Message Delivered
                        </span>
                        <h4 className="font-serif text-2xl font-bold text-primary-forest mt-1.5">
                          Deep Gratitude, {name}.
                        </h4>
                        <p className="text-xs text-foreground/70 leading-relaxed font-light mt-3 max-w-sm">
                          Our sanctuary administration has received your note regarding <strong>{inquiryType}</strong>. A lineage guide will reach out to you at <strong>{email}</strong> within 24 hours.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </FadeUp>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
