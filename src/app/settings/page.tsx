"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Shield,
  Link as LinkIcon,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Info,
  Clock,
  Laptop
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Schema for changing password
const passwordPolicy = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const changePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: passwordPolicy,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

// Schema for account deletion
const deleteAccountSchema = z.object({
  password: z.string().optional(),
  confirm1: z.literal(true, {
    message: "You must confirm the permanent consequences.",
  }),
  confirm2: z.literal(true, {
    message: "You must check the data deletion consent.",
  }),
});

type DeleteAccountFormValues = z.infer<typeof deleteAccountSchema>;

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"security" | "accounts" | "session" | "danger">("security");

  // State indicators
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  // Form hooks
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    formState: { errors: deleteErrors },
  } = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { password: "" },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#F8F4EC] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-8 h-8 border-4 border-primary-sage border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-light text-[#2D3E35] opacity-80">Opening settings vault...</p>
        </div>
      </div>
    );
  }

  // Submit Password Change
  const onChangePassword = async (data: ChangePasswordFormValues) => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update password.");
      }

      setPasswordSuccess(result.message || "Password updated successfully.");
      resetPasswordForm();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setPasswordError(errMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Submit Account Deletion
  const onDeleteAccount = async (data: DeleteAccountFormValues) => {
    setDeleteError(null);
    setDeleteSuccess(null);
    setIsDeletingAccount(true);

    try {
      const response = await fetch("/api/settings/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: data.password,
          confirmDeletion: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account.");
      }

      setDeleteSuccess("Your profile is deleted. Exiting session...");
      
      // Expunge cookies and push user to home page
      setTimeout(async () => {
        await signOut({ callbackUrl: "/" });
      }, 2000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setDeleteError(errMsg);
      setIsDeletingAccount(false);
    }
  };

  const tabs = [
    { id: "security", label: "Password & Security", icon: <Lock size={16} /> },
    { id: "accounts", label: "Connected Accounts", icon: <LinkIcon size={16} /> },
    { id: "session", label: "Active Session", icon: <Shield size={16} /> },
    { id: "danger", label: "Danger Zone", icon: <Trash2 size={16} /> },
  ] as const;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F4EC] pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col gap-2 border-b border-primary-sage/15 pb-6">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
              <Shield size={12} className="text-accent-gold" />
              Settings
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest leading-tight">
              Account Management
            </h1>
            <p className="text-sm text-foreground/75 font-light">
              Configure credentials, review connected networks, manage device sessions, and maintain account integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar navigation */}
            <div className="md:col-span-4 flex flex-col gap-2 bg-[#FCFCFA]/80 border border-primary-sage/10 p-4 rounded-2xl shadow-sm">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-organic cursor-pointer ${
                      isActive
                        ? "bg-primary-forest text-[#FCFCFA] shadow-sm"
                        : "text-foreground/80 hover:bg-primary-sage/10 hover:text-primary-forest"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Config workspace */}
            <div className="md:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="glass-panel p-6 sm:p-8 rounded-2xl shadow-sm border border-primary-sage/10 min-h-[300px]"
                >
                  
                  {/* Password Modification Panel */}
                  {activeTab === "security" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h2 className="font-serif text-xl font-bold text-primary-forest mb-1">
                          Change Password
                        </h2>
                        <p className="text-xs text-foreground/70 font-light">
                          Enforce password protection. Credentials will be updated globally.
                        </p>
                      </div>

                      {passwordSuccess && (
                        <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-xs flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                          <span>{passwordSuccess}</span>
                        </div>
                      )}

                      {passwordError && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs flex items-center gap-2">
                          <XCircle size={16} className="text-red-500 shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}

                      <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
                        {/* Current Password */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                            Current Password
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                              <Lock size={14} />
                            </span>
                            <input
                              {...registerPassword("currentPassword")}
                              type={showCurrentPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-primary-forest"
                            >
                              {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <span className="text-[10px] text-foreground/40">
                            Leave blank if you registered via Google OAuth and have no current password.
                          </span>
                        </div>

                        {/* New Password */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                            New Password
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                              <Lock size={14} />
                            </span>
                            <input
                              {...registerPassword("newPassword")}
                              type={showNewPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-primary-forest"
                            >
                              {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          {passwordErrors.newPassword && (
                            <span className="text-[10px] text-red-500 font-medium">{passwordErrors.newPassword.message}</span>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                              <Lock size={14} />
                            </span>
                            <input
                              {...registerPassword("confirmPassword")}
                              type="password"
                              placeholder="••••••••"
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none"
                            />
                          </div>
                          {passwordErrors.confirmPassword && (
                            <span className="text-[10px] text-red-500 font-medium">{passwordErrors.confirmPassword.message}</span>
                          )}
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-6 py-3 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <span>Change Password</span>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Connected Accounts Panel */}
                  {activeTab === "accounts" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h2 className="font-serif text-xl font-bold text-primary-forest mb-1">
                          Connected Accounts
                        </h2>
                        <p className="text-xs text-foreground/70 font-light">
                          Manage third-party login linkages (OAuth social integrations).
                        </p>
                      </div>

                      <div className="border border-primary-sage/10 rounded-xl p-5 bg-[#FCFCFA]/80 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full border border-primary-sage/25 bg-secondary-white flex items-center justify-center">
                            <img
                              src="https://authjs.dev/img/providers/google.svg"
                              alt="Google"
                              className="w-5 h-5"
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-primary-forest">Google OAuth Provider</span>
                            <span className="text-xs text-foreground/60">{session?.user?.email}</span>
                          </div>
                        </div>

                        <span className="text-[10px] uppercase font-bold tracking-wider badge-sage px-3 py-1 rounded-full">
                          Connected
                        </span>
                      </div>

                      <div className="p-4 bg-primary-sage/10 border-l-4 border-primary-sage rounded text-primary-forest text-xs flex items-start gap-2.5">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        <span>
                          Account merging is enabled. Logging in using Google OAuth matches your email address automatically and links to your profile.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Active Sessions Panel */}
                  {activeTab === "session" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h2 className="font-serif text-xl font-bold text-primary-forest mb-1">
                          Active Session
                        </h2>
                        <p className="text-xs text-foreground/70 font-light">
                          Monitor token scopes assigned to your current browser window.
                        </p>
                      </div>

                      <div className="border border-primary-sage/10 rounded-xl p-5 bg-[#FCFCFA]/80 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary-sage/10 text-primary-forest flex items-center justify-center">
                            <Laptop size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-primary-forest">Current Device Session</span>
                            <span className="text-[10px] text-foreground/50 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                              Active Token State
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-primary-sage/10 pt-4 grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="block text-foreground/50 font-medium">Session Type:</span>
                            <span className="font-semibold text-primary-forest">JSON Web Token (JWT)</span>
                          </div>
                          <div>
                            <span className="block text-foreground/50 font-medium flex items-center gap-1">
                              <Clock size={12} /> Expiration Scope:
                            </span>
                            <span className="font-semibold text-primary-forest">30 Days (Rolling renewal)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Danger Zone Panel (Account Deletion) */}
                  {activeTab === "danger" && (
                    <div className="flex flex-col gap-6">
                      <div>
                        <h2 className="font-serif text-xl font-bold text-red-700 mb-1 flex items-center gap-2">
                          <AlertTriangle size={20} />
                          Danger Zone
                        </h2>
                        <p className="text-xs text-foreground/70 font-light">
                          Permanently delete your account. This action is destructive and irreversible.
                        </p>
                      </div>

                      {deleteSuccess && (
                        <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded text-green-700 text-xs flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                          <span>{deleteSuccess}</span>
                        </div>
                      )}

                      {deleteError && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs flex items-center gap-2">
                          <XCircle size={16} className="text-red-500 shrink-0" />
                          <span>{deleteError}</span>
                        </div>
                      )}

                      <form onSubmit={handleDeleteSubmit(onDeleteAccount)} className="space-y-5">
                        
                        {/* Warnings */}
                        <div className="bg-red-50/50 border border-red-200/50 rounded-xl p-4 space-y-3">
                          <span className="text-xs font-bold text-red-800 uppercase tracking-wide block">
                            Please read carefully:
                          </span>
                          <div className="flex flex-col gap-2 text-xs text-red-700/90 font-light leading-relaxed">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                {...registerDelete("confirm1")}
                                type="checkbox"
                                className="mt-0.5 shrink-0 accent-red-700"
                              />
                              <span>I understand that all of my structural yoga booking histories, organic meal plans, saved articles, and settings will be permanently destroyed.</span>
                            </label>
                            {deleteErrors.confirm1 && (
                              <span className="text-[10px] text-red-600 font-medium pl-6">{deleteErrors.confirm1.message}</span>
                            )}

                            <label className="flex items-start gap-3 cursor-pointer">
                              <input
                                {...registerDelete("confirm2")}
                                type="checkbox"
                                className="mt-0.5 shrink-0 accent-red-700"
                              />
                              <span>I understand that this action is permanent, and my credentials can never be recovered or reactivated under this email address.</span>
                            </label>
                            {deleteErrors.confirm2 && (
                              <span className="text-[10px] text-red-600 font-medium pl-6">{deleteErrors.confirm2.message}</span>
                            )}
                          </div>
                        </div>

                        {/* Password Confirmation */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-primary-forest">
                            Re-authenticate Password
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-foreground/40">
                              <Lock size={14} />
                            </span>
                            <input
                              {...registerDelete("password")}
                              type={showDeletePassword ? "text" : "password"}
                              placeholder="••••••••"
                              disabled={isDeletingAccount || !!deleteSuccess}
                              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-primary-sage/20 bg-secondary-white/60 text-sm focus:outline-none disabled:opacity-50"
                            />
                            <button
                              type="button"
                              onClick={() => setShowDeletePassword(!showDeletePassword)}
                              disabled={isDeletingAccount || !!deleteSuccess}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-foreground/40 hover:text-primary-forest disabled:opacity-50"
                            >
                              {showDeletePassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <span className="text-[10px] text-foreground/40">
                            Required to authenticate authorization. Google OAuth-only users can leave this field blank.
                          </span>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="submit"
                          disabled={isDeletingAccount || !!deleteSuccess}
                          className="w-full text-xs font-bold uppercase tracking-widest text-[#FCFCFA] py-4 rounded-full bg-red-700 hover:bg-red-800 transition-all duration-300 shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isDeletingAccount ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Permanently Expunging Account...</span>
                            </>
                          ) : (
                            <span>Delete My Account Permanently</span>
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
