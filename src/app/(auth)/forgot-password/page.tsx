"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Mail, AlertCircle, Sparkles, Flower } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devWarning, setDevWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null);
    setSuccess(null);
    setDevWarning(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request.");
      }

      setSuccess(result.message);
      if (result.warning) {
        setDevWarning(result.warning);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 flex items-center justify-center relative overflow-hidden bg-[#F8F4EC]">
        {/* Aesthetic Background Accents */}
        <div className="absolute top-20 right-0 w-80 h-80 bg-primary-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

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
                <Flower size={10} className="text-accent-gold" />
                Restore Access
              </span>
              <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
                Forgot Password
              </h1>
              <p className="text-xs text-foreground/75 font-light">
                Enter your registered email address below, and we will transmit a secure, one-time link to reset your password.
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
                <span>{success}</span>
              </motion.div>
            )}

            {devWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-800 text-xs flex items-start gap-2.5"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600 animate-pulse" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">Developer Notice (SMTP Fallback):</span>
                  <span>{devWarning}</span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                    <Mail size={16} />
                  </span>
                  <input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="you@sattvicliving.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic"
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] text-red-500 font-medium">{errors.email.message}</span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !!success}
                className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-4 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-md hover:shadow-primary-sage/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#FCFCFA]/30 border-t-[#FCFCFA] rounded-full animate-spin" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <span>Request Reset Link</span>
                )}
              </button>
            </form>

            {/* Footer Links */}
            <div className="text-center mt-8 space-y-2">
              <p className="text-xs text-foreground/60 font-light">
                Remembered your details?{" "}
                <Link href="/login" className="font-bold text-accent-gold hover:text-primary-forest transition-colors">
                  Return to Sign In &rarr;
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
