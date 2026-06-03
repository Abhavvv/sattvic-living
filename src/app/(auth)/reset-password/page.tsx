"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, AlertCircle, Sparkles, Flame } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Reset token is missing from the link URL. Please request a new reset link.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setError("Cannot submit: Reset token is missing.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update your password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login?reset=true");
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg px-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="glass-panel p-8 sm:p-10 rounded-2xl shadow-xl gold-glow border border-primary-sage/10"
      >
        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3 mb-8">
          <span className="text-[10px] uppercase tracking-widest text-accent-gold border border-accent-gold/45 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
            <Flame size={10} className="text-accent-gold" />
            Renew Credentials
          </span>
          <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
            Reset Password
          </h1>
          <p className="text-xs text-foreground/75 font-light">
            Formulate a resilient new password below to re-secure your access.
          </p>
        </div>

        {/* Error and Success Banner messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs flex items-start gap-2.5"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-xs flex items-start gap-2.5"
          >
            <Sparkles size={16} className="shrink-0 mt-0.5 text-green-600" />
            <span>Success! Password updated. Guiding you back to login...</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-primary-forest">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                <Lock size={16} />
              </span>
              <input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={!token || success}
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={!token || success}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-primary-forest transition-colors focus:outline-none disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 font-medium">{errors.password.message}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-primary-forest">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                <Lock size={16} />
              </span>
              <input
                {...register("confirmPassword")}
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={!token || success}
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={!token || success}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-primary-forest transition-colors focus:outline-none disabled:opacity-50"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="text-[10px] text-red-500 font-medium">{errors.confirmPassword.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !token || success}
            className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-4 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-md hover:shadow-primary-sage/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#FCFCFA]/30 border-t-[#FCFCFA] rounded-full animate-spin" />
                <span>Committing...</span>
              </>
            ) : (
              <span>Commit New Password</span>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center mt-8">
          <p className="text-xs text-foreground/60 font-light">
            Remembered your details?{" "}
            <Link href="/login" className="font-bold text-accent-gold hover:text-primary-forest transition-colors">
              Return to Sign In &rarr;
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 flex items-center justify-center relative overflow-hidden bg-[#F8F4EC]">
        {/* Aesthetic Background Accents */}
        <div className="absolute top-20 right-0 w-80 h-80 bg-primary-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

        <Suspense fallback={
          <div className="text-center p-8 bg-white/60 rounded-xl border border-primary-sage/10">
            <div className="w-8 h-8 border-4 border-primary-sage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-light text-foreground">Syncing recovery session details...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
