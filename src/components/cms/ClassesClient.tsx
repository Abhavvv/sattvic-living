"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Upload,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { z } from "zod";
import { YogaClassStatus } from "@prisma/client";
import RichTextEditor from "./RichTextEditor";

const classSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-_]+$/,
      "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"
    ),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  duration: z.number().int().positive("Duration must be a positive number of minutes"),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  price: z.number().nonnegative("Price cannot be negative"),
  featuredImage: z.string().nullable().optional(),
  isOnline: z.boolean().default(false),
  status: z.nativeEnum(YogaClassStatus).default(YogaClassStatus.DRAFT),
  instructorId: z.string().min(1, "Instructor is required"),
});

interface Instructor {
  id: string;
  name: string;
}

interface YogaClassType {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  capacity: number;
  price: number;
  featuredImage: string | null;
  isOnline: boolean;
  status: YogaClassStatus;
  instructorId: string;
  instructor: Instructor;
  createdAt: Date | string;
}

interface ClassesClientProps {
  classes: YogaClassType[];
  instructors: Instructor[];
}

const ITEMS_PER_PAGE = 8;
const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const SUGGESTED_CATEGORIES = ["Vinyasa Flow", "Hatha Yoga", "Yin Yoga", "Kundalini Yoga", "Pranayama & Meditation", "Restorative Yoga"];

