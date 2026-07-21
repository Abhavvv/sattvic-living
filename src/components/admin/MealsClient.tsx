"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, X, Salad, Save, Loader2, AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { z } from "zod";

const mealSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-_]+$/, "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"),
  shortDescription: z.string().min(1, "Short description is required"),
  description: z.string().min(1, "Description is required"),
  image: z.string().nullable().optional(),
  categoryId: z.string().min(1, "Category is required"),
  price: z.number().min(0, "Price must be a positive number"),
  calories: z.number().int().min(0, "Calories must be positive"),
  protein: z.number().int().min(0, "Protein must be positive"),
  carbs: z.number().int().min(0, "Carbohydrates must be positive"),
  fat: z.number().int().min(0, "Fat must be positive"),
  ingredients: z.string().min(1, "Ingredients list is required"),
  benefits: z.string().min(1, "Benefits list is required"),
  preparationNotes: z.string().min(1, "Preparation notes are required"),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  isAvailable: z.boolean(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
});

interface Meal {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  image: string | null;
  categoryId: string;
  price: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string;
  benefits: string;
  preparationNotes: string;
  isFeatured: boolean;
  isPublished: boolean;
  isAvailable: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  category: {
    id: string;
    name: string;
  };
}

interface CategoryOption {
  id: string;
  name: string;
}

interface MealsClientProps {
  categories: CategoryOption[];
}

