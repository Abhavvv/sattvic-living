"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, X, FolderOpen, Save, Loader2, AlertTriangle } from "lucide-react";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  isActive: z.boolean(),
});

interface CategoryWithCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  _count?: {
    meals: number;
  };
}

interface MealCategoriesClientProps {
  initialCategories: CategoryWithCount[];
}

export default function MealCategoriesClient({ initialCategories }: MealCategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filter state
  const [search, setSearch] = useState("");

  // Editor Modal/Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isActive, setIsActive] = useState(true);
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
    setImage("");
    setIsActive(true);
    setFormError(null);
    setAutoSlug(true);
    setPanelOpen(true);
  };

  const openEditPanel = (cat: CategoryWithCount) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setIsActive(cat.isActive);
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
      image: image || null,
      isActive,
    };

    // Form validation
    const validation = categorySchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      setIsSaving(false);
      return;
    }

    try {
      const url = "/api/admin/meal-categories";
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
    if (!window.confirm("Are you sure you want to delete this category? All associated meals will be deleted as well (Cascading Delete). This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/meal-categories?id=${id}`, {
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
      alert(err instanceof Error ? err.message : "An error occurred.");
    }
  };

  const toggleStatus = async (cat: CategoryWithCount) => {
    try {
      const res = await fetch("/api/admin/meal-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cat.id,
          isActive: !cat.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to toggle status.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred.");
    }
  };

  const filteredCategories = initialCategories.filter((cat) => {
    const term = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(term) ||
      cat.slug.toLowerCase().includes(term) ||
      (cat.description && cat.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#FCFCFA]/80 backdrop-blur-md p-4 rounded-xl border border-primary-sage/10 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/45" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-forest/20 focus:border-primary-forest transition-all"
          />
        </div>

        <button
          onClick={openCreatePanel}
          className="flex items-center gap-2 bg-primary-forest hover:bg-primary-forest/90 text-[#FCFCFA] text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors focus:outline-none whitespace-nowrap"
        >
          <Plus size={15} />
          Create Category
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="bg-[#FCFCFA] rounded-xl border border-primary-sage/15 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2D3E35]/5 text-primary-forest font-serif border-b border-primary-sage/15">
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Category</th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Slug</th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Meals Count</th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Status</th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-sage/10 text-xs">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#F8F4EC]/50 transition-colors">
                    {/* Category Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-10 h-10 rounded-lg object-cover border border-primary-sage/15"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary-sage/10 border border-primary-sage/20 flex items-center justify-center text-primary-sage">
                            <FolderOpen size={16} />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-primary-forest">{cat.name}</div>
                          {cat.description && (
                            <div className="text-[10px] text-foreground/50 line-clamp-1 max-w-xs">
                              {cat.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-4 px-4 font-mono text-[10px] text-foreground/75">
                      {cat.slug}
                    </td>

                    {/* Meals Count */}
                    <td className="py-4 px-4 font-semibold text-primary-forest/80">
                      {cat._count?.meals ?? 0} meals
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleStatus(cat)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                          cat.isActive
                            ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 hover:bg-emerald-500/20"
                            : "bg-foreground/5 text-foreground/60 border border-foreground/15 hover:bg-[#2D3E35]/5"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? "bg-emerald-600 animate-pulse" : "bg-foreground/40"}`} />
                        {cat.isActive ? "Active" : "Archived"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditPanel(cat)}
                          title="Edit Category"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-sage/10 text-primary-forest hover:bg-[#F8F4EC] transition-colors focus:outline-none"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          title="Delete Category"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-red-500/10 text-red-600 hover:bg-red-500/5 transition-colors focus:outline-none"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-foreground/40 font-light">
                    {search ? "No categories matched your search criteria." : "No categories created yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Slide-over or Modal Overlay */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-primary-forest/20 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#FCFCFA] rounded-xl border border-primary-sage/20 shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={closePanel}
              className="absolute right-4 top-4 text-foreground/45 hover:text-foreground focus:outline-none"
            >
              <X size={18} />
            </button>

            <h3 className="font-serif text-lg font-bold text-primary-forest mb-4">
              {editingCategory ? "Edit Category" : "Create Meal Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg flex items-start gap-2 text-[11px] text-red-700">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Energizing Breakfasts"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest focus:ring-2 focus:ring-primary-forest/15 text-foreground transition-all"
                />
              </div>

              {/* Slug */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-primary-forest/80">
                    Slug
                  </label>
                  {!editingCategory && (
                    <label className="flex items-center gap-1 text-[10px] text-primary-forest/65 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSlug}
                        onChange={(e) => setAutoSlug(e.target.checked)}
                        className="rounded text-primary-forest focus:ring-primary-forest"
                      />
                      Auto-generate
                    </label>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. breakfast"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest focus:ring-2 focus:ring-primary-forest/15 text-foreground transition-all"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest focus:ring-2 focus:ring-primary-forest/15 text-foreground transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Summarize the character, energetic properties, and suitability of this category's meals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest focus:ring-2 focus:ring-primary-forest/15 text-foreground transition-all"
                />
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-primary-forest border-primary-sage/30 focus:ring-primary-forest"
                />
                <label htmlFor="isActiveToggle" className="text-xs text-primary-forest/80 cursor-pointer">
                  Activate Category immediately
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closePanel}
                  className="flex-1 px-4 py-2 border border-primary-sage/20 text-primary-forest text-xs font-semibold rounded-lg hover:bg-foreground/5 transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex justify-center items-center gap-2 bg-primary-forest text-[#FCFCFA] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-forest/90 transition-colors focus:outline-none"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