export default function ClassesClient({ classes, instructors }: ClassesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters & Page state
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<YogaClassType | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState<number>(60);
  const [capacity, setCapacity] = useState<number>(20);
  const [price, setPrice] = useState<number>(0);
  const [featuredImage, setFeaturedImage] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [status, setStatus] = useState<YogaClassStatus>(YogaClassStatus.DRAFT);
  const [instructorId, setInstructorId] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  const slugify = (text: string) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug && !editingClass) {
      setSlug(slugify(val));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "images");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Featured image upload failed.");
      }

      setFeaturedImage(data.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload file.";
      setFormError(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const openCreatePanel = () => {
    setEditingClass(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setCategory("");
    setDifficulty("Beginner");
    setDuration(60);
    setCapacity(20);
    setPrice(0);
    setFeaturedImage("");
    setIsOnline(false);
    setStatus(YogaClassStatus.DRAFT);
    setInstructorId(instructors[0]?.id || "");
    setFormError(null);
    setAutoSlug(true);
    setPanelOpen(true);
  };

  const openEditPanel = (item: YogaClassType) => {
    setEditingClass(item);
    setTitle(item.title);
    setSlug(item.slug);
    setDescription(item.description);
    setCategory(item.category);
    setDifficulty(item.difficulty);
    setDuration(item.duration);
    setCapacity(item.capacity);
    setPrice(item.price);
    setFeaturedImage(item.featuredImage || "");
    setIsOnline(item.isOnline);
    setStatus(item.status);
    setInstructorId(item.instructorId);
    setFormError(null);
    setAutoSlug(false);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingClass(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const payload = {
      title,
      slug,
      description,
      category,
      difficulty,
      duration: Number(duration),
      capacity: Number(capacity),
      price: Number(price),
      featuredImage: featuredImage || null,
      isOnline,
      status,
      instructorId,
    };

    const validation = classSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      setIsSaving(false);
      return;
    }

    try {
      const url = "/api/yoga/classes";
      const method = editingClass ? "PUT" : "POST";
      const bodyData = editingClass
        ? { ...payload, id: editingClass.id }
        : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save yoga class.");
      }

      closePanel();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save yoga class.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this yoga class? Deleting it will automatically delete all scheduled sessions for this class!"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/yoga/classes?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete yoga class.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete yoga class.";
      alert(msg);
    }
  };

  // Filter Logic
  const filteredClasses = classes.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = filterCategory === "" || item.category === filterCategory;
    const matchesDifficulty = filterDifficulty === "" || item.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === "" || item.status === filterStatus;
    const matchesInstructor = filterInstructor === "" || item.instructorId === filterInstructor;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus && matchesInstructor;
  });

  // Unique categories for filtering
  const existingCategories = Array.from(new Set(classes.map((c) => c.category)));

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/45" />
            <input
              type="text"
              placeholder="Search classes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-primary-sage/20 rounded-full bg-[#FCFCFA] focus:outline-none transition-organic"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs border border-primary-sage/20 rounded-full bg-[#FCFCFA] focus:outline-none text-foreground/80 cursor-pointer"
          >
            <option value="">All Categories</option>
            {existingCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => {
              setFilterDifficulty(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs border border-primary-sage/20 rounded-full bg-[#FCFCFA] focus:outline-none text-foreground/80 cursor-pointer"
          >
            <option value="">All Difficulties</option>
            {DIFFICULTY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>

          <select
            value={filterInstructor}
            onChange={(e) => {
              setFilterInstructor(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs border border-primary-sage/20 rounded-full bg-[#FCFCFA] focus:outline-none text-foreground/80 cursor-pointer"
          >
            <option value="">All Instructors</option>
            {instructors.map((ins) => (
              <option key={ins.id} value={ins.id}>
                {ins.name}
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
            <option value={YogaClassStatus.DRAFT}>Draft</option>
            <option value={YogaClassStatus.PUBLISHED}>Published</option>
            <option value={YogaClassStatus.ARCHIVED}>Archived</option>
          </select>
        </div>

        <button
          onClick={openCreatePanel}
          className="w-full md:w-auto text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-5 py-2.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          Create Class
        </button>
      </div>

      {/* Main Datatable */}
      <div className="glass-panel rounded-2xl border border-primary-sage/10 shadow-sm overflow-hidden bg-[#FCFCFA]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-cream border-b border-primary-sage/10 text-[10px] uppercase font-bold tracking-widest text-foreground/60">
                <th className="py-4 px-6 w-16">Visual</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Difficulty</th>
                <th className="py-4 px-6">Duration</th>
                <th className="py-4 px-6">Instructor</th>
                <th className="py-4 px-6">Pricing</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-sage/5 text-xs text-foreground/80">
              {paginatedClasses.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-foreground/40 italic">
                    No classes found matching the filter parameters.
                  </td>
                </tr>
              ) : (
                paginatedClasses.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary-cream/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-10 h-7 rounded border border-primary-sage/15 bg-secondary-cream overflow-hidden shadow-sm flex items-center justify-center">
                        {item.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.featuredImage}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Activity size={12} className="text-primary-sage/40" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-primary-forest max-w-xs truncate" title={item.title}>
                      {item.title}
                    </td>
                    <td className="py-4 px-6">
                      <span className="badge-sage px-2 py-0.5 rounded-full text-[10px] font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">{item.difficulty}</td>
                    <td className="py-4 px-6 font-light">{item.duration} Min</td>
                    <td className="py-4 px-6 font-medium">{item.instructor?.name}</td>
                    <td className="py-4 px-6 font-mono font-semibold">
                      {item.price === 0 ? "Free" : `₹${item.price}`}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.isOnline
                            ? "bg-blue-500/10 text-blue-700"
                            : "bg-amber-500/10 text-amber-700"
                        }`}
                      >
                        {item.isOnline ? "ONLINE" : "STUDIO"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === YogaClassStatus.PUBLISHED
                            ? "bg-emerald-500/10 text-emerald-700"
                            : item.status === YogaClassStatus.DRAFT
                            ? "bg-amber-500/10 text-amber-700"
                            : "bg-zinc-500/10 text-zinc-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditPanel(item)}
                        className="p-1.5 text-foreground/50 hover:text-accent-gold transition-colors cursor-pointer"
                        title="Edit Class"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-foreground/50 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Class"
                      >
                        <Trash2 size={13} />
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
              Showing Page {currentPage} of {totalPages} ({filteredClasses.length} items total)
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
          <div className="w-full max-w-4xl bg-[#F8F4EC] h-full shadow-2xl flex flex-col p-6 border-l border-primary-sage/10 animate-slide-in overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary-sage/15 pb-4 mb-6 shrink-0">
              <h3 className="font-serif text-lg font-bold text-primary-forest flex items-center gap-2">
                <Activity size={18} className="text-accent-gold" />
                {editingClass ? "Modify Yoga Class" : "Create New Yoga Class"}
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

                {instructors.length === 0 && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-xs rounded-lg font-semibold flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    Warning: You must create at least one Instructor profile before you can configure a yoga class!
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Class Title
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="e.g. Vinyasa Flow Harmony"
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                        Slug URL
                      </label>
                      {!editingClass && (
                        <button
                          type="button"
                          onClick={() => setAutoSlug(!autoSlug)}
                          className={`text-[9px] uppercase font-bold tracking-wider ${
                            autoSlug ? "text-accent-gold" : "text-foreground/40"
                          }`}
                        >
                          {autoSlug ? "Auto" : "Manual"}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => {
                        setSlug(slugify(e.target.value));
                        setAutoSlug(false);
                      }}
                      placeholder="e.g. vinyasa-flow-harmony"
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] font-mono focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      list="categories-list"
                      placeholder="e.g. Vinyasa Flow"
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold text-foreground/80 cursor-pointer"
                    />
                    <datalist id="categories-list">
                      {SUGGESTED_CATEGORIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold text-foreground/80 cursor-pointer"
                    >
                      {DIFFICULTY_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Instructor Assignment
                    </label>
                    <select
                      required
                      value={instructorId}
                      onChange={(e) => setInstructorId(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold text-foreground/80 cursor-pointer"
                    >
                      <option value="">Select Instructor...</option>
                      {instructors.map((ins) => (
                        <option key={ins.id} value={ins.id}>
                          {ins.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Duration (Mins)
                    </label>
                    <input
                      type="number"
                      required
                      min={5}
                      value={duration}
                      onChange={(e) => setDuration(Math.max(5, parseInt(e.target.value) || 60))}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Class Capacity
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(Math.max(1, parseInt(e.target.value) || 20))}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as YogaClassStatus)}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold text-foreground/80 cursor-pointer"
                    >
                      <option value={YogaClassStatus.DRAFT}>Draft (Private)</option>
                      <option value={YogaClassStatus.PUBLISHED}>Published (Public)</option>
                      <option value={YogaClassStatus.ARCHIVED}>Archived (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* File Upload for featured graphic */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Featured Graphic URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="Upload or paste image path..."
                      className="flex-1 px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                    <label className="cursor-pointer shrink-0 py-2.5 px-4 bg-primary-sage/10 hover:bg-primary-sage/20 text-primary-forest border border-primary-sage/15 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                      {uploadingImage ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Upload size={14} />
                      )}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>

                {featuredImage && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold mt-0.5">
                    <Check size={12} /> Image attached: {featuredImage.substring(featuredImage.lastIndexOf("/") + 1)}
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-secondary-cream/50 border border-primary-sage/10 rounded-lg">
                  <input
                    type="checkbox"
                    id="isOnlineCheckbox"
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                    className="h-4 w-4 border-primary-sage/30 rounded text-primary-forest focus:ring-accent-gold cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="isOnlineCheckbox" className="text-xs font-bold text-primary-forest cursor-pointer">
                      Online Live Streamed Class
                    </label>
                    <span className="text-[10px] text-foreground/60 leading-normal">
                      Toggle active if the class is broadcast online (Zoom, Google Meet) instead of a physical studio.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50 mb-1">
                    Class Description & Details
                  </label>
                  <RichTextEditor content={description} onChange={setDescription} />
                </div>
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
                  disabled={isSaving || isPending || uploadingImage || instructors.length === 0}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest rounded-full hover:bg-primary-sage transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {editingClass ? "Update Class" : "Save Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
