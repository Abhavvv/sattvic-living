"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, X, BookOpen, Save, Loader2, Upload, AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { z } from "zod";
import RichTextEditor from "./RichTextEditor";
import { ArticleStatus } from "@prisma/client";

const ayurvedaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  featuredImage: z.string().nullable().optional(),
  status: z.nativeEnum(ArticleStatus).default(ArticleStatus.DRAFT),
  categoryId: z.string().nullable().optional(),
});

interface Category {
  id: string;
  name: string;
}

interface AyurvedaType {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string | null;
  status: ArticleStatus;
  categoryId: string | null;
  category: Category | null;
  createdAt: Date | string;
}

interface AyurvedaClientProps {
  contents: AyurvedaType[];
  categories: Category[];
}

const ITEMS_PER_PAGE = 8;

export default function AyurvedaClient({ contents, categories }: AyurvedaClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters & Page state
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<AyurvedaType | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<ArticleStatus>(ArticleStatus.DRAFT);
  const [categoryId, setCategoryId] = useState("");

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
    if (autoSlug && !editingContent) {
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
    setEditingContent(null);
    setTitle("");
    setSlug("");
    setContent("");
    setFeaturedImage("");
    setStatus(ArticleStatus.DRAFT);
    setCategoryId("");
    setFormError(null);
    setAutoSlug(true);
    setPanelOpen(true);
  };

  const openEditPanel = (item: AyurvedaType) => {
    setEditingContent(item);
    setTitle(item.title);
    setSlug(item.slug);
    setContent(item.content);
    setFeaturedImage(item.featuredImage || "");
    setStatus(item.status);
    setCategoryId(item.categoryId || "");
    setFormError(null);
    setAutoSlug(false);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingContent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const payload = {
      title,
      slug,
      content,
      featuredImage: featuredImage || null,
      status,
      categoryId: categoryId || null,
    };

    const validation = ayurvedaSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      setIsSaving(false);
      return;
    }

    try {
      const url = "/api/ayurveda";
      const method = editingContent ? "PUT" : "POST";
      const bodyData = editingContent
        ? { ...payload, id: editingContent.id }
        : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save Ayurveda content.");
      }

      closePanel();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save Ayurveda content.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Ayurveda content?")) {
      return;
    }

    try {
      const res = await fetch(`/api/ayurveda?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete content.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete content.";
      alert(msg);
    }
  };

  // Filter Logic
  const filteredContents = contents.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = filterCategory === "" || item.categoryId === filterCategory;
    const matchesStatus = filterStatus === "" || item.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredContents.length / ITEMS_PER_PAGE);
  const paginatedContents = filteredContents.slice(
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
      {/* Header controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/45" />
            <input
              type="text"
              placeholder="Search guides..."
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
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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
            <option value={ArticleStatus.DRAFT}>Draft</option>
            <option value={ArticleStatus.PUBLISHED}>Published</option>
            <option value={ArticleStatus.ARCHIVED}>Archived</option>
          </select>
        </div>

        <button
          onClick={openCreatePanel}
          className="w-full md:w-auto text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-5 py-2.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          Create Guide
        </button>
      </div>

      {/* Main Datatable */}
      <div className="glass-panel rounded-2xl border border-primary-sage/10 shadow-sm overflow-hidden bg-[#FCFCFA]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-cream border-b border-primary-sage/10 text-[10px] uppercase font-bold tracking-widest text-foreground/60">
                <th className="py-4 px-6">Featured</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Slug</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Created At</th>
                <th className="py-4 px-6 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-sage/5 text-xs text-foreground/80">
              {paginatedContents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-foreground/40 italic">
                    No Ayurveda guides found matching the filter parameters.
                  </td>
                </tr>
              ) : (
                paginatedContents.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary-cream/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-10 h-7 rounded border border-primary-sage/15 bg-secondary-cream overflow-hidden shadow-sm flex items-center justify-center">
                        {item.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.featuredImage} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen size={12} className="text-primary-sage/40" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-primary-forest max-w-xs truncate" title={item.title}>
                      {item.title}
                    </td>
                    <td className="py-4 px-6 font-mono text-[10px] text-foreground/60">{item.slug}</td>
                    <td className="py-4 px-6">
                      {item.category ? (
                        <span className="badge-sage px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                          {item.category.name}
                        </span>
                      ) : (
                        <span className="text-foreground/45 italic">Uncategorized</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-700" :
                        item.status === "DRAFT" ? "bg-amber-500/10 text-amber-700" : "bg-zinc-500/10 text-zinc-700"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-foreground/60">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditPanel(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-sage/10 text-foreground/50 hover:text-accent-gold hover:bg-accent-gold/5 focus-visible:ring-1 focus-visible:ring-accent-gold transition-all cursor-pointer"
                          title="Edit Ayurveda Guide"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-sage/10 text-foreground/50 hover:text-red-600 hover:bg-red-500/5 focus-visible:ring-1 focus-visible:ring-red-500 transition-all cursor-pointer"
                          title="Delete Ayurveda Guide"
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
              Showing Page {currentPage} of {totalPages} ({filteredContents.length} items total)
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

      {/* Slide-over Form Panel (Fullscreen or Large on editor views) */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-4xl bg-[#F8F4EC] h-full shadow-2xl flex flex-col p-6 border-l border-primary-sage/10 animate-slide-in overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary-sage/15 pb-4 mb-6 shrink-0">
              <h3 className="font-serif text-lg font-bold text-primary-forest flex items-center gap-2">
                <BookOpen size={18} className="text-accent-gold" />
                {editingContent ? "Modify Ayurveda Guide" : "New Ayurveda Guide"}
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
                    Guide Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Balancing Pitta in Summer Season"
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                        Slug URL
                      </label>
                      {!editingContent && (
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
                      placeholder="e.g. balancing-pitta"
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] font-mono focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Category Assignment
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold text-foreground/80 cursor-pointer"
                    >
                      <option value="">Uncategorized</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Publication Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold text-foreground/80 cursor-pointer"
                    >
                      <option value={ArticleStatus.DRAFT}>Draft (Private)</option>
                      <option value={ArticleStatus.PUBLISHED}>Published (Public)</option>
                      <option value={ArticleStatus.ARCHIVED}>Archived (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Featured Image File Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Featured Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="Upload featured image or paste URL..."
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
                  {featuredImage && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold mt-0.5">
                      <Check size={12} /> Image attached: {featuredImage.substring(featuredImage.lastIndexOf("/") + 1)}
                    </div>
                  )}
                </div>

                {/* Content Rich Text Area */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50 mb-1">
                    Guide Content
                  </label>
                  <RichTextEditor content={content} onChange={setContent} />
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
                  disabled={isSaving || isPending || uploadingImage}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest rounded-full hover:bg-primary-sage transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {editingContent ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
