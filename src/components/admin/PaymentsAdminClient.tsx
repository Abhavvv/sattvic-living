"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Search, 
  ChevronRight, 
  FileText, 
  Plus, 
  DollarSign,
  TrendingUp,
  XCircle,
  RefreshCcw,
  CheckCircle2,
  Clock,
  Filter,
  User as UserIcon,
  X,
  Loader2
} from "lucide-react";
import { PaymentStatus, PaymentProvider, PaymentMethod } from "@prisma/client";

interface UserListItem {
  id: string;
  name: string | null;
  email: string | null;
}

interface SerializedInvoice {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: string;
  generatedAt: string;
  createdAt: string;
}

interface SerializedPayment {
  id: string;
  paymentReference: string;
  userId: string;
  provider: PaymentProvider;
  providerPaymentId: string | null;
  providerOrderId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  relatedEntityType: string;
  relatedEntityId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  invoices: SerializedInvoice[];
}

interface ReportingStats {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  totalRevenue: number;
}

interface PaymentsAdminClientProps {
  initialPayments: SerializedPayment[];
  initialStats: ReportingStats;
  users: UserListItem[];
}

export default function PaymentsAdminClient({ 
  initialPayments, 
  initialStats, 
  users 
}: PaymentsAdminClientProps) {
  const [payments, setPayments] = useState<SerializedPayment[]>(initialPayments);
  const [stats, setStats] = useState<ReportingStats>(initialStats);
  const [pagination, setPagination] = useState({
    total: initialStats.totalPayments,
    page: 1,
    limit: 10,
    totalPages: Math.ceil(initialStats.totalPayments / 10),
  });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [providerFilter, setProviderFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Manual payment form state
  const [manualUserId, setManualUserId] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [manualMethod, setManualMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [manualEntityType, setManualEntityType] = useState("YOGA_BOOKING");
  const [manualEntityId, setManualEntityId] = useState("");
  const [manualStatus, setManualStatus] = useState<PaymentStatus>("SUCCEEDED");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch filtered payments from API
  const fetchFilteredPayments = useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append("search", searchTerm);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (providerFilter !== "ALL") params.append("provider", providerFilter);
      if (startDate) params.append("startDate", new Date(startDate).toISOString());
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.append("endDate", end.toISOString());
      }
      params.append("page", String(targetPage));
      params.append("limit", "10");

      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch payments data");
      
      const data = await res.json();
      setPayments(data.payments);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter, providerFilter, startDate, endDate]);

  // Trigger search on filter changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFilteredPayments(1);
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [fetchFilteredPayments]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchFilteredPayments(newPage);
    }
  };

  // Submit manual payment
  const handleCreateManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    if (!manualUserId) {
      setErrorMsg("Please select a user.");
      setIsSubmitting(false);
      return;
    }
    if (!manualAmount || parseFloat(manualAmount) <= 0) {
      setErrorMsg("Please enter a valid positive amount.");
      setIsSubmitting(false);
      return;
    }
    if (!manualEntityId.trim()) {
      setErrorMsg("Please enter a related entity reference ID.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: manualUserId,
          amount: parseFloat(manualAmount),
          paymentMethod: manualMethod,
          relatedEntityType: manualEntityType,
          relatedEntityId: manualEntityId,
          status: manualStatus,
          provider: "MANUAL",
        }),
      });

      const data = await res.ok ? await res.json() : null;

      if (!res.ok) {
        throw new Error(data?.error || "Failed to log manual payment.");
      }

      setIsModalOpen(false);
      // Reset form
      setManualUserId("");
      setManualAmount("");
      setManualEntityId("");
      
      // Refresh list
      fetchFilteredPayments(1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred.";
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "SUCCEEDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
            Succeeded
          </span>
        );
      case "PENDING":
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8E1] text-[#7F5F00] border border-[#FFE082] animate-pulse">
            {status === "PENDING" ? "Pending" : "Processing"}
          </span>
        );
      case "FAILED":
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBEE] text-[#B71C1C] border border-[#FFCDD2]">
            {status === "FAILED" ? "Failed" : "Cancelled"}
          </span>
        );
      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]">
            {status === "REFUNDED" ? "Refunded" : "Partially"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-foreground/10 text-foreground/70">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header and Add Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-primary-sage/15 pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
            <TrendingUp size={12} />
            Administrative Finance Panel
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest leading-tight">
            Financial Sanctuary Control
          </h1>
          <p className="text-sm text-foreground/75 font-light max-w-2xl">
            Monitor system revenue stream aggregates, run micro-filtered audit searches, verify client statements, and log offline manual registrations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-6 py-3.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm flex items-center justify-center gap-2 w-fit"
        >
          <Plus size={16} />
          Log Manual Payment
        </button>
      </div>

      {/* Reporting Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent-gold/5 rounded-full blur-lg" />
          <div className="w-12 h-12 bg-accent-gold/10 text-accent-gold rounded-xl flex items-center justify-center border border-accent-gold/20 shrink-0">
            <DollarSign size={22} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">Total Revenue</span>
            <span className="text-2xl font-bold text-primary-forest">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(stats.totalRevenue)}
            </span>
          </div>
        </div>

        {/* Successful Payments */}
        <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-lg" />
          <div className="w-12 h-12 bg-green-500/10 text-green-700 rounded-xl flex items-center justify-center border border-green-500/20 shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">Successful Transactions</span>
            <span className="text-2xl font-bold text-primary-forest">{stats.successfulPayments}</span>
          </div>
        </div>

        {/* Pending / Processing */}
        <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-lg" />
          <div className="w-12 h-12 bg-yellow-500/10 text-yellow-700 rounded-xl flex items-center justify-center border border-yellow-500/20 shrink-0">
            <Clock size={22} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">Total Operations</span>
            <span className="text-2xl font-bold text-primary-forest">{stats.totalPayments}</span>
          </div>
        </div>

        {/* Refunded Count */}
        <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-lg" />
          <div className="w-12 h-12 bg-blue-500/10 text-blue-700 rounded-xl flex items-center justify-center border border-blue-500/20 shrink-0">
            <RefreshCcw size={22} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">Refunded Payments</span>
            <span className="text-2xl font-bold text-primary-forest">{stats.refundedPayments}</span>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="glass-panel p-5 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary-forest uppercase tracking-wider pb-2 border-b border-primary-sage/10">
          <Filter size={14} className="text-primary-sage" />
          Filter & Search Console
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Text Search */}
          <div className="relative lg:col-span-2">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-sage" />
            <input
              type="text"
              placeholder="Search Ref, Invoice #, User Email, Name..."
              className="w-full pl-11 pr-4 py-2 bg-[#FCFCFA] rounded-xl border border-primary-sage/20 focus:outline-none focus:border-accent-gold transition-all text-xs font-light text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status */}
          <select
            className="w-full bg-[#FCFCFA] border border-primary-sage/20 rounded-xl px-3 py-2 text-xs font-light text-foreground focus:outline-none focus:border-accent-gold transition-all cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Provider */}
          <select
            className="w-full bg-[#FCFCFA] border border-primary-sage/20 rounded-xl px-3 py-2 text-xs font-light text-foreground focus:outline-none focus:border-accent-gold transition-all cursor-pointer"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
          >
            <option value="ALL">All Providers</option>
            <option value="STRIPE">Stripe</option>
            <option value="PAYPAL">PayPal</option>
            <option value="APPLE_PAY">Apple Pay</option>
            <option value="GOOGLE_PAY">Google Pay</option>
            <option value="MANUAL">Manual Offline</option>
          </select>

          {/* Date range pickers */}
          <div className="flex gap-2 items-center sm:col-span-2 lg:col-span-1">
            <input
              type="date"
              className="w-full bg-[#FCFCFA] border border-primary-sage/20 rounded-xl px-3 py-1.5 text-[11px] font-light text-foreground focus:outline-none focus:border-accent-gold transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
            <span className="text-foreground/40 text-xs">to</span>
            <input
              type="date"
              className="w-full bg-[#FCFCFA] border border-primary-sage/20 rounded-xl px-3 py-1.5 text-[11px] font-light text-foreground focus:outline-none focus:border-accent-gold transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-primary-sage/10 shadow-sm bg-white/40 backdrop-blur-md relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={32} className="animate-spin text-primary-forest" />
              <span className="text-xs font-medium text-primary-forest">Loading payments database...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary-forest/5 text-primary-forest font-serif border-b border-primary-sage/10 text-xs uppercase tracking-widest">
                <th className="py-4 px-6 font-bold">Reference / Invoice</th>
                <th className="py-4 px-6 font-bold">Customer Directory</th>
                <th className="py-4 px-6 font-bold">Billing Scope</th>
                <th className="py-4 px-6 font-bold">Gateway & Method</th>
                <th className="py-4 px-6 font-bold">Execution Date</th>
                <th className="py-4 px-6 font-bold">Status</th>
                <th className="py-4 px-6 font-bold text-right">Amount</th>
                <th className="py-4 px-6 font-bold text-center">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-sage/10 text-xs font-light text-foreground/80">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-foreground/50 italic">
                    No matching payment histories registered in system.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-primary-forest/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-bold text-primary-forest text-xs">{p.paymentReference}</span>
                        {p.invoices[0] ? (
                          <span className="inline-flex items-center gap-0.5 text-foreground/50 text-[10px]">
                            <FileText size={10} className="text-primary-sage" />
                            {p.invoices[0].invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-foreground/30 italic text-[9px]">No Invoice</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{p.user?.name || "Anonymous Seeker"}</span>
                        <span className="text-[10px] text-foreground/50 truncate max-w-[140px]">{p.user?.email || "no-email@sattvic.com"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 capitalize">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{p.relatedEntityType.replace(/_/g, " ").toLowerCase()}</span>
                        <span className="text-[9px] text-foreground/40 truncate max-w-[80px]">ID: {p.relatedEntityId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium">{p.provider === "MANUAL" ? "Manual Registry" : p.provider}</span>
                        <span className="text-[10px] text-foreground/50 capitalize">{p.paymentMethod.replace(/_/g, " ").toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      {new Date(p.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="py-4 px-6 font-bold text-right text-primary-forest">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: p.currency }).format(p.amount)}
                    </td>
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <Link
                        href={`/admin/payments/${p.id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-forest border border-primary-sage/20 hover:bg-primary-forest/5 rounded-full transition-all duration-300"
                      >
                        Details
                        <ChevronRight size={10} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-primary-sage/10 text-xs">
            <span className="text-foreground/60">
              Showing page <b>{pagination.page}</b> of <b>{pagination.totalPages}</b> (Total {pagination.total} records)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 border border-primary-sage/25 rounded-md hover:bg-primary-forest/5 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1.5 border border-primary-sage/25 rounded-md hover:bg-primary-forest/5 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-primary-sage/15 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header banner */}
            <div className="gold-gradient h-1.5 w-full" />
            <div className="p-6 border-b border-primary-sage/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-accent-gold" />
                <h3 className="font-serif text-lg font-bold text-primary-forest">Log Manual Offline Payment</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-foreground/50 hover:text-foreground hover:bg-primary-forest/5 p-1 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleCreateManualPayment} className="p-6 overflow-y-auto flex flex-col gap-4">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                  <XCircle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* User Dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-foreground/50 flex items-center gap-1">
                  <UserIcon size={10} />
                  Select System User
                </label>
                <select
                  required
                  className="w-full bg-[#FCFCFA]/80 border border-primary-sage/20 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent-gold transition-all cursor-pointer"
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || "Unnamed"} ({u.email || "No email"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">
                  Payment Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary-sage">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 bg-[#FCFCFA]/80 border border-primary-sage/20 rounded-xl focus:outline-none focus:border-accent-gold transition-all text-xs text-foreground"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Method & Status Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">
                    Payment Method
                  </label>
                  <select
                    className="w-full bg-[#FCFCFA]/80 border border-primary-sage/20 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent-gold transition-all cursor-pointer"
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value as PaymentMethod)}
                  >
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Credit Card (External)</option>
                    <option value="PAYPAL">PayPal (External)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">
                    Payment Status
                  </label>
                  <select
                    className="w-full bg-[#FCFCFA]/80 border border-primary-sage/20 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent-gold transition-all cursor-pointer"
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value as PaymentStatus)}
                  >
                    <option value="SUCCEEDED">Succeeded</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>

              {/* Related Entity Scope */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">
                    Related Entity Type
                  </label>
                  <select
                    className="w-full bg-[#FCFCFA]/80 border border-primary-sage/20 rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent-gold transition-all cursor-pointer"
                    value={manualEntityType}
                    onChange={(e) => setManualEntityType(e.target.value)}
                  >
                    <option value="YOGA_BOOKING">Yoga Course Booking</option>
                    <option value="MEAL_ORDER">Meal Plan Order</option>
                    <option value="MANUAL_ENROLL">Manual Enrollment</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">
                    Entity Reference ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. session-cuid-123"
                    className="w-full px-4 py-2.5 bg-[#FCFCFA]/80 border border-primary-sage/20 rounded-xl focus:outline-none focus:border-accent-gold transition-all text-xs text-foreground"
                    value={manualEntityId}
                    onChange={(e) => setManualEntityId(e.target.value)}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary-sage/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-forest hover:bg-primary-forest/5 rounded-full border border-primary-sage/20 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#FCFCFA] rounded-full bg-primary-forest hover:bg-primary-sage disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer animate-organic"
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  Register Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
