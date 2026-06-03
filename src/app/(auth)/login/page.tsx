"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles, Compass } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devWarning, setDevWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read status query parameters for successful redirects
  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccess("Account registered successfully. Please sign in with your credentials.");
    } else if (searchParams.get("reset") === "true") {
      setSuccess("Your password was reset successfully. Please sign in with your new password.");
    }

    const warningParam = searchParams.get("warning");
    if (warningParam) {
      setDevWarning(warningParam);
    }

    const authError = searchParams.get("error");
    if (authError) {
      if (authError === "CredentialsSignin") {
        setError("Invalid email address or password. Please verify and try again.");
      } else {
        setError("An authentication error occurred. Please try again.");
      }
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // Call Auth.js credentials provider
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Handle rate-limit errors or credentials mismatch
        if (result.error.includes("Too many")) {
          setError("Too many login attempts. Please try again in 1 minute.");
        } else {
          setError("Invalid email address or password. Please verify and try again.");
        }
        return;
      }

      // Refresh page and redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error(err);
      setError("Google authentication failed. Please try again.");
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
            <Compass size={10} className="text-accent-gold" />
            Sign In
          </span>
          <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-foreground/75 font-light">
            Return to your pristine state of quiet focus, healthy nutrition, and movement.
          </p>
        </div>

        {/* Error and Success Banner messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-xs flex items-start gap-2.5">
            <Sparkles size={16} className="shrink-0 mt-0.5 text-green-600" />
            <span>{success}</span>
          </div>
        )}

        {devWarning && (
          <div className="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded text-amber-800 text-xs flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-600 animate-pulse" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Developer Notice (SMTP Fallback):</span>
              <span>{devWarning}</span>
            </div>
          </div>
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

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-semibold text-accent-gold hover:text-primary-forest transition-colors uppercase tracking-wider"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                <Lock size={16} />
              </span>
              <input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-primary-forest transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 font-medium">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-4 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-md hover:shadow-primary-sage/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-[#FCFCFA]/30 border-t-[#FCFCFA] rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
                  <span>Sign In</span>
                )}
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-primary-sage/10 w-full absolute" />
          <span className="bg-[#FBFBFA] px-4 text-[10px] text-foreground/40 uppercase font-medium relative z-10">
            Or Continue With
          </span>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full py-3.5 px-4 rounded-full border border-primary-sage/25 hover:border-primary-forest bg-secondary-white/80 hover:bg-[#FCFCFA] text-foreground font-medium text-xs flex items-center justify-center gap-3 transition-colors cursor-pointer"
        >
          <img
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google"
            className="w-4 h-4"
          />
          <span>Continue with Google</span>
        </button>

        {/* Footer Links */}
        <p className="text-center text-xs text-foreground/60 mt-8 font-light">
          New to our sanctuary?{" "}
          <Link href="/signup" className="font-bold text-accent-gold hover:text-primary-forest transition-colors">
            Register For Free &rarr;
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 pb-16 flex items-center justify-center relative overflow-hidden bg-[#F8F4EC]">
        {/* Aesthetic Background Accents */}
        <div className="absolute top-20 left-0 w-80 h-80 bg-primary-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-0 w-80 h-80 bg-accent-gold/5 rounded-full blur-3xl pointer-events-none" />

        <Suspense fallback={
          <div className="text-center p-8 bg-white/60 rounded-xl border border-primary-sage/10">
            <div className="w-8 h-8 border-4 border-primary-sage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-light text-foreground">Syncing credentials provider session...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
