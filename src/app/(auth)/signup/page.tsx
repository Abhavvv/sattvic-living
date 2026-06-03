"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [devWarning, setDevWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setError(null);
    setDevWarning(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      setSuccess(true);
      if (result.warning) {
        setDevWarning(result.warning);
        setTimeout(() => {
          router.push(`/login?registered=true&warning=${encodeURIComponent(result.warning)}`);
        }, 6000);
      } else {
        setTimeout(() => {
          router.push("/login?registered=true");
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error(err);
      setError("Google authentication failed. Please try again.");
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
                <Sparkles size={10} className="text-accent-gold" />
                Join Our Sanctuary
              </span>
              <h1 className="font-serif text-3xl font-bold text-primary-forest leading-tight">
                Create Your Account
              </h1>
              <p className="text-xs text-foreground/75 font-light">
                Embark on a sacred journey of structural yoga, Ayurvedic wisdom, and organic living.
              </p>
            </div>

            {/* Error and Success Banners */}
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
                <span>Namaste. Your account has been created. Redirecting to login...</span>
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
              {/* Full Name */}
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
                    placeholder="ananya@sattvicliving.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic"
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] text-red-500 font-medium">{errors.email.message}</span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                  Password
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

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                  Confirm Password
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
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none transition-organic"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-primary-forest transition-colors focus:outline-none"
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
                disabled={isSubmitting || success}
                className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-4 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-md hover:shadow-primary-sage/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#FCFCFA]/30 border-t-[#FCFCFA] rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register Account</span>
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

            {/* Google Signup Button */}
            <button
              onClick={handleGoogleSignup}
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
              Already walking the path?{" "}
              <Link href="/login" className="font-bold text-accent-gold hover:text-primary-forest transition-colors">
                Sign In Instead &rarr;
              </Link>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
