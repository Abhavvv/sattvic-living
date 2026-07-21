"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  User,
  Save,
  Loader2,
  Upload,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { z } from "zod";

const instructorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-_]+$/,
      "Slug must only contain lowercase alphanumeric characters, hyphens, and underscores"
    ),
  bio: z.string().min(1, "Bio is required"),
  profileImage: z.string().nullable().optional(),
  certifications: z.string().nullable().optional(),
  specialization: z.string().min(1, "Specialization is required"),
  experienceYears: z.number().int().nonnegative("Experience years must be positive"),
  email: z.string().email("Invalid email address"),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

interface InstructorType {
  id: string;
  name: string;
  slug: string;
  bio: string;
  profileImage: string | null;
  certifications: string | null;
  specialization: string;
  experienceYears: number;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date | string;
}

interface InstructorsClientProps {
  instructors: InstructorType[];
}

const ITEMS_PER_PAGE = 8;

export default function InstructorsClient({ instructors }: InstructorsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters & Page state
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorType | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [certifications, setCertifications] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (autoSlug && !editingInstructor) {
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
        throw new Error(data.error || "Profile image upload failed.");
      }

      setProfileImage(data.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to upload file.";
      setFormError(msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const openCreatePanel = () => {
    setEditingInstructor(null);
    setName("");
    setSlug("");
    setBio("");
    setProfileImage("");
    setCertifications("");
    setSpecialization("");
    setExperienceYears(0);
    setEmail("");
    setPhone("");
    setIsActive(true);
    setFormError(null);
    setAutoSlug(true);
    setPanelOpen(true);
  };

  const openEditPanel = (item: InstructorType) => {
    setEditingInstructor(item);
    setName(item.name);
    setSlug(item.slug);
    setBio(item.bio);
    setProfileImage(item.profileImage || "");
    setCertifications(item.certifications || "");
    setSpecialization(item.specialization);
    setExperienceYears(item.experienceYears);
    setEmail(item.email);
    setPhone(item.phone || "");
    setIsActive(item.isActive);
    setFormError(null);
    setAutoSlug(false);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingInstructor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const payload = {
      name,
      slug,
      bio,
      profileImage: profileImage || null,
      certifications: certifications || null,
      specialization,
      experienceYears: Number(experienceYears),
      email,
      phone: phone || null,
      isActive,
    };

    const validation = instructorSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      setIsSaving(false);
      return;
    }

    try {
      const url = "/api/yoga/instructors";
      const method = editingInstructor ? "PUT" : "POST";
      const bodyData = editingInstructor
        ? { ...payload, id: editingInstructor.id }
        : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save instructor.");
      }

      closePanel();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save instructor.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this instructor? Deleting them will automatically remove all their yoga classes and scheduled sessions!"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/yoga/instructors?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete instructor.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete instructor.";
      alert(msg);
    }
  };

  // Filter Logic
  const filteredInstructors = instructors.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.slug.toLowerCase().includes(search.toLowerCase()) ||
      item.specialization.toLowerCase().includes(search.toLowerCase()) ||
      (item.certifications && item.certifications.toLowerCase().includes(search.toLowerCase())) ||
      item.email.toLowerCase().includes(search.toLowerCase());

    const matchesActive =
      filterActive === ""
        ? true
        : filterActive === "active"
        ? item.isActive
        : !item.isActive;

    return matchesSearch && matchesActive;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInstructors.length / ITEMS_PER_PAGE);
  const paginatedInstructors = filteredInstructors.slice(
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
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/45" />
            <input
              type="text"
              placeholder="Search instructors..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs border border-primary-sage/20 rounded-full bg-[#FCFCFA] focus:outline-none transition-organic"
            />
          </div>

          <select
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto px-4 py-2 text-xs border border-primary-sage/20 rounded-full bg-[#FCFCFA] focus:outline-none text-foreground/80 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          onClick={openCreatePanel}
          className="w-full md:w-auto text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-5 py-2.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          Add Instructor
        </button>
      </div>

      {/* Main Datatable */}
      <div className="glass-panel rounded-2xl border border-primary-sage/10 shadow-sm overflow-hidden bg-[#FCFCFA]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-cream border-b border-primary-sage/10 text-[10px] uppercase font-bold tracking-widest text-foreground/60">
                <th className="py-4 px-6 w-16">Avatar</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Slug</th>
                <th className="py-4 px-6">Specialization</th>
                <th className="py-4 px-6">Experience</th>
                <th className="py-4 px-6">Email / Phone</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-sage/5 text-xs text-foreground/80">
              {paginatedInstructors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-foreground/40 italic">
                    No instructors found matching the filter parameters.
                  </td>
                </tr>
              ) : (
                paginatedInstructors.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary-cream/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-9 h-9 rounded-full border border-primary-sage/15 bg-secondary-cream overflow-hidden shadow-sm flex items-center justify-center">
                        {item.profileImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.profileImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={14} className="text-primary-sage/40" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-primary-forest">{item.name}</td>
                    <td className="py-4 px-6 font-mono text-[10px] text-foreground/60">
                      {item.slug}
                    </td>
                    <td className="py-4 px-6">{item.specialization}</td>
                    <td className="py-4 px-6 font-light">{item.experienceYears} Years</td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground/80">{item.email}</span>
                        {item.phone && (
                          <span className="text-[10px] text-foreground/50">{item.phone}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.isActive
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-zinc-500/10 text-zinc-700"
                        }`}
                      >
                        {item.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditPanel(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-sage/10 text-foreground/50 hover:text-accent-gold hover:bg-accent-gold/5 focus-visible:ring-1 focus-visible:ring-accent-gold transition-all cursor-pointer"
                          title="Edit Instructor"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg border border-primary-sage/10 text-foreground/50 hover:text-red-600 hover:bg-red-50 focus-visible:ring-1 focus-visible:ring-red-500 transition-all cursor-pointer"
                          title="Delete Instructor"
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
              Showing Page {currentPage} of {totalPages} ({filteredInstructors.length} items total)
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
          <div className="w-full max-w-2xl bg-[#F8F4EC] h-full shadow-2xl flex flex-col p-6 border-l border-primary-sage/10 animate-slide-in overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary-sage/15 pb-4 mb-6 shrink-0">
              <h3 className="font-serif text-lg font-bold text-primary-forest flex items-center gap-2">
                <User size={18} className="text-accent-gold" />
                {editingInstructor ? "Modify Instructor Profile" : "New Instructor Profile"}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Instructor Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={handleNameChange}
                      placeholder="e.g. Acharya Shrikant"
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                        Slug URL
                      </label>
                      {!editingInstructor && (
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
                      placeholder="e.g. acharya-shrikant"
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] font-mono focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. shrikant@sattvicliving.com"
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Contact Phone (Optional)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Specialization Area
                    </label>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Hatha, Ashtanga, Pranayama"
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Certifications (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="e.g. RYT 500, Yoga Alliance, Bihar School of Yoga"
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                  />
                </div>

                {/* Profile Image File Upload */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Profile Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={profileImage}
                      onChange={(e) => setProfileImage(e.target.value)}
                      placeholder="Upload or paste image URL..."
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

                {profileImage && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold mt-0.5">
                    <Check size={12} /> Image attached: {profileImage.substring(profileImage.lastIndexOf("/") + 1)}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Detailed Biography
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe the guide's lineage, experience, teachings philosophy..."
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary-cream/50 border border-primary-sage/10 rounded-lg">
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 border-primary-sage/30 rounded text-primary-forest focus:ring-accent-gold cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <label htmlFor="isActiveCheckbox" className="text-xs font-bold text-primary-forest cursor-pointer">
                      Profile Active Status
                    </label>
                    <span className="text-[10px] text-foreground/60 leading-normal">
                      Inactive instructors are hidden from public portal listings.
                    </span>
                  </div>
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
                  {editingInstructor ? "Update Profile" : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
