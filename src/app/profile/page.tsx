"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, Phone, FileText, Mail, Image as ImageIcon, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().nullable().optional(),
  bio: z.string().max(300, "Bio must be 300 characters or less").nullable().optional(),
  image: z.string().nullable().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      phone: "",
      bio: "",
      image: "",
    },
  });

  const watchedImage = watch("image");

  // Load session data into form when available
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }

    if (session?.user) {
      setValue("name", session.user.name || "");
      setValue("phone", session.user.phone || "");
      setValue("bio", session.user.bio || "");
      setValue("image", session.user.image || "");
    }
  }, [session, status, setValue, router]);

  const onSubmit = async (data: ProfileFormValues) => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile.");
      }

      // Important: Call session update() to synchronize NextAuth state in real-time
      await update({
        name: data.name,
        phone: data.phone,
        bio: data.bio,
        image: data.image,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F8F4EC] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-8 h-8 border-4 border-primary-sage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-light text-[#2D3E35] opacity-80">Loading your profile sanctuary...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F4EC] pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col gap-2 border-b border-primary-sage/15 pb-6">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-accent-gold" />
              Account Settings
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest leading-tight">
              Personal Profile
            </h1>
            <p className="text-sm text-foreground/75 font-light">
              Customize your bio details, name displays, and contacts. Ensure your profile represents your present wellness journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Profile Preview & Verification Details */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col items-center text-center gap-4">
                
                {/* Live Image Preview */}
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-accent-gold/45 shadow-md bg-secondary-cream flex items-center justify-center relative">
                  {watchedImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={watchedImage}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback on broken image link
                        e.currentTarget.src = "";
                        setValue("image", "");
                      }}
                    />
                  ) : (
                    <User size={48} className="text-primary-sage" />
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="font-serif text-lg font-bold text-primary-forest truncate max-w-[200px]">
                    {session?.user?.name || "Seeker"}
                  </h3>
                  <span className="text-[10px] text-foreground/60 font-light truncate max-w-[200px]">
                    {session?.user?.email}
                  </span>
                </div>

                <div className="text-[10px] text-foreground/50 border-t border-primary-sage/10 pt-4 w-full text-center">
                  Profile edits will reflect dynamically in your dashboard, navigation, and reservations.
                </div>
              </div>
            </div>

            {/* Right Column: Editable Form Fields */}
            <div className="md:col-span-8">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-panel p-6 sm:p-8 rounded-2xl shadow-sm border border-primary-sage/10"
              >
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs flex items-start gap-2.5">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-xs flex items-start gap-2.5">
                    <Sparkles size={16} className="shrink-0 mt-0.5 text-green-600" />
                    <span>Namaste. Your profile details have been securely updated.</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Email Address (Read-only) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                        Email Address
                      </label>
                      <span className="text-[9px] text-foreground/40 font-bold uppercase tracking-wider">
                        Read-Only Field
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/45">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        value={session?.user?.email || ""}
                        disabled
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-primary-sage/15 bg-primary-sage/5 text-foreground/60 text-sm focus:outline-none cursor-not-allowed"
                      />
                    </div>
                    <span className="text-[9px] text-foreground/40 font-light">
                      Email address cannot be changed to protect account authorization security.
                    </span>
                  </div>

                  {/* Name (Editable) */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                        <User size={16} />
                      </span>
                      <input
                        {...register("name")}
                        id="name"
                        type="text"
                        placeholder="Ananya Sen"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic"
                      />
                    </div>
                    {errors.name && (
                      <span className="text-[10px] text-red-500 font-medium">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Profile Image URL (Editable) */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="image" className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                      Profile Image URL
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                        <ImageIcon size={16} />
                      </span>
                      <input
                        {...register("image")}
                        id="image"
                        type="text"
                        placeholder="https://images.unsplash.com/... or leave blank"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic"
                      />
                    </div>
                    <span className="text-[9px] text-foreground/40 font-light">
                      Input a valid direct link of your photo (e.g. Unsplash or Gravatar) to update your sanctuary avatar.
                    </span>
                  </div>

                  {/* Phone Number (Editable) */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                        <Phone size={16} />
                      </span>
                      <input
                        {...register("phone")}
                        id="phone"
                        type="text"
                        placeholder="+1 (555) 123-4567"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic"
                      />
                    </div>
                    {errors.phone && (
                      <span className="text-[10px] text-red-500 font-medium">{errors.phone.message}</span>
                    )}
                  </div>

                  {/* Bio (Editable Textarea) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="bio" className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                        Somatic Bio
                      </label>
                      <span className="text-[9px] text-foreground/40 font-bold">
                        Maximum 300 chars
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute top-3 left-3.5 text-foreground/40">
                        <FileText size={16} />
                      </span>
                      <textarea
                        {...register("bio")}
                        id="bio"
                        rows={4}
                        placeholder="Share a brief statement about your spiritual practice, structural yoga experience, or Ayurvedic goals..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic resize-none"
                      />
                    </div>
                    {errors.bio && (
                      <span className="text-[10px] text-red-500 font-medium">{errors.bio.message}</span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !isDirty}
                    className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-8 py-4 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#FCFCFA]/30 border-t-[#FCFCFA] rounded-full animate-spin" />
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>

                </form>
              </motion.div>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
