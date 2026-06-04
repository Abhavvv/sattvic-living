"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, X, FolderOpen, Save, Loader2 } from "lucide-react";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"),
  description: z.string().nullable().optional(),
});

interface CategoryWithCounts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count?: {
    articles: number;
    ayurvedaContent: number;
  };
}

interface CategoriesClientProps {
  categories: CategoryWithCounts[];
}

export default function CategoriesClient({ categories }: CategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filter state
  const [search, setSearch] = useState("");

  // Editor Modal/Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCounts | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (autoSlug && !editingCategory) {
      setSlug(slugify(val));
    }
  };

  const openCreatePanel = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setFormError(null);
    setAutoSlug(true);
    setPanelOpen(true);
  };

  const openEditPanel = (cat: CategoryWithCounts) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setFormError(null);
    setAutoSlug(false);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const payload = {
      name,
      slug,
      description: description || null,
    };

    // Form validation
    const validation = categorySchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      setIsSaving(false);
      return;
    }

    try {
      const url = "/api/categories";
      const method = editingCategory ? "PUT" : "POST";
      const bodyData = editingCategory
        ? { ...payload, id: editingCategory.id }
        : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong saving the category.");
      }

      // Success
      closePanel();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save category.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category? Any linked articles and guides will be set to Uncategorized.")) {
      return;
    }

    try {
      const res = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete category.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete category.";
      alert(msg);
    }
  };

  // Filter Categories
  const filteredCategories = categories.filter((cat) => {
    const query = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query) ||
      (cat.description && cat.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/45" />
          <input
            type="text"
            placeholder="Search categories..."
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
          Create Category
        </button>
      </div>

      {/* Main Table Grid */}
      <div className="glass-panel rounded-2xl border border-primary-sage/10 shadow-sm overflow-hidden bg-[#FCFCFA]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-cream border-b border-primary-sage/10 text-[10px] uppercase font-bold tracking-widest text-foreground/60">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Slug</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Article Count</th>
                <th className="py-4 px-6">Ayurveda Count</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-sage/5 text-xs text-foreground/80">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-foreground/40 italic">
                    No categories match your search parameters.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary-cream/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-primary-forest flex items-center gap-2">
                      <FolderOpen size={14} className="text-primary-sage" />
                      {item.name}
                    </td>
                    <td className="py-4 px-6 font-mono text-[10px] text-foreground/60">{item.slug}</td>
                    <td className="py-4 px-6 text-foreground/60 max-w-xs truncate">
                      {item.description || <span className="italic text-foreground/35">No description</span>}
                    </td>
                    <td className="py-4 px-6 font-medium text-primary-forest/80">
                      {item._count?.articles ?? 0}
                    </td>
                    <td className="py-4 px-6 font-medium text-primary-forest/80">
                      {item._count?.ayurvedaContent ?? 0}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditPanel(item)}
                        className="p-1.5 text-foreground/50 hover:text-accent-gold transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-foreground/50 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete Category"
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
      </div>

      {/* Slide-over Form Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#F8F4EC] h-full shadow-2xl flex flex-col p-6 border-l border-primary-sage/10 animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary-sage/15 pb-4 mb-6">
              <h3 className="font-serif text-lg font-bold text-primary-forest flex items-center gap-2">
                <FolderOpen size={18} className="text-accent-gold" />
                {editingCategory ? "Modify Category" : "New Category"}
              </h3>
              <button
                onClick={closePanel}
                className="p-1 rounded-full hover:bg-primary-sage/10 text-foreground/70"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-xs rounded-lg font-semibold">
                    {formError}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Daily Habits"
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Slug URL
                    </label>
                    {!editingCategory && (
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
                    placeholder="e.g. daily-habits"
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] font-mono focus:outline-none focus:border-accent-gold transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief definition or summary..."
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-primary-sage/10 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closePanel}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border border-primary-forest/30 text-primary-forest rounded-full hover:bg-primary-sage/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isPending}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-[#FCFCFA] bg-primary-forest rounded-full hover:bg-primary-sage transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {editingCategory ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
