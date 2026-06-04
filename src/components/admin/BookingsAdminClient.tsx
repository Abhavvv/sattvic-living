"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  ClipboardCheck,
  Calendar,
  Clock,
  AlertTriangle,
  Edit2,
  CheckCircle,
  XCircle,
  FileText,
  RotateCcw
} from "lucide-react";
import { BookingStatus, AttendanceStatus } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

interface SimpleUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

interface SimpleInstructor {
  id: string;
  name: string;
  slug: string;
  profileImage: string | null;
  specialization: string;
}

interface SimpleYogaClass {
  id: string;
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  duration: number;
  price: number;
  featuredImage: string | null;
  isOnline: boolean;
  instructor: SimpleInstructor;
}

interface SimpleYogaSession {
  id: string;
  startTime: string;
  endTime: string;
  location: string;
  meetingLink: string | null;
  capacity: number;
  availableSeats: number;
  status: string;
  class: SimpleYogaClass;
}

interface Booking {
  id: string;
  userId: string;
  yogaSessionId: string;
  bookingStatus: BookingStatus;
  attendanceStatus: AttendanceStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: SimpleUser;
  yogaSession: SimpleYogaSession;
}

interface SimpleClassSelection {
  id: string;
  title: string;
}

interface SimpleInstructorSelection {
  id: string;
  name: string;
}

interface BookingsAdminClientProps {
  initialBookings: Booking[];
  initialTotal: number;
  classes: SimpleClassSelection[];
  instructors: SimpleInstructorSelection[];
}

