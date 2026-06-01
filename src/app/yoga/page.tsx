/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BarChart, X, Sparkles, AlertCircle, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FadeUp from "@/components/animations/FadeUp";
import { yogaPrograms, instructors, YogaProgram } from "@/data/mockData";

export default function YogaPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeDay, setActiveDay] = useState<string>("Mon");
  const [bookingClass, setBookingClass] = useState<YogaProgram | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const categories = ["All", "Vinyasa", "Hatha", "Yin", "Kundalini", "Pranayama"];
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Weekly schedule mock database
  const weeklySchedule: Record<string, Array<{ time: string; name: string; instructor: string; level: string }>> = {
    Mon: [
      { time: "07:00 AM - 08:00 AM", name: "Hatha Foundations & Alignment", instructor: "Kabir Dev", level: "Beginner" },
      { time: "09:30 AM - 10:45 AM", name: "Vinyasa Flow Harmony", instructor: "Ananya Sen", level: "Intermediate" },
      { time: "06:00 PM - 07:15 PM", name: "Kundalini Energetic Awakening", instructor: "Swami Kripal", level: "Advanced" },
    ],
    Tue: [
      { time: "08:00 AM - 09:00 AM", name: "Pranayama & Himalayan Meditation", instructor: "Swami Kripal", level: "All Levels" },
      { time: "11:00 AM - 12:15 PM", name: "Yin Yoga Restorative Sanctuary", instructor: "Elena Rostova", level: "Beginner" },
      { time: "05:30 PM - 06:45 PM", name: "Vinyasa Flow Harmony", instructor: "Ananya Sen", level: "Intermediate" },
    ],
    Wed: [
      { time: "07:00 AM - 08:00 AM", name: "Hatha Foundations & Alignment", instructor: "Kabir Dev", level: "Beginner" },
      { time: "09:30 AM - 10:45 AM", name: "Vinyasa Flow Harmony", instructor: "Ananya Sen", level: "Intermediate" },
      { time: "06:00 PM - 07:15 PM", name: "Kundalini Energetic Awakening", instructor: "Swami Kripal", level: "Advanced" },
    ],
    Thu: [
      { time: "08:00 AM - 09:00 AM", name: "Pranayama & Himalayan Meditation", instructor: "Swami Kripal", level: "All Levels" },
      { time: "11:00 AM - 12:15 PM", name: "Yin Yoga Restorative Sanctuary", instructor: "Elena Rostova", level: "Beginner" },
      { time: "05:30 PM - 06:45 PM", name: "Vinyasa Flow Harmony", instructor: "Ananya Sen", level: "Intermediate" },
    ],
    Fri: [
      { time: "07:00 AM - 08:00 AM", name: "Hatha Foundations & Alignment", instructor: "Kabir Dev", level: "Beginner" },
      { time: "09:30 AM - 10:45 AM", name: "Yin Yoga Restorative Sanctuary", instructor: "Elena Rostova", level: "Beginner" },
      { time: "06:00 PM - 07:15 PM", name: "Kundalini Energetic Awakening", instructor: "Swami Kripal", level: "Advanced" },
    ],
    Sat: [
      { time: "08:30 AM - 10:00 AM", name: "Kundalini Energetic Awakening", instructor: "Swami Kripal", level: "Advanced" },
      { time: "10:30 AM - 11:30 AM", name: "Pranayama & Himalayan Meditation", instructor: "Swami Kripal", level: "All Levels" },
    ],
    Sun: [
      { time: "09:00 AM - 10:15 AM", name: "Yin Yoga Restorative Sanctuary", instructor: "Elena Rostova", level: "Beginner" },
      { time: "04:00 PM - 05:15 PM", name: "Hatha Foundations & Alignment", instructor: "Kabir Dev", level: "Beginner" },
    ],
  };

  const filteredPrograms = selectedCategory === "All"
    ? yogaPrograms
    : yogaPrograms.filter(prog => prog.category === selectedCategory);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName && userEmail) {
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingClass(null);
        setUserName("");
        setUserEmail("");
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
              backgroundImage: `url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200')`,
            }}
          />
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Yogic Science
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              Expand Your <br />
              <span className="italic font-normal text-secondary-white">Inner Life Force</span>
            </h1>
            <p className="text-sm text-secondary-cream/80 max-w-xl mx-auto leading-relaxed font-light">
              Explore classical lineages designed to align biological energy channels, lubricate joints, tone the nervous system, and dissolve mental agitation.
            </p>
          </div>
        </section>

        {/* CATEGORY SELECTOR & CARDS */}
        <section className="py-16 px-6 bg-[#FCFCFA] max-w-7xl mx-auto flex flex-col gap-12">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 border-b border-primary-sage/10 pb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full border transition-all duration-300 focus:outline-none ${
                  selectedCategory === cat
                    ? "bg-primary-forest text-secondary-cream border-primary-forest shadow-md"
                    : "bg-[#F8F4EC] text-primary-forest border-primary-sage/15 hover:border-primary-sage"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Yoga Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredPrograms.map((prog, idx) => {
                const instructor = instructors.find((i) => i.id === prog.instructorId);
                return (
                  <motion.div
                    key={prog.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="group bg-[#F8F4EC] rounded-2xl overflow-hidden border border-primary-sage/10 hover:shadow-xl hover:border-accent-gold/20 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-64 overflow-hidden bg-primary-forest/5">
                      <img
                        src={prog.image}
                        alt={prog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                      />
                      <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-bold text-secondary-cream bg-primary-forest/85 px-3 py-1 rounded-full backdrop-blur-sm">
                        {prog.category}
                      </span>
                      <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest font-bold text-primary-forest bg-accent-gold/90 px-3 py-1 rounded-full">
                        {prog.level}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col gap-4 flex-1">
                      <div className="flex items-center gap-4 text-xs text-foreground/50 border-b border-primary-sage/5 pb-3">
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-primary-sage" />
                          <span>{prog.duration} Min</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BarChart size={14} className="text-primary-sage" />
                          <span>{prog.sessions} Sessions</span>
                        </div>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-primary-forest">
                        {prog.title}
                      </h3>

                      <p className="text-xs text-foreground/75 leading-relaxed font-light line-clamp-3">
                        {prog.description}
                      </p>

                      <div className="flex flex-col gap-2 mt-2">
                        <span className="text-[10px] uppercase font-bold text-primary-sage">Core Benefits:</span>
                        <ul className="flex flex-col gap-1">
                          {prog.benefits.slice(0, 2).map((b) => (
                            <li key={b} className="text-[11px] text-foreground/80 flex items-center gap-1.5 font-light">
                              <span className="w-1 h-1 bg-accent-gold rounded-full" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>

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
                        <button
                          onClick={() => setBookingClass(prog)}
                          className="text-[10px] uppercase font-bold tracking-widest text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage transition-all duration-300 px-4 py-2.5 rounded-full shadow-sm hover:shadow"
                        >
                          Book Trial
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>

        {/* WEEKLY SCHEDULE INTERACTIVE TIMETABLE */}
        <section className="py-24 px-6 bg-[#F8F4EC]">
          <div className="max-w-4xl mx-auto flex flex-col gap-12">
            <div className="text-center flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-primary-sage font-bold">
                Daily Rhythms
              </span>
              <h2 className="font-serif text-3xl font-bold text-primary-forest">
                Weekly Sanctuary Timetable
              </h2>
              <p className="text-sm text-foreground/75 font-light max-w-lg mx-auto">
                Align your week. Review our chronologically arranged physical and pranayama classes. Tap days to view schedules.
              </p>
            </div>

            {/* Weekday Switcher */}
            <div className="flex justify-between items-center bg-[#FCFCFA] p-1.5 rounded-full border border-primary-sage/15 shadow-sm max-w-xl mx-auto w-full">
              {weekdays.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`text-xs font-bold uppercase tracking-wide w-12 sm:w-16 py-2.5 rounded-full transition-all focus:outline-none ${
                    activeDay === day
                      ? "bg-primary-sage text-[#FCFCFA] shadow-sm font-bold"
                      : "text-foreground/70 hover:text-primary-forest"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Daily Timetable chronological blocks */}
            <div className="flex flex-col gap-4 mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDay}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-4"
                >
                  {weeklySchedule[activeDay].map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-6 bg-[#FCFCFA] rounded-xl border border-primary-sage/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent-gold/30 transition-all hover:translate-x-1"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-accent-gold bg-[#F8F4EC] border border-accent-gold/20 px-3 py-1.5 rounded-md shrink-0">
                          {slot.time.split(" ")[0]} {slot.time.split(" ")[1]}
                        </span>
                        <div>
                          <h4 className="font-serif text-lg font-bold text-primary-forest">
                            {slot.name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-foreground/50 mt-1">
                            <span>Instructor: {slot.instructor}</span>
                            <span className="w-1 h-1 bg-accent-gold rounded-full" />
                            <span>Level: {slot.level}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const targetProg = yogaPrograms.find((p) => p.title === slot.name) || yogaPrograms[0];
                          setBookingClass(targetProg);
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-primary-forest border border-primary-forest/30 hover:bg-primary-forest hover:text-[#FCFCFA] px-4 py-2.5 rounded-full transition-colors w-fit shrink-0 focus:outline-none"
                      >
                        Reserve Spot
                      </button>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* INSTRUCTORS SECTION */}
        <section className="py-24 px-6 bg-[#FCFCFA] max-w-7xl mx-auto flex flex-col gap-12">
          <div className="text-center flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold">
              Teacher Spotlights
            </span>
            <h2 className="font-serif text-3xl font-bold text-primary-forest">
              Masters of the Sacred Practice
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {instructors.slice(0, 2).map((ins, idx) => (
              <FadeUp key={ins.id} delay={idx * 0.1} className="p-8 bg-[#F8F4EC] rounded-2xl border border-primary-sage/10 flex flex-col sm:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-28 h-28 rounded-full overflow-hidden shrink-0 border border-accent-gold/45 relative shadow bg-primary-forest/5">
                  <img
                    src={ins.image}
                    alt={ins.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-primary-forest">
                      {ins.name}
                    </h3>
                    <span className="text-xs uppercase font-medium tracking-wide text-accent-gold">
                      {ins.specialty}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/75 leading-relaxed font-light">
                    {ins.bio}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {ins.certifications.map((c) => (
                      <span key={c} className="text-[9px] text-foreground/60 bg-[#FCFCFA] border border-primary-sage/10 px-2 py-0.5 rounded-sm">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>
      </main>

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {bookingClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingClass(null)}
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
                onClick={() => setBookingClass(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F8F4EC] hover:bg-primary-sage/10 text-primary-forest transition-colors focus:outline-none"
                aria-label="Close booking form"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col gap-1.5 border-b border-primary-sage/10 pb-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold flex items-center gap-1">
                  <Sparkles size={12} /> Live Session Reservation
                </span>
                <h3 className="font-serif text-2xl font-bold text-primary-forest leading-tight">
                  {bookingClass.title}
                </h3>
                <span className="text-xs text-foreground/50">
                  Style: {bookingClass.category} &bull; Instructor: {instructors.find((i) => i.id === bookingClass.instructorId)?.name}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {!bookingSuccess ? (
                  <motion.form
                    key="booking-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleBookingSubmit}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex flex-col gap-1">
                      <label htmlFor="modal-name" className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Full Name
                      </label>
                      <input
                        id="modal-name"
                        required
                        type="text"
                        placeholder="Ex: Anjali Sharma"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="bg-[#F8F4EC] border border-primary-sage/10 text-foreground text-sm rounded-lg p-3 w-full focus:outline-none focus:border-accent-gold"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="modal-email" className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                        Email Address
                      </label>
                      <input
                        id="modal-email"
                        required
                        type="email"
                        placeholder="Ex: anjali@gmail.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="bg-[#F8F4EC] border border-primary-sage/10 text-foreground text-sm rounded-lg p-3 w-full focus:outline-none focus:border-accent-gold"
                      />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-accent-gold/5 rounded-lg border border-accent-gold/15 text-xs text-foreground/85 leading-relaxed font-light mt-1">
                      <AlertCircle size={14} className="text-accent-gold shrink-0" />
                      <span>This is a prototype class registration. A confirmation invite is simulated immediately.</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-4 rounded-full bg-primary-forest hover:bg-primary-sage transition-all shadow-md hover:shadow-lg focus:outline-none mt-2"
                    >
                      Confirm Booking
                    </button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="booking-success"
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
                        Reservation Complete!
                      </h4>
                      <p className="text-xs text-foreground/70 leading-relaxed font-light mt-2 max-w-xs">
                        Thank you, {userName}. A calendar invite and prep booklet have been sent to <strong>{userEmail}</strong>.
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
