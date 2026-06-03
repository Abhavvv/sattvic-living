"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, X, Book, Save, Loader2, Upload, FileText, ExternalLink, AlertCircle, Check } from "lucide-react";
import { z } from "zod";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  author: z.string().min(1, "Author is required"),
  coverImage: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  isPremium: z.boolean().default(false),
});

interface BookType {
  id: string;
  title: string;
  slug: string;
  description: string;
  author: string;
  coverImage: string | null;
  pdfUrl: string | null;
  isPremium: boolean;
}

interface BooksClientProps {
  books: BookType[];
}

export default function BooksClient({ books }: BooksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search state
  const [search, setSearch] = useState("");

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  // Upload progress indicators
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

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
    if (autoSlug && !editingBook) {
      setSlug(slugify(val));
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "covers" | "pdfs"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "covers") setUploadingCover(true);
    else setUploadingPdf(true);

    setFormError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "File upload failed.");
      }

      if (type === "covers") {
        setCoverImage(data.url);
      } else {
        setPdfUrl(data.url);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload file.";
      setFormError(msg);
    } finally {
      if (type === "covers") setUploadingCover(false);
      else setUploadingPdf(false);
    }
  };

  const openCreatePanel = () => {
    setEditingBook(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setAuthor("");
    setCoverImage("");
    setPdfUrl("");
    setIsPremium(false);
    setFormError(null);
    setAutoSlug(true);
    setPanelOpen(true);
  };

  const openEditPanel = (book: BookType) => {
    setEditingBook(book);
    setTitle(book.title);
    setSlug(book.slug);
    setDescription(book.description);
    setAuthor(book.author);
    setCoverImage(book.coverImage || "");
    setPdfUrl(book.pdfUrl || "");
    setIsPremium(book.isPremium);
    setFormError(null);
    setAutoSlug(false);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingBook(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const payload = {
      title,
      slug,
      description,
      author,
      coverImage: coverImage || null,
      pdfUrl: pdfUrl || null,
      isPremium,
    };

    const validation = bookSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      setIsSaving(false);
      return;
    }

    try {
      const url = "/api/books";
      const method = editingBook ? "PUT" : "POST";
      const bodyData = editingBook
        ? { ...payload, id: editingBook.id }
        : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save book.");
      }

      closePanel();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save book.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      const res = await fetch(`/api/books?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete book.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete book.";
      alert(msg);
    }
  };

  // Filter Books
  const filteredBooks = books.filter((book) => {
    const query = search.toLowerCase();
    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/45" />
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-primary-sage/20 rounded-full bg-[#FCFCFA] focus:outline-none transition-organic"
          />
        </div>

        <button
          onClick={openCreatePanel}
          className="w-full sm:w-auto text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-5 py-2.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          Create Book
        </button>
      </div>

      {/* Grid of Books */}
      {filteredBooks.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-primary-sage/10 text-center text-foreground/50 italic bg-[#FCFCFA]">
          No books found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="glass-panel p-6 rounded-2xl border border-primary-sage/10 bg-[#FCFCFA] flex gap-4 transition-organic hover:-translate-y-1 shadow-sm relative overflow-hidden group"
            >
              {/* Cover image area */}
              <div className="w-24 h-36 bg-secondary-cream border border-primary-sage/15 rounded-lg overflow-hidden shrink-0 shadow-sm flex items-center justify-center relative">
                {book.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Book size={24} className="text-primary-sage/40" />
                )}
                {/* Premium badge */}
                <span className={`absolute top-1 right-1 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  book.isPremium ? "badge-gold" : "badge-sage bg-[#FCFCFA]"
                }`}>
                  {book.isPremium ? "Premium" : "Free"}
                </span>
              </div>

              {/* Book Details */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-primary-forest truncate" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider">
                    By {book.author}
                  </p>
                  <p className="text-[11px] text-foreground/70 font-light line-clamp-3 leading-relaxed mt-1.5">
                    {book.description}
                  </p>
                </div>

                <div className="border-t border-primary-sage/10 pt-3 flex items-center justify-between">
                  {book.pdfUrl ? (
                    <a
                      href={book.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] uppercase font-bold tracking-wider text-accent-gold hover:text-primary-forest flex items-center gap-1 transition-colors"
                    >
                      Read PDF
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-[10px] text-foreground/35 italic">No Attachment</span>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditPanel(book)}
                      className="p-1.5 rounded-full hover:bg-primary-sage/10 text-foreground/50 hover:text-accent-gold transition-colors cursor-pointer"
                      title="Edit Book"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="p-1.5 rounded-full hover:bg-primary-sage/10 text-foreground/50 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Book"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over Form Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#F8F4EC] h-full shadow-2xl flex flex-col p-6 border-l border-primary-sage/10 animate-slide-in overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary-sage/15 pb-4 mb-6 shrink-0">
              <h3 className="font-serif text-lg font-bold text-primary-forest flex items-center gap-2">
                <Book size={18} className="text-accent-gold" />
                {editingBook ? "Modify Book" : "New Book"}
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
                    Book Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g. Yoga Sutras of Patanjali"
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Slug URL
                    </label>
                    {!editingBook && (
                      <button
                        type="button"
                        onClick={() => setAutoSlug(!autoSlug)}
                        className={`text-[9px] uppercase font-bold tracking-wider ${
                          autoSlug ? "text-accent-gold" : "text-foreground/40"
                        }`}
                      >
                        {autoSlug ? "Auto-generating" : "Manual override"}
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
                    placeholder="e.g. yoga-sutras"
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] font-mono focus:outline-none focus:border-accent-gold transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Author Name
                    </label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Patanjali"
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Pricing Tier
                    </label>
                    <div className="flex items-center h-full">
                      <button
                        type="button"
                        onClick={() => setIsPremium(!isPremium)}
                        className={`flex items-center gap-1 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border w-full justify-center ${
                          isPremium
                            ? "bg-accent-gold/10 border-accent-gold/25 text-primary-forest"
                            : "bg-[#FCFCFA] border-primary-sage/20 text-foreground/75"
                        }`}
                      >
                        {isPremium ? "Premium Edition" : "Free Digital Edition"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Book Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a detailed summary of the texts or commentary..."
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors resize-none"
                  />
                </div>

                {/* Cover File Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Cover Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="Upload cover or paste URL..."
                      className="flex-1 px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                    <label className="cursor-pointer shrink-0 py-2.5 px-4 bg-primary-sage/10 hover:bg-primary-sage/20 text-primary-forest border border-primary-sage/15 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                      {uploadingCover ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Upload size={14} />
                      )}
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "covers")}
                        disabled={uploadingCover}
                      />
                    </label>
                  </div>
                  {coverImage && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold mt-0.5">
                      <Check size={12} /> Cover attached: {coverImage.substring(coverImage.lastIndexOf("/") + 1)}
                    </div>
                  )}
                </div>

                {/* PDF File Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    PDF Document
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      placeholder="Upload PDF or paste URL..."
                      className="flex-1 px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                    <label className="cursor-pointer shrink-0 py-2.5 px-4 bg-primary-sage/10 hover:bg-primary-sage/20 text-primary-forest border border-primary-sage/15 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                      {uploadingPdf ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Upload size={14} />
                      )}
                      <span>Attach</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "pdfs")}
                        disabled={uploadingPdf}
                      />
                    </label>
                  </div>
                  {pdfUrl && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold mt-0.5">
                      <FileText size={12} /> PDF attached: {pdfUrl.substring(pdfUrl.lastIndexOf("/") + 1)}
                    </div>
                  )}
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
                  disabled={isSaving || isPending || uploadingCover || uploadingPdf}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest rounded-full hover:bg-primary-sage transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {editingBook ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
