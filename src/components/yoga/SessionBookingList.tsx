"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Video, CheckCircle2, AlertTriangle, Loader2, Sparkles, X } from "lucide-react";

interface YogaSession {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  location: string;
  meetingLink: string | null;
  capacity: number;
  availableSeats: number;
  status: string;
}

interface SessionBookingListProps {
  sessions: YogaSession[];
  classId: string;
  classSlug: string;
  classTitle: string;
  price: number;
  isOnline: boolean;
  currentUser: { id: string; email: string } | null;
  initialBookedSessionIds: string[];
}

export default function SessionBookingList({
  sessions,
  classSlug,
  classTitle,
  price,
  isOnline,
  currentUser,
  initialBookedSessionIds,
}: SessionBookingListProps) {
  const router = useRouter();
  const [bookedSessionIds, setBookedSessionIds] = useState<string[]>(initialBookedSessionIds);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<{ id: string; date: string; time: string } | null>(null);

  const formatDate = (dateVal: Date | string) => {
    const d = new Date(dateVal);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const formatTime = (dateVal: Date | string) => {
    const d = new Date(dateVal);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const handleBooking = async (session: YogaSession) => {
    if (!currentUser) {
      // Redirect to login with callback
      router.push(`/login?callbackUrl=/yoga-classes/${classSlug}`);
      return;
    }

    setLoadingSessionId(session.id);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yogaSessionId: session.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking.");
      }

      setBookedSessionIds((prev) => [...prev, session.id]);
      setSuccessBooking({
        id: data.booking.id,
        date: formatDate(session.startTime),
        time: `${formatTime(session.startTime)} - ${formatTime(session.endTime)}`,
      });
      
      // Force Next.js server router refresh to load updated seat counts
      router.refresh();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(errMsg);
    } finally {
      setLoadingSessionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs sm:text-sm rounded-xl flex items-start gap-2.5">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="p-8 bg-[#F8F4EC]/50 border border-primary-sage/10 rounded-xl text-center">
            <p className="text-xs italic text-foreground/50">
              No upcoming timetable sessions are currently scheduled for this class style. Check back soon.
            </p>
          </div>
        ) : (
          sessions.map((session) => {
            const isBooked = bookedSessionIds.includes(session.id);
            const isFullyBooked = session.availableSeats <= 0;
            const isLoading = loadingSessionId === session.id;

            return (
              <div
                key={session.id}
                className="p-5 bg-[#F8F4EC]/35 border border-primary-sage/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-accent-gold/20 hover:bg-[#FCFCFA] transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-14 px-3 py-2 bg-[#F8F4EC] border border-accent-gold/25 rounded-xl text-center text-accent-gold shrink-0 shadow-sm">
                    <span className="block text-[9px] uppercase font-bold tracking-wider leading-none">
                      {formatDate(session.startTime).split(",")[1]?.trim().split(" ")[0]}
                    </span>
                    <span className="block text-base font-bold leading-none mt-0.5">
                      {formatDate(session.startTime).split(",")[1]?.trim().split(" ")[1]}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block">
                      {formatDate(session.startTime).split(",")[0]}, {formatTime(session.startTime)} - {formatTime(session.endTime)}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-forest mt-1">
                      {isOnline ? (
                        <Video size={13} className="text-blue-500 shrink-0" />
                      ) : (
                        <MapPin size={13} className="text-amber-600 shrink-0" />
                      )}
                      <span>{session.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end items-start gap-2 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 leading-none">
                    {session.availableSeats} / {session.capacity} Slots Left
                  </span>
                  
                  <button
                    onClick={() => handleBooking(session)}
                    disabled={isBooked || isFullyBooked || isLoading}
                    className={`px-5 py-2 rounded-full text-[10px] uppercase font-bold tracking-widest transition-all flex items-center gap-1.5 focus:outline-none ${
                      isBooked
                        ? "bg-primary-sage/10 border border-primary-sage/20 text-primary-sage cursor-default font-bold"
                        : isFullyBooked
                        ? "bg-foreground/5 border border-foreground/10 text-foreground/35 cursor-not-allowed"
                        : "bg-primary-forest hover:bg-primary-sage text-[#FCFCFA] shadow-sm hover:shadow-md active:scale-98"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Processing...
                      </>
                    ) : isBooked ? (
                      <>
                        <CheckCircle2 size={12} className="text-primary-sage" />
                        Reserved
                      </>
                    ) : isFullyBooked ? (
                      "Fully Booked"
                    ) : currentUser ? (
                      "Reserve Spot"
                    ) : (
                      "Login to Book"
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIRMATION OVERLAY MODAL */}
      <AnimatePresence>
        {successBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSuccessBooking(null)}
              className="absolute inset-0 bg-[#2D3E35]/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#FCFCFA] rounded-3xl p-8 border border-primary-sage/15 z-10 shadow-2xl flex flex-col items-center text-center gap-6"
            >
              <button
                onClick={() => setSuccessBooking(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F8F4EC] hover:bg-primary-sage/10 text-primary-forest transition-colors focus:outline-none"
              >
                <X size={16} />
              </button>

              <div className="w-16 h-16 rounded-full bg-primary-sage/15 flex items-center justify-center text-primary-forest border-2 border-primary-forest/30 shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-accent-gold flex items-center justify-center gap-1">
                  <Sparkles size={12} className="text-accent-gold animate-pulse" />
                  Reservation Successful
                </span>
                <h3 className="font-serif text-2xl font-bold text-primary-forest">
                  Your spot is secured!
                </h3>
                <p className="text-xs text-foreground/75 leading-relaxed font-light">
                  You are registered for <strong>{classTitle}</strong>. A confirmation details package has been prepped for you.
                </p>
              </div>

              <div className="w-full bg-[#F8F4EC] p-4 rounded-2xl border border-primary-sage/5 text-left space-y-2.5 text-xs text-foreground/80 font-light">
                <div className="flex justify-between">
                  <span className="text-foreground/50 font-medium">Session Date</span>
                  <span className="font-semibold text-primary-forest">{successBooking.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50 font-medium">Session Time</span>
                  <span className="font-semibold text-primary-forest">{successBooking.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50 font-medium">Fee</span>
                  <span className="font-bold text-accent-gold">{price === 0 ? "Free" : `₹${price}`}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  onClick={() => {
                    setSuccessBooking(null);
                    router.push("/dashboard/bookings");
                  }}
                  className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-4 rounded-full bg-primary-forest hover:bg-primary-sage transition-all shadow-sm hover:shadow"
                >
                  View Bookings Dashboard
                </button>
                <button
                  onClick={() => setSuccessBooking(null)}
                  className="w-full text-xs font-bold uppercase tracking-widest text-primary-forest border border-primary-forest/30 hover:bg-[#F8F4EC] py-4 rounded-full transition-all"
                >
                  Close Window
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