export default function MealsClient({ categories }: MealsClientProps) {

  // Grid Query State
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 8;

  // Editor Modal/Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState(10);
  const [calories, setCalories] = useState(300);
  const [protein, setProtein] = useState(15);
  const [carbs, setCarbs] = useState(40);
  const [fat, setFat] = useState(10);
  const [ingredients, setIngredients] = useState("");
  const [benefits, setBenefits] = useState("");
  const [preparationNotes, setPreparationNotes] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Load meals on filters change
  const fetchMeals = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const queryParams = new URLSearchParams({
        search,
        categoryId: selectedCategory,
        status: selectedStatus,
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/admin/meals?${queryParams.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch meals.");

      setMeals(data.meals);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load meals catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, selectedCategory, selectedStatus, sortBy, sortOrder, page]);

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
    if (autoSlug && !editingMeal) {
      setSlug(slugify(val));
    }
  };

  const openCreatePanel = () => {
    setEditingMeal(null);
    setName("");
    setSlug("");
    setShortDescription("");
    setDescription("");
    setImage("");
    setCategoryId(categories[0]?.id || "");
    setPrice(15);
    setCalories(350);
    setProtein(12);
    setCarbs(45);
    setFat(10);
    setIngredients("");
    setBenefits("");
    setPreparationNotes("");
    setIsFeatured(false);
    setIsPublished(false);
    setIsAvailable(true);
    setMetaTitle("");
    setMetaDescription("");
    setFormError(null);
    setAutoSlug(true);
    setPanelOpen(true);
  };

  const openEditPanel = (meal: Meal) => {
    setEditingMeal(meal);
    setName(meal.name);
    setSlug(meal.slug);
    setShortDescription(meal.shortDescription);
    setDescription(meal.description);
    setImage(meal.image || "");
    setCategoryId(meal.categoryId);
    setPrice(meal.price);
    setCalories(meal.calories);
    setProtein(meal.protein);
    setCarbs(meal.carbs);
    setFat(meal.fat);
    setIngredients(meal.ingredients);
    setBenefits(meal.benefits);
    setPreparationNotes(meal.preparationNotes);
    setIsFeatured(meal.isFeatured);
    setIsPublished(meal.isPublished);
    setIsAvailable(meal.isAvailable);
    setMetaTitle(meal.metaTitle || "");
    setMetaDescription(meal.metaDescription || "");
    setFormError(null);
    setAutoSlug(false);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingMeal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const payload = {
      name,
      slug,
      shortDescription,
      description,
      image: image || null,
      categoryId,
      price: parseFloat(price.toString()),
      calories: parseInt(calories.toString(), 10),
      protein: parseInt(protein.toString(), 10),
      carbs: parseInt(carbs.toString(), 10),
      fat: parseInt(fat.toString(), 10),
      ingredients,
      benefits,
      preparationNotes,
      isFeatured,
      isPublished,
      isAvailable,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    };

    const validation = mealSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      setIsSaving(false);
      return;
    }

    try {
      const url = "/api/admin/meals";
      const method = editingMeal ? "PUT" : "POST";
      const bodyData = editingMeal
        ? { ...payload, id: editingMeal.id }
        : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save meal item.");

      closePanel();
      fetchMeals();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this meal item? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/meals?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete meal.");

      fetchMeals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred.");
    }
  };

  const togglePublishStatus = async (meal: Meal) => {
    try {
      const res = await fetch("/api/admin/meals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: meal.id,
          isPublished: !meal.isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle publish status.");

      fetchMeals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred.");
    }
  };

  const toggleAvailabilityStatus = async (meal: Meal) => {
    try {
      const res = await fetch("/api/admin/meals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: meal.id,
          isAvailable: !meal.isAvailable,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle availability status.");

      fetchMeals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred.");
    }
  };

  const toggleFeaturedStatus = async (meal: Meal) => {
    try {
      const res = await fetch("/api/admin/meals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: meal.id,
          isFeatured: !meal.isFeatured,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to toggle featured status.");

      fetchMeals();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred.");
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search and Advanced Filters */}
      <div className="bg-[#FCFCFA]/80 backdrop-blur-md p-5 rounded-xl border border-primary-sage/10 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/45" />
            <input
              type="text"
              placeholder="Search meals by name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-forest/20 focus:border-primary-forest transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] text-foreground focus:outline-none focus:ring-2 focus:ring-primary-forest/15"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] text-foreground focus:outline-none focus:ring-2 focus:ring-primary-forest/15"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="featured">Featured</option>
            </select>

            <button
              onClick={openCreatePanel}
              className="flex items-center gap-2 bg-primary-forest hover:bg-primary-forest/90 text-[#FCFCFA] text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors focus:outline-none whitespace-nowrap ml-auto"
            >
              <Plus size={15} />
              Create Meal
            </button>
          </div>
        </div>
      </div>

      {/* Meals Table */}
      {errorMsg && (
        <div className="p-4 bg-red-500/5 border border-red-500/15 text-xs text-red-700 rounded-xl flex items-center gap-2">
          <AlertTriangle size={16} />
          {errorMsg}
        </div>
      )}

      <div className="bg-[#FCFCFA] rounded-xl border border-primary-sage/15 overflow-hidden shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-[#FCFCFA]/75 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary-forest" size={32} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2D3E35]/5 text-primary-forest font-serif border-b border-primary-sage/15">
                <th onClick={() => handleSort("name")} className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#2D3E35]/10 select-none">
                  <div className="flex items-center gap-1.5">Meal <ArrowUpDown size={12} /></div>
                </th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Category</th>
                <th onClick={() => handleSort("price")} className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#2D3E35]/10 select-none">
                  <div className="flex items-center gap-1.5">Price <ArrowUpDown size={12} /></div>
                </th>
                <th onClick={() => handleSort("calories")} className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-[#2D3E35]/10 select-none">
                  <div className="flex items-center gap-1.5">Calories <ArrowUpDown size={12} /></div>
                </th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Availability</th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Published</th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider">Featured</th>
                <th className="py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-sage/10 text-xs">
              {meals.length > 0 ? (
                meals.map((meal) => (
                  <tr key={meal.id} className="hover:bg-[#F8F4EC]/50 transition-colors">
                    {/* Meal details */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {meal.image ? (
                          <img
                            src={meal.image}
                            alt={meal.name}
                            className="w-11 h-11 rounded-lg object-cover border border-primary-sage/15"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-primary-sage/10 border border-primary-sage/20 flex items-center justify-center text-primary-sage">
                            <Salad size={18} />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-primary-forest">{meal.name}</div>
                          <div className="text-[10px] text-foreground/50 line-clamp-1 max-w-xs font-light">
                            {meal.shortDescription}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-accent-gold/10 text-accent-gold-dark border border-accent-gold/25">
                        {meal.category.name}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-bold text-primary-forest">
                      ${meal.price.toFixed(2)}
                    </td>

                    {/* Calories / Macros */}
                    <td className="py-4 px-4 font-mono text-[10px] text-foreground/80">
                      <div>{meal.calories} kcal</div>
                      <div className="text-[9px] text-foreground/45">
                        P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                      </div>
                    </td>

                    {/* Available */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleAvailabilityStatus(meal)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                          meal.isAvailable
                            ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-700 border border-red-500/20"
                        }`}
                      >
                        {meal.isAvailable ? "Instock" : "Out of stock"}
                      </button>
                    </td>

                    {/* Published */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => togglePublishStatus(meal)}
                        className={`inline-flex items-center gap-1.5 p-1 rounded-lg hover:bg-foreground/5 text-foreground/60 transition-colors`}
                        title={meal.isPublished ? "Unpublish Meal" : "Publish Meal"}
                      >
                        {meal.isPublished ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold"><Eye size={14} /> Yes</span>
                        ) : (
                          <span className="flex items-center gap-1 text-foreground/40"><EyeOff size={14} /> No</span>
                        )}
                      </button>
                    </td>

                    {/* Featured */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleFeaturedStatus(meal)}
                        className="inline-flex items-center gap-1"
                        title="Toggle Featured"
                      >
                        <Sparkles
                          size={14}
                          className={`transition-colors ${meal.isFeatured ? "text-accent-gold fill-accent-gold" : "text-foreground/20"}`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditPanel(meal)}
                          title="Edit Meal"
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-sage/10 text-primary-forest hover:bg-[#F8F4EC] transition-colors focus:outline-none"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(meal.id)}
                          title="Delete Meal"
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
                  <td colSpan={8} className="py-12 text-center text-foreground/40 font-light">
                    {search || selectedCategory || selectedStatus ? "No meals found matching your filters." : "No meals cataloged yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-primary-sage/10 bg-[#2D3E35]/5">
            <span className="text-[10px] text-foreground/60">
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalCount} meals cataloged)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-primary-sage/20 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-[#F8F4EC] text-primary-forest focus:outline-none transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-primary-sage/20 disabled:opacity-40 disabled:hover:bg-transparent hover:bg-[#F8F4EC] text-primary-forest focus:outline-none transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Creation/Editing Modal Dialog */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-forest/30 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#FCFCFA] rounded-xl border border-primary-sage/20 shadow-2xl p-6 relative overflow-y-auto max-h-[90vh] space-y-6">
            <button
              onClick={closePanel}
              className="absolute right-4 top-4 text-foreground/45 hover:text-foreground focus:outline-none"
            >
              <X size={18} />
            </button>

            <div>
              <h3 className="font-serif text-xl font-bold text-primary-forest">
                {editingMeal ? `Edit Meal: ${name}` : "Create New Meal Item"}
              </h3>
              <p className="text-[10px] text-foreground/50">
                Input detailed specifications, nutrient values, and publishing indicators for the dish.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg flex items-start gap-2 text-[11px] text-red-700">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div>{formError}</div>
                </div>
              )}

              {/* Grid Layout of Form Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Column 1: Basic details */}
                <div className="space-y-4">
                  <h4 className="font-serif text-xs font-bold text-accent-gold-dark border-b border-primary-sage/10 pb-1.5">
                    Basic Identification
                  </h4>

                  {/* Meal Name */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                      Meal Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tridoshic Golden Kitchari"
                      value={name}
                      onChange={handleNameChange}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80">
                        Slug
                      </label>
                      {!editingMeal && (
                        <label className="flex items-center gap-1 text-[9px] text-primary-forest/65 cursor-pointer">
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
                      placeholder="e.g. tridoshic-golden-kitchari"
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Pricing and Image */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        min="0"
                        placeholder="15.00"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                      Short Summary Description
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Warm digestible split mung dal and basmati rice with ghee..."
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                      Detailed Narrative Description
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder=" Ayurveda's signature restorative dish..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                    />
                  </div>
                </div>

                {/* Column 2: Nutrition details, preparation notes, settings */}
                <div className="space-y-4">
                  <h4 className="font-serif text-xs font-bold text-accent-gold-dark border-b border-primary-sage/10 pb-1.5">
                    Nutritional Macros & Attributes
                  </h4>

                  {/* Nutrition parameters */}
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-bold text-primary-forest/85 mb-1">
                        Calories
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={calories}
                        onChange={(e) => setCalories(parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-bold text-primary-forest/85 mb-1">
                        Protein (g)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={protein}
                        onChange={(e) => setProtein(parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-bold text-primary-forest/85 mb-1">
                        Carbs (g)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={carbs}
                        onChange={(e) => setCarbs(parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase tracking-wider font-bold text-primary-forest/85 mb-1">
                        Fats (g)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={fat}
                        onChange={(e) => setFat(parseInt(e.target.value, 10))}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                      />
                    </div>
                  </div>

                  {/* Ingredients, benefits, notes */}
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                      Ingredients (comma-separated list)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mung Dal, Basmati Rice, Ghee, Ginger, Cumin"
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                      Wellness Benefits (comma-separated list)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Improves digestion, Clears toxins, Balances Agni"
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                      Preparation Notes
                    </label>
                    <textarea
                      rows={2.5}
                      required
                      placeholder="Simmer dal and rice with spices, stir in ghee..."
                      value={preparationNotes}
                      onChange={(e) => setPreparationNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* SEO and Status section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-primary-sage/10 pt-4">
                {/* SEO fields */}
                <div className="space-y-4">
                  <h4 className="font-serif text-xs font-bold text-accent-gold-dark border-b border-primary-sage/10 pb-1.5">
                    SEO Metadata Tags
                  </h4>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                      Meta Title Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tridoshic Golden Kitchari - Sattvic Living"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-primary-forest/80 mb-1">
                      Meta Description Tag
                    </label>
                    <input
                      type="text"
                      placeholder="Nourish and cleanse your body with our Ayurveda meal program..."
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-primary-sage/20 bg-[#FCFCFA] focus:outline-none focus:border-primary-forest text-foreground"
                    />
                  </div>
                </div>

                {/* Status Options */}
                <div className="space-y-4">
                  <h4 className="font-serif text-xs font-bold text-accent-gold-dark border-b border-primary-sage/10 pb-1.5">
                    Publication & Availability States
                  </h4>

                  <div className="space-y-3.5 pt-2">
                    {/* Available */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isAvailableToggle"
                        checked={isAvailable}
                        onChange={(e) => setIsAvailable(e.target.checked)}
                        className="rounded text-primary-forest border-primary-sage/30 focus:ring-primary-forest w-4 h-4"
                      />
                      <label htmlFor="isAvailableToggle" className="text-xs text-primary-forest font-semibold cursor-pointer">
                        Mark in stock & available for daily deliveries
                      </label>
                    </div>

                    {/* Published */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isPublishedToggle"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="rounded text-primary-forest border-primary-sage/30 focus:ring-primary-forest w-4 h-4"
                      />
                      <label htmlFor="isPublishedToggle" className="text-xs text-primary-forest font-semibold cursor-pointer">
                        Publish to public catalog instantly
                      </label>
                    </div>

                    {/* Featured */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="isFeaturedToggle"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="rounded text-primary-forest border-primary-sage/30 focus:ring-primary-forest w-4 h-4"
                      />
                      <label htmlFor="isFeaturedToggle" className="text-xs text-primary-forest font-semibold cursor-pointer">
                        Feature this dish on the main portal page
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 pt-4 border-t border-primary-sage/15">
                <button
                  type="button"
                  onClick={closePanel}
                  className="flex-1 px-4 py-2.5 border border-primary-sage/20 text-primary-forest text-xs font-semibold rounded-lg hover:bg-foreground/5 transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex justify-center items-center gap-2 bg-primary-forest text-[#FCFCFA] text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-forest/90 transition-colors focus:outline-none"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Meal Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
