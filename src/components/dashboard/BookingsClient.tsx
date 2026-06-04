"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Video, AlertTriangle, Loader2, Sparkles, Search, Trash2, X, ClipboardCheck } from "lucide-react";

interface Instructor {
  id: string;
  name: string;
  slug: string;
  profileImage: string | null;
  specialization: string;
}

interface YogaClass {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  duration: number;
  price: number;
  featuredImage: string | null;
  isOnline: boolean;
  instructor: Instructor;
}

interface YogaSession {
  id: string;
  startTime: string;
  endTime: string;
  location: string;
  meetingLink: string | null;
  capacity: number;
  availableSeats: number;
  status: string;
  class: YogaClass;
}

interface Booking {
  id: string;
  userId: string;
  yogaSessionId: string;
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  attendanceStatus: "NOT_MARKED" | "PRESENT" | "ABSENT";
  notes: string | null;
  createdAt: string;
  yogaSession: YogaSession;
}

interface BookingsClientProps {
  initialBookings: Booking[];
}

type TabType = "upcoming" | "past" | "cancelled";

export default function BookingsClient({ initialBookings }: BookingsClientProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/10 border-green-500/25 text-green-700";
      case "PENDING":
        return "bg-amber-500/10 border-amber-500/25 text-amber-700";
      case "COMPLETED":
        return "bg-blue-500/10 border-blue-500/25 text-blue-700";
      case "NO_SHOW":
        return "bg-stone-500/10 border-stone-500/25 text-stone-700";
      case "CANCELLED":
        return "bg-red-500/10 border-red-500/25 text-red-700";
      default:
        return "bg-stone-500/10 border-stone-500/25 text-stone-700";
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setIsSubmitLoading(true);
    setActionError(null);

    try {
      const response = await fetch(`/api/bookings/${cancellingBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel booking.");
      }

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancellingBooking.id
            ? { ...b, bookingStatus: "CANCELLED" as const }
            : b
        )
      );

      setCancellingBooking(null);
      router.refresh();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setActionError(errMsg);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  // Filter logic
  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    const sessionTime = new Date(b.yogaSession.startTime);
    const matchesSearch =
      b.yogaSession.class.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.yogaSession.class.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());

    const isCancelled = b.bookingStatus === "CANCELLED";
    const isCompleted = b.bookingStatus === "COMPLETED";

    if (activeTab === "upcoming") {
      return (
        matchesSearch &&
        !isCancelled &&
        !isCompleted &&
        sessionTime >= now
      );
    } else if (activeTab === "past") {
      return (
        matchesSearch &&
        (isCompleted || (sessionTime < now && !isCancelled))
      );
    } else {
      return matchesSearch && isCancelled;
    }
  });

  return (
    <div className="space-y-8">
      {/* Header text */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary-sage/15 pb-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
            <Sparkles size={12} className="text-accent-gold" />
            My Registrations
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary-forest leading-tight">
            Booking Sanctuary
          </h1>
          <p className="text-sm text-foreground/75 font-light max-w-2xl leading-relaxed">
            Manage your scheduled alignment classes, view meeting links for online live streaming sessions, and track your attendance logs.
          </p>
        </div>

        <Link
          href="/yoga-classes"
          className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-6 py-3.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all shadow-sm flex items-center justify-center gap-2 w-fit shrink-0"
        >
          Book Another Session
        </Link>
      </div>

      {/* Tabs Switcher and Search bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FCFCFA] p-4 rounded-2xl border border-primary-sage/10 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#F8F4EC] p-1.5 rounded-full border border-primary-sage/5 w-fit">
          {(["upcoming", "past", "cancelled"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setActionError(null);
              }}
              className={`text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-full transition-all focus:outline-none ${
                activeTab === tab
                  ? "bg-primary-forest text-[#FCFCFA] shadow"
                  : "text-foreground/60 hover:text-primary-forest"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Fuzzy Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary-sage">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search class or guide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#F8F4EC] border border-primary-sage/10 rounded-full py-2 pl-10 pr-4 text-xs w-full text-foreground placeholder:text-foreground/45 focus:outline-none focus:border-accent-gold"
          />
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((b) => (
              <motion.div
                key={b.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="group flex flex-col bg-[#FCFCFA] rounded-2xl p-6 border border-primary-sage/10 hover:shadow-lg transition-all duration-300 relative text-left"
              >
                {/* Visual Accent Header */}
                <div className="flex items-start justify-between gap-4 border-b border-primary-sage/5 pb-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-accent-gold">
                      {b.yogaSession.class.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-primary-forest mt-0.5 leading-snug line-clamp-1">
                      {b.yogaSession.class.title}
                    </h3>
                  </div>
                  
                  <span className={`text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${getStatusColor(b.bookingStatus)}`}>
                    {b.bookingStatus}
                  </span>
                </div>

                {/* Session Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2.5 text-xs text-foreground/80 font-light">
                    <Calendar size={14} className="text-primary-sage shrink-0" />
                    <span>{formatDate(b.yogaSession.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-foreground/80 font-light">
                    <Clock size={14} className="text-primary-sage shrink-0" />
                    <span>{formatTime(b.yogaSession.startTime)} - {formatTime(b.yogaSession.endTime)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-foreground/80 font-light">
                    {b.yogaSession.class.isOnline ? (
                      <Video size={14} className="text-blue-500 shrink-0" />
                    ) : (
                      <MapPin size={14} className="text-amber-600 shrink-0" />
                    )}
                    <span className="truncate">{b.yogaSession.location}</span>
                  </div>

                  {/* Guide info */}
                  <div className="pt-3 border-t border-primary-sage/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F8F4EC] border border-accent-gold/25 overflow-hidden flex items-center justify-center shrink-0">
                      {b.yogaSession.class.instructor.profileImage ? (
                        <img
                          src={b.yogaSession.class.instructor.profileImage}
                          alt={b.yogaSession.class.instructor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-primary-forest">
                          {b.yogaSession.class.instructor.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-foreground/45 leading-none">Guide Taught By</span>
                      <span className="text-[11px] font-semibold text-primary-forest leading-none mt-0.5">
                        {b.yogaSession.class.instructor.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Actions */}
                <div className="border-t border-primary-sage/5 pt-4 mt-4 flex items-center justify-between gap-3">
                  {/* Attendance status display */}
                  <span className="text-[9px] text-foreground/50 font-medium flex items-center gap-1">
                    <ClipboardCheck size={11} className="text-primary-sage" />
                    Attendance:{" "}
                    <strong className={
                      b.attendanceStatus === "PRESENT"
                        ? "text-green-600"
                        : b.attendanceStatus === "ABSENT"
                        ? "text-red-600"
                        : "text-foreground/60"
                    }>
                      {b.attendanceStatus.replace("_", " ")}
                    </strong>
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* Cancellation Button (Only active for CONFIRMED/PENDING upcoming classes) */}
                    {activeTab === "upcoming" && (
                      <button
                        onClick={() => {
                          setCancellingBooking(b);
                          setActionError(null);
                        }}
                        className="p-2 rounded-full border border-red-500/25 hover:bg-red-500/10 text-red-500 transition-colors focus:outline-none"
                        title="Cancel Booking"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}

                    <Link
                      href={`/yoga-classes/${b.yogaSession.class.slug}`}
                      className="text-[9px] uppercase font-bold tracking-widest text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage px-3.5 py-2 rounded-full shadow-sm hover:shadow"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Meeting Link detail for online class */}
                {b.yogaSession.class.isOnline && b.yogaSession.meetingLink && b.bookingStatus === "CONFIRMED" && activeTab === "upcoming" && (
                  <div className="mt-3 p-2.5 bg-blue-500/5 border border-blue-500/15 rounded-xl text-left">
                    <span className="block text-[8px] uppercase tracking-widest font-bold text-blue-600 leading-none">
                      Online Meet Details
                    </span>
                    <a
                      href={b.yogaSession.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-700 font-medium underline block mt-1 truncate hover:text-blue-900 focus:outline-none"
                    >
                      Click here to stream class
                    </a>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-center gap-2 bg-[#FCFCFA] border border-primary-sage/10 rounded-2xl shadow-sm">
              <Calendar size={48} className="text-primary-sage/40 stroke-[1.25]" />
              <span className="font-serif text-lg font-bold text-primary-forest">No Registrations Found</span>
              <span className="text-xs text-foreground/50 max-w-xs leading-normal">
                {activeTab === "upcoming"
                  ? "You do not have any upcoming yoga class schedules booked at this time."
                  : activeTab === "past"
                  ? "Your past completed yoga course history is currently empty."
                  : "You do not have any cancelled yoga class sessions on record."}
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* CANCELLATION MODAL */}
      <AnimatePresence>
        {cancellingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSubmitLoading) setCancellingBooking(null);
              }}
              className="absolute inset-0 bg-[#2D3E35]/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#FCFCFA] rounded-3xl p-8 border border-primary-sage/15 z-10 shadow-2xl flex flex-col items-center text-center gap-6"
            >
              <button
                disabled={isSubmitLoading}
                onClick={() => setCancellingBooking(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F8F4EC] hover:bg-primary-sage/10 text-primary-forest transition-colors focus:outline-none disabled:opacity-50"
              >
                <X size={16} />
              </button>

              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border-2 border-red-500/25">
                <Trash2 size={28} />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl font-bold text-primary-forest">
                  Cancel Reservation?
                </h3>
                <p className="text-xs text-foreground/75 leading-relaxed font-light">
                  Are you sure you want to cancel your spot in <strong>{cancellingBooking.yogaSession.class.title}</strong> scheduled for <strong>{formatDate(cancellingBooking.yogaSession.startTime)}</strong>?
                </p>
                <p className="text-[10px] text-foreground/45 italic leading-relaxed">
                  Your seat will be released and made available for other seekers. This action cannot be undone.
                </p>
              </div>

              {actionError && (
                <div className="w-full p-3 bg-red-500/10 border border-red-500/15 text-red-500 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  disabled={isSubmitLoading}
                  onClick={handleCancelBooking}
                  className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-4 rounded-full bg-red-600 hover:bg-red-700 transition-all shadow flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmitLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Cancelling Spot...
                    </>
                  ) : (
                    "Confirm Cancellation"
                  )}
                </button>
                <button
                  disabled={isSubmitLoading}
                  onClick={() => setCancellingBooking(null)}
                  className="w-full text-xs font-bold uppercase tracking-widest text-primary-forest border border-primary-forest/30 hover:bg-[#F8F4EC] py-4 rounded-full transition-all disabled:opacity-50"
                >
                  Keep Reservation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
