"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Video,
} from "lucide-react";
import { z } from "zod";
import { YogaSessionStatus } from "@prisma/client";

const sessionSchema = z.object({
  classId: z.string().min(1, "Class selection is required"),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  location: z.string().min(1, "Location description is required"),
  meetingLink: z.string().nullable().optional(),
  capacity: z.number().int().positive("Capacity must be positive"),
  status: z.nativeEnum(YogaSessionStatus).default(YogaSessionStatus.SCHEDULED),
});

interface YogaClass {
  id: string;
  title: string;
  capacity: number;
  isOnline: boolean;
}

interface YogaSessionType {
  id: string;
  classId: string;
  class: YogaClass;
  startTime: Date | string;
  endTime: Date | string;
  location: string;
  meetingLink: string | null;
  capacity: number;
  availableSeats: number;
  status: YogaSessionStatus;
  createdAt: Date | string;
}

interface SessionsClientProps {
  sessions: YogaSessionType[];
  classes: YogaClass[];
}

const ITEMS_PER_PAGE = 8;

export default function SessionsClient({ sessions, classes }: SessionsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters & Page state
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<YogaSessionType | null>(null);

  // Form state
  const [classId, setClassId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [capacity, setCapacity] = useState<number>(20);
  const [status, setStatus] = useState<YogaSessionStatus>(YogaSessionStatus.SCHEDULED);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Helper: auto-fill capacity & defaults when class changes
  useEffect(() => {
    if (classId && !editingSession) {
      const selected = classes.find((c) => c.id === classId);
      if (selected) {
        setCapacity(selected.capacity);
        if (selected.isOnline) {
          setLocation("Zoom Meeting Room");
        } else {
          setLocation("Main Shala");
        }
      }
    }
  }, [classId, classes, editingSession]);

  // ISO string local conversion helpers for datetime-local value input
  const toLocalDatetimeString = (dateObj: Date | string) => {
    const d = new Date(dateObj);
    const tzOffset = d.getTimezoneOffset() * 60000; // in milliseconds
    const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const openCreatePanel = () => {
    setEditingSession(null);
    setClassId(classes[0]?.id || "");
    const now = new Date();
    // Default start time: tomorrow at 9:00 AM
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(10, 0, 0, 0);

    setStartTime(toLocalDatetimeString(tomorrow));
    setEndTime(toLocalDatetimeString(tomorrowEnd));
    setLocation("");
    setMeetingLink("");
    setCapacity(classes[0]?.capacity || 20);
    setStatus(YogaSessionStatus.SCHEDULED);
    setFormError(null);
    setPanelOpen(true);
  };

  const openEditPanel = (item: YogaSessionType) => {
    setEditingSession(item);
    setClassId(item.classId);
    setStartTime(toLocalDatetimeString(item.startTime));
    setEndTime(toLocalDatetimeString(item.endTime));
    setLocation(item.location);
    setMeetingLink(item.meetingLink || "");
    setCapacity(item.capacity);
    setStatus(item.status);
    setFormError(null);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingSession(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setFormError("End Time must be chronologically after Start Time.");
      setIsSaving(false);
      return;
    }

    const payload = {
      classId,
      startTime: start,
      endTime: end,
      location,
      meetingLink: meetingLink || null,
      capacity: Number(capacity),
      status,
    };

    const validation = sessionSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      setIsSaving(false);
      return;
    }

    try {
      const url = "/api/yoga/sessions";
      const method = editingSession ? "PUT" : "POST";
      const bodyData = editingSession
        ? { ...payload, id: editingSession.id }
        : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save scheduled session.");
      }

      closePanel();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save scheduled session.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this scheduled session? This cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/yoga/sessions?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete session.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete session.";
      alert(msg);
    }
  };

  // Filter Logic
  const filteredSessions = sessions.filter((item) => {
    const matchesSearch =
      item.class?.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());

    const matchesClass = filterClass === "" || item.classId === filterClass;
    const matchesStatus = filterStatus === "" || item.status === filterStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const formatSessionTime = (isoString: string | Date) => {
    const dateObj = new Date(isoString);
    return dateObj.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const formatSessionDate = (isoString: string | Date) => {
    const dateObj = new Date(isoString);
    return dateObj.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  };

  const selectedClassDetails = classes.find((c) => c.id === classId);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/45" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-primary-sage/20 rounded-full bg-[#FCFCFA] focus:outline-none transition-organic"
            />
          </div>

          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs border border-primary-sage/20 rounded-full bg-[#FCFCFA] focus:outline-none text-foreground/80 cursor-pointer"
          >
            <option value="">All Yoga Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.title}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs border border-primary-sage/20 rounded-full bg-[#FCFCFA] focus:outline-none text-foreground/80 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value={YogaSessionStatus.SCHEDULED}>Scheduled</option>
            <option value={YogaSessionStatus.CANCELLED}>Cancelled</option>
            <option value={YogaSessionStatus.COMPLETED}>Completed</option>
          </select>
        </div>

        <button
          onClick={openCreatePanel}
          className="w-full md:w-auto text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-5 py-2.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          disabled={classes.length === 0}
        >
          <Plus size={14} />
          Schedule Session
        </button>
      </div>

      {/* Datatable */}
      <div className="glass-panel rounded-2xl border border-primary-sage/10 shadow-sm overflow-hidden bg-[#FCFCFA]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-cream border-b border-primary-sage/10 text-[10px] uppercase font-bold tracking-widest text-foreground/60">
                <th className="py-4 px-6">Class Title</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Time Block</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Platform / Links</th>
                <th className="py-4 px-6">Seats Status</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-sage/5 text-xs text-foreground/80">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-foreground/40 italic">
                    Warning: You must create a Yoga Class before scheduling session timings.
                  </td>
                </tr>
              ) : paginatedSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-foreground/40 italic">
                    No sessions scheduled matching the filters.
                  </td>
                </tr>
              ) : (
                paginatedSessions.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary-cream/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-primary-forest">{item.class?.title}</td>
                    <td className="py-4 px-6 font-medium">{formatSessionDate(item.startTime)}</td>
                    <td className="py-4 px-6 text-foreground/70">
                      {formatSessionTime(item.startTime)} - {formatSessionTime(item.endTime)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        {item.class?.isOnline ? (
                          <Video size={12} className="text-blue-500" />
                        ) : (
                          <MapPin size={12} className="text-amber-600" />
                        )}
                        <span>{item.location}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-[10px] max-w-xs truncate">
                      {item.meetingLink ? (
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Join Stream
                        </a>
                      ) : (
                        <span className="text-foreground/40 italic">Physical Attendance</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-light">
                      <span className="font-semibold text-primary-forest">
                        {item.availableSeats}
                      </span>{" "}
                      / {item.capacity} Seats Available
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === YogaSessionStatus.SCHEDULED
                            ? "bg-emerald-500/10 text-emerald-700"
                            : item.status === YogaSessionStatus.CANCELLED
                            ? "bg-red-500/10 text-red-700"
                            : "bg-zinc-500/10 text-zinc-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditPanel(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-sage/10 text-foreground/50 hover:text-accent-gold hover:bg-accent-gold/5 focus-visible:ring-1 focus-visible:ring-accent-gold transition-all cursor-pointer"
                          title="Edit Session"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-sage/10 text-foreground/50 hover:text-red-600 hover:bg-red-50 focus-visible:ring-1 focus-visible:ring-red-500 transition-all cursor-pointer"
                          title="Delete Session"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
              Showing Page {currentPage} of {totalPages} ({filteredSessions.length} items total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="p-1.5 rounded-full border border-primary-sage/20 bg-[#FCFCFA] text-primary-forest hover:bg-primary-sage/10 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-full border border-primary-sage/20 bg-[#FCFCFA] text-primary-forest hover:bg-primary-sage/10 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Form Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#F8F4EC] h-full shadow-2xl flex flex-col p-6 border-l border-primary-sage/10 animate-slide-in overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary-sage/15 pb-4 mb-6 shrink-0">
              <h3 className="font-serif text-lg font-bold text-primary-forest flex items-center gap-2">
                <Calendar size={18} className="text-accent-gold" />
                {editingSession ? "Modify Scheduled Session" : "Schedule New Session"}
              </h3>
              <button
                onClick={closePanel}
                className="p-1 rounded-full hover:bg-primary-sage/10 text-foreground/70"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-xs rounded-lg font-semibold flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Yoga Class to Schedule
                  </label>
                  <select
                    required
                    disabled={!!editingSession}
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold text-foreground/80 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select Yoga Class...</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.title} {cls.isOnline ? "(Online)" : "(Studio)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold text-foreground/80 cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold text-foreground/80 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Session-Specific Capacity
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 20))}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                    {selectedClassDetails && (
                      <span className="text-[9px] text-foreground/50 mt-0.5">
                        Defaults to standard class capacity ({selectedClassDetails.capacity})
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as YogaSessionStatus)}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold text-foreground/80 cursor-pointer"
                    >
                      <option value={YogaSessionStatus.SCHEDULED}>Scheduled</option>
                      <option value={YogaSessionStatus.CANCELLED}>Cancelled</option>
                      <option value={YogaSessionStatus.COMPLETED}>Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Location Description
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Main Studio Shala, Hall A, or Online Platform Info"
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                  />
                </div>

                {(selectedClassDetails?.isOnline || (editingSession && editingSession.class?.isOnline)) && (
                  <div className="flex flex-col gap-1 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                      <Video size={14} />
                      <span>Online Session Streaming Link</span>
                    </div>
                    <p className="text-[10px] text-blue-900/60 leading-normal font-light">
                      This class is designated as online. Enter the Zoom/Google Meet URL below.
                    </p>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="e.g. https://zoom.us/j/987654321"
                      className="w-full px-3 py-2 text-xs border border-blue-500/25 rounded-md bg-[#FCFCFA] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-primary-sage/10 pt-4 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closePanel}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border border-primary-forest/30 text-primary-forest rounded-full hover:bg-primary-sage/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isPending || classes.length === 0}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest rounded-full hover:bg-primary-sage transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {editingSession ? "Update Timetable" : "Add to Timetable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
