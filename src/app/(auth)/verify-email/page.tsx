"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Sparkles, Mail, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const resendSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ResendFormValues = z.infer<typeof resendSchema>;

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [devWarning, setDevWarning] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setError("Activation token is missing. Please request a new verification link below.");
      setVerifying(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Email verification failed.");
        }

        setSuccess(result.message || "Email verified successfully.");
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
        setError(errMsg);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onResendSubmit = async (data: ResendFormValues) => {
    setResendError(null);
    setResendSuccess(null);
    setDevWarning(null);
    setIsResending(true);

    try {
      const response = await fetch("/api/verify-email/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to resend verification email.");
      }

      setResendSuccess(result.message || "A new verification link has been dispatched.");
      if (result.warning) {
        setDevWarning(result.warning);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setResendError(errMsg);
    } finally {
      setIsResending(false);
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
        {/* Verification Loading State */}
        {verifying && (
          <div className="text-center py-10 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-accent-gold animate-spin" />
            <h1 className="font-serif text-2xl font-bold text-primary-forest">Verifying Email Address</h1>
            <p className="text-xs text-foreground/75 font-light">
              Nourishing your connection. Synchronizing credentials with our secure registry...
            </p>
          </div>
        )}

        {/* Verification Success State */}
        {!verifying && success && (
          <div className="text-center py-8 flex flex-col items-center gap-5">
            <CheckCircle2 className="w-16 h-16 text-green-600 animate-pulse" />
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-widest text-accent-gold font-bold flex items-center justify-center gap-1.5">
                <Sparkles size={10} className="text-accent-gold" />
                Account Activated
              </span>
              <h1 className="font-serif text-3xl font-bold text-primary-forest">Email Verified!</h1>
              <p className="text-xs text-foreground/75 font-light leading-relaxed max-w-sm mx-auto">
                Thank you for activating your email. Your credentials are now fully verified. You may proceed to your dashboard.
              </p>
            </div>
            <Link
              href="/login"
              className="mt-4 text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-8 py-3.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-md"
            >
              Go To Sign In
            </Link>
          </div>
        )}

        {/* Verification Error / Resend Trigger State */}
        {!verifying && error && (
          <div className="flex flex-col gap-6">
            <div className="text-center flex flex-col items-center gap-4">
              <XCircle className="w-16 h-16 text-red-600" />
              <h1 className="font-serif text-2xl font-bold text-primary-forest">Verification Failure</h1>
              <p className="text-xs text-foreground/75 font-light leading-relaxed">
                {error}
              </p>
            </div>

            <div className="border-t border-primary-sage/10 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary-forest mb-3 text-center">
                Resend Activation Link
              </h3>
              
              {resendError && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{resendError}</span>
                </div>
              )}

              {resendSuccess && (
                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-xs flex items-start gap-2.5">
                  <Sparkles size={14} className="shrink-0 mt-0.5 text-green-600" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              {devWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-800 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600 animate-pulse" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">Developer Notice (SMTP Fallback):</span>
                    <span>{devWarning}</span>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onResendSubmit)} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                      <Mail size={16} />
                    </span>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="you@sattvicliving.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic"
                    />
                  </div>
                  {errors.email && (
                    <span className="text-[10px] text-red-500 font-medium">{errors.email.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isResending || !!resendSuccess}
                  className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-3 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isResending ? "Resending Link..." : "Request New Verification Link"}
                </button>
              </form>
            </div>

            <div className="text-center border-t border-primary-sage/10 pt-4">
              <Link
                href="/login"
                className="text-xs font-bold text-accent-gold hover:text-primary-forest transition-colors uppercase tracking-wider"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 flex items-center justify-center relative overflow-hidden bg-[#F8F4EC]">
        {/* Decorative Background Accents */}
        <div className="absolute top-20 right-0 w-80 h-80 bg-primary-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

        <Suspense fallback={
          <div className="text-center p-8 bg-white/60 rounded-xl border border-primary-sage/10">
            <div className="w-8 h-8 border-4 border-primary-sage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-light text-foreground">Initiating activation verification process...</p>
          </div>
        }>
          <VerifyEmailForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
