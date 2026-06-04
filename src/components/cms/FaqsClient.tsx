"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, X, HelpCircle, Save, Loader2, ArrowUp, ArrowDown, Check, AlertCircle } from "lucide-react";
import { z } from "zod";

const faqSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

interface FAQ {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

interface FaqsClientProps {
  faqs: FAQ[];
}

export default function FaqsClient({ faqs }: FaqsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search state
  const [search, setSearch] = useState("");

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  // Form state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openCreatePanel = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    // Default order to next index
    const nextOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.displayOrder)) + 1 : 0;
    setDisplayOrder(nextOrder);
    setIsActive(true);
    setFormError(null);
    setPanelOpen(true);
  };

  const openEditPanel = (faq: FAQ) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setDisplayOrder(faq.displayOrder);
    setIsActive(faq.isActive);
    setFormError(null);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingFaq(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    const payload = {
      question,
      answer,
      displayOrder: Number(displayOrder),
      isActive,
    };

    const validation = faqSchema.safeParse(payload);
    if (!validation.success) {
      setFormError(validation.error.issues[0].message);
      setIsSaving(false);
      return;
    }

    try {
      const url = "/api/faqs";
      const method = editingFaq ? "PUT" : "POST";
      const bodyData = editingFaq
        ? { ...payload, id: editingFaq.id }
        : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save FAQ.");
      }

      closePanel();
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save FAQ.";
      setFormError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/faqs?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete FAQ.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete FAQ.";
      alert(msg);
    }
  };

  const toggleActiveState = async (faq: FAQ) => {
    try {
      const res = await fetch("/api/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: faq.id,
          isActive: !faq.isActive,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not update state.";
      alert(msg);
    }
  };

  const moveFaq = async (faq: FAQ, direction: "up" | "down") => {
    // Find index in sorted list
    const sorted = [...faqs].sort((a, b) => a.displayOrder - b.displayOrder);
    const index = sorted.findIndex(f => f.id === faq.id);

    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sorted.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const targetFaq = sorted[targetIndex];

    // Swap displayOrder values
    try {
      const p1 = fetch("/api/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: faq.id, displayOrder: targetFaq.displayOrder }),
      });

      const p2 = fetch("/api/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetFaq.id, displayOrder: faq.displayOrder }),
      });

      await Promise.all([p1, p2]);

      startTransition(() => {
        router.refresh();
      });
    } catch {
      alert("Failed to swap order. Please try again.");
    }
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const query = search.toLowerCase();
    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
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
            placeholder="Search FAQs..."
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
          Create FAQ
        </button>
      </div>

      {/* Main Datatable */}
      <div className="glass-panel rounded-2xl border border-primary-sage/10 shadow-sm overflow-hidden bg-[#FCFCFA]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary-cream border-b border-primary-sage/10 text-[10px] uppercase font-bold tracking-widest text-foreground/60">
                <th className="py-4 px-6 w-24">Order</th>
                <th className="py-4 px-6">Question</th>
                <th className="py-4 px-6">Answer Snippet</th>
                <th className="py-4 px-6 w-32">Status</th>
                <th className="py-4 px-6 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-sage/5 text-xs text-foreground/80">
              {filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-foreground/40 italic">
                    No FAQs match your search parameters.
                  </td>
                </tr>
              ) : (
                filteredFaqs
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((item, idx) => (
                    <tr key={item.id} className="hover:bg-secondary-cream/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-accent-gold flex items-center gap-2">
                        <span>{item.displayOrder}</span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveFaq(item, "up")}
                            disabled={idx === 0}
                            className={`p-0.5 rounded hover:bg-primary-sage/10 text-foreground/50 hover:text-primary-forest disabled:opacity-20 cursor-pointer`}
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button
                            onClick={() => moveFaq(item, "down")}
                            disabled={idx === filteredFaqs.length - 1}
                            className={`p-0.5 rounded hover:bg-primary-sage/10 text-foreground/50 hover:text-primary-forest disabled:opacity-20 cursor-pointer`}
                          >
                            <ArrowDown size={10} />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-primary-forest max-w-xs truncate" title={item.question}>
                        {item.question}
                      </td>
                      <td className="py-4 px-6 text-foreground/60 max-w-sm truncate" title={item.answer}>
                        {item.answer}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => toggleActiveState(item)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            item.isActive
                              ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                              : "bg-zinc-500/10 text-zinc-600 hover:bg-zinc-500/20"
                          }`}
                        >
                          {item.isActive ? "Enabled" : "Disabled"}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => openEditPanel(item)}
                          className="p-1.5 text-foreground/50 hover:text-accent-gold transition-colors cursor-pointer"
                          title="Edit FAQ"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-foreground/50 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete FAQ"
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
                <HelpCircle size={18} className="text-accent-gold" />
                {editingFaq ? "Modify FAQ" : "New FAQ"}
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
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-700 text-xs rounded-lg font-semibold flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    {formError}
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Question
                  </label>
                  <input
                    type="text"
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. What is a Sattvic diet?"
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                    Answer
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Provide a detailed, clear answer explaining the concept..."
                    className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      Display Order
                    </label>
                    <input
                      type="number"
                      required
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-full px-4 py-2.5 text-xs border border-primary-sage/20 rounded-lg bg-[#FCFCFA] focus:outline-none focus:border-accent-gold transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-foreground/50">
                      FAQ Status
                    </label>
                    <div className="flex items-center h-full">
                      <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                          isActive
                            ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700"
                            : "bg-zinc-500/10 border-zinc-500/25 text-zinc-600"
                        }`}
                      >
                        <Check size={14} className={isActive ? "opacity-100" : "opacity-0"} />
                        {isActive ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>
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
                  {editingFaq ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
