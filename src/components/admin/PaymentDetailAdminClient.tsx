"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  CreditCard,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  User,
  Activity,
  Terminal
} from "lucide-react";
import { PaymentStatus, PaymentProvider, PaymentMethod } from "@prisma/client";

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

interface SerializedAuditLog {
  id: string;
  action: string;
  performedBy: string;
  metadata: { reason?: string } | null;
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
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  invoices: SerializedInvoice[];
  auditLogs: SerializedAuditLog[];
}

interface PaymentDetailAdminClientProps {
  payment: SerializedPayment;
}

export default function PaymentDetailAdminClient({ payment: initialPayment }: PaymentDetailAdminClientProps) {
  const [payment, setPayment] = useState<SerializedPayment>(initialPayment);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [manualReason, setManualReason] = useState("");
  const router = useRouter();

  const invoice = payment.invoices[0];

  const refreshPaymentData = async () => {
    try {
      const res = await fetch(`/api/admin/payments/${payment.id}`);
      if (!res.ok) throw new Error("Failed to reload payment");
      const data = await res.json();
      setPayment(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (newStatus: PaymentStatus) => {
    setIsUpdating(true);
    setUpdateError("");
    
    const reasonText = manualReason.trim() || `Manual status update to ${newStatus}`;

    try {
      const res = await fetch(`/api/admin/payments/${payment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          reason: reasonText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      setManualReason("");
      await refreshPaymentData();
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred.";
      setUpdateError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "SUCCEEDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
            <CheckCircle2 size={12} />
            Succeeded
          </span>
        );
      case "PENDING":
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF8E1] text-[#7F5F00] border border-[#FFE082] animate-pulse">
            {status === "PENDING" ? "Pending" : "Processing"}
          </span>
        );
      case "FAILED":
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFEBEE] text-[#B71C1C] border border-[#FFCDD2]">
            <XCircle size={12} />
            {status === "FAILED" ? "Failed" : "Cancelled"}
          </span>
        );
      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]">
            <RefreshCcw size={12} />
            {status === "REFUNDED" ? "Refunded" : "Partially Refunded"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-foreground/10 text-foreground/70">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 border-b border-primary-sage/15 pb-5">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/payments"
            className="text-xs font-bold uppercase tracking-widest text-primary-forest hover:text-accent-gold transition-colors flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft size={14} />
            Back to Payments Board
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-2xl font-bold text-primary-forest">
              Transaction Details
            </h2>
            <span className="font-mono text-xs font-bold bg-primary-forest/5 px-2.5 py-0.5 rounded text-foreground/75">
              {payment.paymentReference}
            </span>
          </div>
        </div>
        <div>{getStatusBadge(payment.status)}</div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Transaction, Invoice, Action Panel */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Detailed Specifications */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary-sage/10 shadow-sm flex flex-col gap-4">
            <h3 className="font-serif text-lg font-bold text-primary-forest border-b border-primary-sage/10 pb-2 flex items-center gap-2">
              <CreditCard size={18} className="text-accent-gold" />
              Transaction Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Gateway Provider</span>
                <span className="font-medium text-foreground">{payment.provider}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Payment Method</span>
                <span className="font-medium text-foreground capitalize">{payment.paymentMethod.replace(/_/g, " ").toLowerCase()}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Provider Transaction ID</span>
                <span className="font-mono text-foreground">{payment.providerPaymentId || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Provider Order ID</span>
                <span className="font-mono text-foreground">{payment.providerOrderId || "N/A"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Related Billing Entity</span>
                <span className="font-medium text-foreground capitalize">{payment.relatedEntityType.replace(/_/g, " ").toLowerCase()}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Entity ID Reference</span>
                <span className="font-mono text-foreground/75 truncate">{payment.relatedEntityId}</span>
              </div>
              <div className="flex flex-col gap-0.5 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Creation Timestamp</span>
                <span className="text-foreground/80">{new Date(payment.createdAt).toString()}</span>
              </div>
            </div>
          </div>

          {/* Invoice Breakup */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary-sage/10 shadow-sm flex flex-col gap-4">
            <h3 className="font-serif text-lg font-bold text-primary-forest border-b border-primary-sage/10 pb-2 flex items-center gap-2">
              <FileText size={18} className="text-accent-gold" />
              Invoice Statement
            </h3>

            {invoice ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Invoice Number</span>
                    <span className="font-medium text-primary-forest font-bold text-sm">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Invoice Status</span>
                    <span className="font-bold text-primary-forest uppercase tracking-wider text-[10px]">{invoice.status}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Subtotal Amount</span>
                    <span className="font-medium text-foreground/80">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(invoice.subtotal)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Calculated Tax (GST/HST/PST)</span>
                    <span className="font-medium text-foreground/80">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(invoice.taxAmount)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Gross Total</span>
                    <span className="font-serif font-bold text-base text-primary-forest">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(invoice.totalAmount)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Generated Date</span>
                    <span className="text-foreground/75">
                      {new Date(invoice.generatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-foreground/50 italic p-3 bg-secondary-cream/50 rounded-xl">
                Invoice generation is pending verification.
              </div>
            )}
          </div>

          {/* Administrative Control Center */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary-sage/10 shadow-sm flex flex-col gap-5">
            <h3 className="font-serif text-lg font-bold text-primary-forest border-b border-primary-sage/10 pb-2 flex items-center gap-2">
              <Activity size={18} className="text-accent-gold" />
              Administrative Operations Console
            </h3>

            {updateError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
                <XCircle size={14} className="shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            {/* Audit log reason */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-foreground/50">
                Operational Audit Reason / Notes
              </label>
              <textarea
                placeholder="Describe why you are manually overriding this status (mandatory for audit trail)..."
                className="w-full bg-[#FCFCFA]/80 border border-primary-sage/20 rounded-xl p-3 text-xs font-light text-foreground focus:outline-none focus:border-accent-gold transition-all min-h-[70px]"
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusUpdate("SUCCEEDED")}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer disabled:opacity-40"
              >
                Mark Succeeded
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusUpdate("REFUNDED")}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer disabled:opacity-40"
              >
                Trigger Refund
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusUpdate("FAILED")}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer disabled:opacity-40"
              >
                Mark Failed
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleStatusUpdate("CANCELLED")}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all cursor-pointer disabled:opacity-40"
              >
                Mark Cancelled
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Summary & Audit Trail */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Customer Profile Directory */}
          <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col gap-4">
            <h3 className="font-serif text-base font-bold text-primary-forest border-b border-primary-sage/10 pb-2 flex items-center gap-2">
              <User size={16} className="text-accent-gold" />
              Customer Profile
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-primary-sage/20 bg-secondary-cream flex items-center justify-center shrink-0">
                {payment.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={payment.user.image} alt={payment.user.name || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-primary-sage" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden text-xs">
                <span className="font-bold text-foreground truncate">{payment.user?.name || "Anonymous Seeker"}</span>
                <span className="text-foreground/60 truncate">{payment.user?.email || "no-email@sattvic.com"}</span>
                <span className="text-[10px] text-foreground/40 mt-0.5 truncate">User ID: {payment.userId}</span>
              </div>
            </div>
          </div>

          {/* Raw JSON metadata (Audit helper) */}
          {!!payment.metadata && (
            <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col gap-3">
              <h3 className="font-serif text-sm font-bold text-primary-forest border-b border-primary-sage/10 pb-2 flex items-center gap-2">
                <Terminal size={14} className="text-accent-gold" />
                Gateway Metadata (JSON)
              </h3>
              <div className="max-h-[160px] overflow-auto rounded bg-primary-forest/5 p-3 text-[10px] font-mono text-foreground/70 leading-relaxed border border-primary-sage/10">
                <pre>{JSON.stringify(payment.metadata, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Secure Audit Trail */}
          <div className="glass-panel p-6 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col gap-4">
            <h3 className="font-serif text-base font-bold text-primary-forest border-b border-primary-sage/10 pb-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent-gold" />
              Secure Log Trails
            </h3>

            <div className="flex flex-col gap-5 pl-3 border-l border-primary-sage/20 relative">
              {payment.auditLogs.map((log) => (
                <div key={log.id} className="relative flex flex-col gap-1 text-[11px] font-light">
                  <div className="absolute -left-[18px] top-1 w-2.5 h-2.5 rounded-full bg-accent-gold border border-background" />
                  
                  <span className="font-bold text-foreground/80 uppercase tracking-wide text-[9px]">
                    {log.action}
                  </span>
                  
                  {log.metadata?.reason && (
                    <p className="text-foreground/70 italic bg-primary-forest/5 p-2 rounded leading-normal my-0.5 font-light">
                      &ldquo;{log.metadata.reason}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-1 text-[9px] text-foreground/50">
                    <span className="truncate max-w-[100px]" title={log.performedBy}>By: {log.performedBy}</span>
                    <span>
                      {new Date(log.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