export default function BookingsAdminClient({
  initialBookings,
  initialTotal,
  classes,
  instructors,
}: BookingsAdminClientProps) {
  const router = useRouter();

  // Search & Filtering State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination State
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 8));
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [modalBookingStatus, setModalBookingStatus] = useState<BookingStatus>("CONFIRMED");
  const [modalAttendanceStatus, setModalAttendanceStatus] = useState<AttendanceStatus>("NOT_MARKED");
  const [modalNotes, setModalNotes] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  // Action feedback message state
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Debounce search string input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch bookings whenever filters or page changes
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "8");

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterClass) params.append("classId", filterClass);
      if (filterInstructor) params.append("instructorId", filterInstructor);
      if (filterStatus) params.append("status", filterStatus);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");

      const data = await res.json();
      setBookings(data.bookings);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
      setFeedbackMessage({ text: "Error loading bookings list from server.", isError: true });
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterClass, filterInstructor, filterStatus, startDate, endDate]);

  // Trigger loading list
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    fetchBookings();
  }, [fetchBookings]);

  // Reset Filters helper
  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setFilterClass("");
    setFilterInstructor("");
    setFilterStatus("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Open Edit Dialog
  const openEditModal = (booking: Booking) => {
    setEditingBooking(booking);
    setModalBookingStatus(booking.bookingStatus);
    setModalAttendanceStatus(booking.attendanceStatus);
    setModalNotes(booking.notes || "");
    setModalError(null);
  };

  // Close Edit Dialog
  const closeEditModal = () => {
    setEditingBooking(null);
    setModalError(null);
  };

  // Save Booking changes from Modal
  const handleSaveModalChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    setModalSaving(true);
    setModalError(null);

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: editingBooking.id,
          bookingStatus: modalBookingStatus,
          attendanceStatus: modalAttendanceStatus,
          notes: modalNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not update booking record.");
      }

      // Update local state record
      setBookings((prev) =>
        prev.map((b) =>
          b.id === editingBooking.id
            ? {
                ...b,
                bookingStatus: modalBookingStatus,
                attendanceStatus: modalAttendanceStatus,
                notes: modalNotes || null,
              }
            : b
        )
      );

      closeEditModal();
      setFeedbackMessage({ text: "Booking updated successfully.", isError: false });
      
      // Refresh router and re-fetch to ensure seat sync
      router.refresh();
      fetchBookings();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setModalError(errMsg);
    } finally {
      setModalSaving(false);
    }
  };

  // Quick Action: Mark Attendance
  const handleQuickAttendance = async (bookingId: string, status: AttendanceStatus) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          attendanceStatus: status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update attendance.");

      // Update local state list
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, attendanceStatus: status } : b))
      );

      setFeedbackMessage({
        text: `Attendance updated to ${status.replace("_", " ")}.`,
        isError: false,
      });
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to update attendance.";
      setFeedbackMessage({ text: errMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  // Quick Action: Confirm Booking
  const handleQuickConfirm = async (bookingId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          bookingStatus: "CONFIRMED" as BookingStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to confirm booking.");

      // Update local list
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: "CONFIRMED" as BookingStatus } : b))
      );

      setFeedbackMessage({ text: "Booking status updated to CONFIRMED.", isError: false });
      router.refresh();
      fetchBookings();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to confirm booking.";
      setFeedbackMessage({ text: errMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  // Quick Action: Cancel Booking
  const handleQuickCancel = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking reservation? This will restore 1 available seat slot.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          bookingStatus: "CANCELLED" as BookingStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel booking.");

      // Update local list
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, bookingStatus: "CANCELLED" as BookingStatus } : b))
      );

      setFeedbackMessage({ text: "Booking status updated to CANCELLED.", isError: false });
      router.refresh();
      fetchBookings();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Failed to cancel booking.";
      setFeedbackMessage({ text: errMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  // Helper formatting values
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

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-500/25";
      case "PENDING":
        return "bg-amber-500/10 text-amber-700 border-amber-500/25";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-700 border-blue-500/25";
      case "NO_SHOW":
        return "bg-stone-500/10 text-stone-700 border-stone-500/25";
      case "CANCELLED":
        return "bg-red-500/10 text-red-700 border-red-500/25";
      default:
        return "bg-zinc-500/10 text-zinc-700 border-zinc-500/25";
    }
  };

  const getAttendanceBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-500/10 text-green-700 border-green-500/25";
      case "ABSENT":
        return "bg-rose-500/10 text-rose-700 border-rose-500/25";
      case "NOT_MARKED":
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  // Close feedback message timer
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  return (
    <div className="space-y-6">
      {/* Feedback Messages */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-sm ${
              feedbackMessage.isError
                ? "bg-red-500/10 border-red-500/20 text-red-700"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{feedbackMessage.text}</span>
            </div>
            <button onClick={() => setFeedbackMessage(null)} className="p-0.5 hover:bg-black/5 rounded">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Filters block */}
      <div className="bg-[#FCFCFA] p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          
          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/45">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search seeker name, email, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#F8F4EC] border border-primary-sage/10 rounded-full py-2.5 pl-10 pr-4 text-xs w-full text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-accent-gold transition-colors"
            />
          </div>

          {/* Class Select */}
          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F8F4EC] border border-primary-sage/10 rounded-full py-2.5 px-4 text-xs w-full text-foreground/80 focus:outline-none focus:border-accent-gold cursor-pointer"
          >
            <option value="">All Yoga Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.title}
              </option>
            ))}
          </select>

          {/* Instructor Select */}
          <select
            value={filterInstructor}
            onChange={(e) => {
              setFilterInstructor(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F8F4EC] border border-primary-sage/10 rounded-full py-2.5 px-4 text-xs w-full text-foreground/80 focus:outline-none focus:border-accent-gold cursor-pointer"
          >
            <option value="">All Instructors</option>
            {instructors.map((ins) => (
              <option key={ins.id} value={ins.id}>
                {ins.name}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F8F4EC] border border-primary-sage/10 rounded-full py-2.5 px-4 text-xs w-full text-foreground/80 focus:outline-none focus:border-accent-gold cursor-pointer"
          >
            <option value="">All Booking Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
            <option value="NO_SHOW">No Show</option>
          </select>

          {/* Date range filters */}
          <div className="flex flex-col gap-1 w-full sm:col-span-2">
            <span className="text-[9px] uppercase tracking-widest text-foreground/45 font-bold">Session Date Range</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#F8F4EC] border border-primary-sage/10 rounded-full py-2 px-3.5 text-xs text-foreground focus:outline-none focus:border-accent-gold cursor-pointer"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#F8F4EC] border border-primary-sage/10 rounded-full py-2 px-3.5 text-xs text-foreground focus:outline-none focus:border-accent-gold cursor-pointer"
              />
            </div>
          </div>

          {/* Control actions */}
          <div className="flex items-end justify-start gap-2 h-full">
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-bold uppercase tracking-widest text-[#2D3E35] bg-secondary-cream hover:bg-primary-sage/10 border border-primary-sage/15 px-4 py-2.5 rounded-full transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto"
              title="Clear Filter Configurations"
            >
              <RotateCcw size={12} />
              Reset Filters
            </button>
          </div>

        </div>
      </div>

      {/* Main Table Layout */}
      <div className="glass-panel rounded-2xl border border-primary-sage/10 shadow-sm overflow-hidden bg-[#FCFCFA] relative">
        {loading && (
          <div className="absolute inset-0 bg-[#F8F4EC]/65 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FCFCFA] border border-primary-sage/10 rounded-xl shadow-md">
              <Loader2 size={16} className="animate-spin text-accent-gold" />
              <span className="text-xs font-semibold text-primary-forest">Synchronizing Booking Data...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-cream border-b border-primary-sage/10 text-[10px] uppercase font-bold tracking-widest text-foreground/60">
                <th className="py-4 px-6">Seeker</th>
                <th className="py-4 px-6">Yoga Course / Session</th>
                <th className="py-4 px-6">Format & Venue</th>
                <th className="py-4 px-6">Booking Status</th>
                <th className="py-4 px-6">Attendance</th>
                <th className="py-4 px-6">Admin Logs</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-sage/5 text-xs text-foreground/80">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-foreground/45 italic font-light">
                    No bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-secondary-cream/25 transition-colors">
                    {/* User profile details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-cream overflow-hidden border border-primary-sage/15 flex items-center justify-center shrink-0 shadow-sm">
                          {booking.user.image ? (
                            <img
                              src={booking.user.image}
                              alt={booking.user.name || "User Avatar"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={16} className="text-primary-sage" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-primary-forest truncate max-w-[150px]">
                            {booking.user.name || "Seeker"}
                          </span>
                          <span className="text-[10px] text-foreground/50 truncate max-w-[170px]" title={booking.user.email || ""}>
                            {booking.user.email || "No Email"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Class Session */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-primary-forest leading-tight truncate max-w-[200px]" title={booking.yogaSession.class.title}>
                          {booking.yogaSession.class.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-foreground/50 mt-1">
                          <Calendar size={11} className="text-primary-sage shrink-0" />
                          <span>{formatDate(booking.yogaSession.startTime)}</span>
                          <span className="text-foreground/20">&bull;</span>
                          <Clock size={11} className="text-primary-sage shrink-0" />
                          <span>{formatTime(booking.yogaSession.startTime)}</span>
                        </div>
                        <span className="text-[9px] text-accent-gold font-medium mt-0.5">
                          Guide: {booking.yogaSession.class.instructor.name}
                        </span>
                      </div>
                    </td>

                    {/* Format / Venue */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <span
                          className={`w-fit px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold ${
                            booking.yogaSession.class.isOnline
                              ? "bg-blue-500/10 text-blue-700 border border-blue-500/20"
                              : "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                          }`}
                        >
                          {booking.yogaSession.class.isOnline ? "Online" : "In-Studio"}
                        </span>
                        <span className="text-[10px] text-foreground/60 leading-none truncate max-w-[150px]" title={booking.yogaSession.location}>
                          {booking.yogaSession.class.isOnline ? "Digital Meeting" : booking.yogaSession.location}
                        </span>
                      </div>
                    </td>

                    {/* Booking Status */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getStatusBadge(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </td>

                    {/* Attendance Status */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${getAttendanceBadge(booking.attendanceStatus)}`}>
                        {booking.attendanceStatus.replace("_", " ")}
                      </span>
                    </td>

                    {/* Notes */}
                    <td className="py-4 px-6">
                      {booking.notes ? (
                        <div className="flex items-center gap-1 text-[10px] text-foreground/60 font-light truncate max-w-[140px]" title={booking.notes}>
                          <FileText size={12} className="text-primary-sage shrink-0" />
                          <span>{booking.notes}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-foreground/30 italic">No notes</span>
                      )}
                    </td>

                    {/* Action Controls */}
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      {/* Confirm quick control */}
                      {booking.bookingStatus === "PENDING" && (
                        <button
                          onClick={() => handleQuickConfirm(booking.id)}
                          className="p-1 rounded-full text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer inline-flex items-center justify-center border border-emerald-500/10"
                          title="Quick Confirm Booking"
                        >
                          <CheckCircle size={13} />
                        </button>
                      )}

                      {/* Cancel quick control */}
                      {booking.bookingStatus !== "CANCELLED" && booking.bookingStatus !== "COMPLETED" && (
                        <button
                          onClick={() => handleQuickCancel(booking.id)}
                          className="p-1 rounded-full text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer inline-flex items-center justify-center border border-red-500/10"
                          title="Quick Cancel Booking"
                        >
                          <XCircle size={13} />
                        </button>
                      )}

                      {/* Attendance togglers (Only logical if confirmed or completed) */}
                      {booking.bookingStatus !== "CANCELLED" && (
                        <>
                          <button
                            onClick={() => handleQuickAttendance(booking.id, "PRESENT")}
                            className={`p-1 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center border ${
                              booking.attendanceStatus === "PRESENT"
                                ? "bg-green-500/15 text-green-700 border-green-500/30"
                                : "text-foreground/45 hover:text-green-600 hover:bg-green-500/10 border-foreground/10"
                            }`}
                            title="Mark Attendance: PRESENT"
                          >
                            <ClipboardCheck size={13} />
                          </button>
                          <button
                            onClick={() => handleQuickAttendance(booking.id, "ABSENT")}
                            className={`p-1 rounded-full transition-colors cursor-pointer inline-flex items-center justify-center border ${
                              booking.attendanceStatus === "ABSENT"
                                ? "bg-rose-500/15 text-rose-700 border-rose-500/30"
                                : "text-foreground/45 hover:text-rose-600 hover:bg-rose-500/10 border-foreground/10"
                            }`}
                            title="Mark Attendance: ABSENT"
                          >
                            <X size={13} />
                          </button>
                        </>
                      )}

                      {/* Open Full Edit Modal */}
                      <button
                        onClick={() => openEditModal(booking)}
                        className="p-1 rounded-full text-foreground/50 hover:text-accent-gold hover:bg-accent-gold/10 border border-foreground/10 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Manage Notes & Complete Record"
                      >
                        <Edit2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Row */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-primary-sage/10 px-6 py-4 bg-secondary-cream/35">
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
              Showing Page {currentPage} of {totalPages} ({total} bookings total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-full border border-primary-sage/20 bg-[#FCFCFA] text-primary-forest hover:bg-primary-sage/10 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-full border border-primary-sage/20 bg-[#FCFCFA] text-primary-forest hover:bg-primary-sage/10 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FULL STATE EDITING MODAL */}
      <AnimatePresence>
        {editingBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeEditModal}
              className="absolute inset-0 bg-[#2D3E35]/40 backdrop-blur-sm"
            />

            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="relative w-full max-w-xl bg-[#FCFCFA] rounded-3xl p-8 border border-primary-sage/15 z-10 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={closeEditModal}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-[#F8F4EC] hover:bg-primary-sage/10 text-primary-forest transition-colors focus:outline-none"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3 border-b border-primary-sage/10 pb-4">
                <div className="w-10 h-10 bg-accent-gold/10 border border-accent-gold/35 rounded-lg flex items-center justify-center text-accent-gold">
                  <ClipboardCheck size={20} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-primary-forest leading-snug">
                    Manage Seeker Booking
                  </h3>
                  <span className="text-[9px] uppercase tracking-widest text-foreground/45 font-bold">
                    Ref ID: {editingBooking.id}
                  </span>
                </div>
              </div>

              {modalError && (
                <div className="p-3 bg-red-500/10 border border-red-500/15 text-red-500 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveModalChanges} className="space-y-4">
                {/* Information Segment */}
                <div className="p-4 bg-[#F8F4EC] rounded-2xl border border-primary-sage/10 text-xs space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest font-bold text-foreground/50">Seeker Profile</span>
                      <strong className="block text-primary-forest mt-0.5">{editingBooking.user.name || "Seeker"}</strong>
                      <span className="block text-[10px] text-foreground/60">{editingBooking.user.email || "No Email"}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest font-bold text-foreground/50">Yoga Course</span>
                      <strong className="block text-primary-forest mt-0.5 truncate" title={editingBooking.yogaSession.class.title}>
                        {editingBooking.yogaSession.class.title}
                      </strong>
                      <span className="block text-[10px] text-foreground/60">Taught by {editingBooking.yogaSession.class.instructor.name}</span>
                    </div>
                  </div>
                  <div className="border-t border-primary-sage/5 pt-3 grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest font-bold text-foreground/50">Session Time</span>
                      <span className="block text-foreground/75 mt-0.5">
                        {formatDate(editingBooking.yogaSession.startTime)} at {formatTime(editingBooking.yogaSession.startTime)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest font-bold text-foreground/50">Format & Capacity</span>
                      <span className="block text-foreground/75 mt-0.5">
                        {editingBooking.yogaSession.class.isOnline ? "Online Live Stream" : `Studio: ${editingBooking.yogaSession.location}`}
                      </span>
                      <span className="block text-[9px] text-accent-gold font-medium">
                        Spots left: {editingBooking.yogaSession.availableSeats} / {editingBooking.yogaSession.capacity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* State Editor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Booking Status Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-foreground/50 font-bold">Booking Status</label>
                    <select
                      value={modalBookingStatus}
                      onChange={(e) => setModalBookingStatus(e.target.value as BookingStatus)}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 bg-secondary-cream/25 rounded-xl text-foreground focus:outline-none focus:border-accent-gold cursor-pointer"
                    >
                      <option value="PENDING">Pending (Awaiting Spot confirmation)</option>
                      <option value="CONFIRMED">Confirmed (Reserved Seeker Seat)</option>
                      <option value="CANCELLED">Cancelled (Released Seeker Seat)</option>
                      <option value="COMPLETED">Completed (Session Done)</option>
                      <option value="NO_SHOW">No Show (Absent without warning)</option>
                    </select>
                  </div>

                  {/* Attendance Status Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-foreground/50 font-bold">Attendance Log</label>
                    <select
                      value={modalAttendanceStatus}
                      onChange={(e) => setModalAttendanceStatus(e.target.value as AttendanceStatus)}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 bg-secondary-cream/25 rounded-xl text-foreground focus:outline-none focus:border-accent-gold cursor-pointer"
                    >
                      <option value="NOT_MARKED">Not Marked</option>
                      <option value="PRESENT">Present (Attended Class)</option>
                      <option value="ABSENT">Absent (Missed Class)</option>
                    </select>
                  </div>

                </div>

                {/* Internal Notes area */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase tracking-widest text-foreground/50 font-bold">Internal Admin Notes / Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Log details on student conditions, payment confirmations, or cancellation reasons here..."
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    className="w-full px-4 py-3 text-xs border border-primary-sage/20 bg-secondary-cream/25 rounded-xl text-foreground placeholder:text-foreground/35 focus:outline-none focus:border-accent-gold resize-none"
                  />
                </div>

                {/* Confirm actions */}
                <div className="flex gap-3 border-t border-primary-sage/10 pt-4 mt-6">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 text-xs font-bold uppercase tracking-widest text-primary-forest border border-primary-forest/20 hover:bg-[#F8F4EC] py-3 rounded-full transition-all focus:outline-none"
                  >
                    Close Dialog
                  </button>
                  <button
                    type="submit"
                    disabled={modalSaving}
                    className="flex-1 text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest hover:bg-primary-sage py-3 rounded-full transition-all shadow flex items-center justify-center gap-1.5 disabled:opacity-60 focus:outline-none"
                  >
                    {modalSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving Logs...
                      </>
                    ) : (
                      "Apply Changes"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
