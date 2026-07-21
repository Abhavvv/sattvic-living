"use client";

import React from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Printer, 
  Calendar, 
  ShieldCheck, 
  Info,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCcw,
  Sparkles,
  Wallet,
  Landmark,
  Coins
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
  createdAt: string;
}

interface SerializedPayment {
  id: string;
  paymentReference: string;
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
  invoices: SerializedInvoice[];
  auditLogs: SerializedAuditLog[];
}

interface PaymentDetailClientProps {
  payment: SerializedPayment;
}

export default function PaymentDetailClient({ payment }: PaymentDetailClientProps) {
  const invoice = payment.invoices[0];

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF8E1] text-[#7F5F00] border border-[#FFE082]">
            <Clock size={12} className="animate-pulse" />
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

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case "CARD":
        return <CreditCard size={14} className="text-primary-sage" />;
      case "BANK_TRANSFER":
        return <Landmark size={14} className="text-primary-sage" />;
      case "PAYPAL":
      case "APPLE_PAY":
      case "GOOGLE_PAY":
        return <Wallet size={14} className="text-primary-sage" />;
      default:
        return <Coins size={14} className="text-primary-sage" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Human-readable audit actions
  const getFriendlyAction = (action: string) => {
    switch (action) {
      case "PAYMENT_CREATED": return "Transaction initiated in platform database";
      case "STATUS_UPDATED": return "Payment processing completed / status updated";
      case "INVOICE_GENERATED": return "Tax invoice generated & registered";
      default: return action.replace(/_/g, " ").toLowerCase();
    }
  };

  return (
    <div className="flex flex-col gap-6 print:p-0 print:bg-white">
      {/* Back Button & Actions (Hidden on Print) */}
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          href="/dashboard/payments"
          className="text-xs font-bold uppercase tracking-widest text-primary-forest hover:text-accent-gold transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          Back to Payments
        </Link>
        
        <button
          onClick={handlePrint}
          className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-5 py-2.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm flex items-center gap-2"
        >
          <Printer size={14} />
          Print Receipt
        </button>
      </div>

      {/* Main Print container */}
      <div className="flex flex-col gap-6 print:text-black">
        {/* receipt layout */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-primary-sage/10 shadow-sm relative overflow-hidden bg-white/60 backdrop-blur-lg print:border-none print:shadow-none print:bg-transparent print:p-0">
          
          {/* Top aesthetic accent (hidden on print) */}
          <div className="absolute top-0 left-0 right-0 h-1.5 gold-gradient print:hidden" />

          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-primary-sage/15 pb-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5 print:hidden">
                <Sparkles size={12} />
                Sattvic Receipt
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary-forest print:text-black">
                Sattvic Living
              </h2>
              <p className="text-xs text-foreground/60 font-light leading-relaxed">
                Nourishment & Yoga Sanctuary<br />
                Vedic Wellness Center & Shala<br />
                support@sattvicliving.com
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-1.5 text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Transaction ID</span>
              <span className="font-mono text-xs font-bold text-primary-forest bg-primary-forest/5 px-3 py-1 rounded-md print:bg-transparent print:px-0 print:text-black">
                {payment.paymentReference}
              </span>
              <span className="text-xs text-foreground/50">
                Created: {new Date(payment.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          </div>

          {/* Invoice Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-primary-sage/15">
            {/* Bill To */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-primary-forest/80 print:text-black">
                Transaction Details
              </h4>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs font-light">
                <span className="text-foreground/50">Payment Gateway:</span>
                <span className="font-medium text-foreground/80">{payment.provider}</span>

                <span className="text-foreground/50">Payment Method:</span>
                <span className="font-medium text-foreground/80 flex items-center gap-1">
                  {getPaymentMethodIcon(payment.paymentMethod)}
                  <span className="capitalize">{payment.paymentMethod.replace("_", " ").toLowerCase()}</span>
                </span>

                <span className="text-foreground/50">Related Entity:</span>
                <span className="font-medium text-foreground/80 capitalize">
                  {payment.relatedEntityType.replace(/_/g, " ").toLowerCase()}
                </span>

                <span className="text-foreground/50">Reference ID:</span>
                <span className="font-mono text-[10px] text-foreground/60 truncate" title={payment.relatedEntityId}>
                  {payment.relatedEntityId}
                </span>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-primary-forest/80 print:text-black">
                Invoice Breakdown
              </h4>
              {invoice ? (
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 text-xs font-light">
                  <span className="text-foreground/50">Invoice Number:</span>
                  <span className="font-medium text-primary-forest font-bold print:text-black">{invoice.invoiceNumber}</span>

                  <span className="text-foreground/50">Subtotal:</span>
                  <span className="font-medium text-foreground/80">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(invoice.subtotal)}
                  </span>

                  <span className="text-foreground/50 flex items-center gap-1">
                    Tax Amount:
                    <span className="group relative cursor-pointer print:hidden">
                      <Info size={10} className="text-primary-sage" />
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-foreground text-background text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 leading-normal">
                        Pre-configured for regional GST/HST/PST calculations based on billing location.
                      </span>
                    </span>
                  </span>
                  <span className="font-medium text-foreground/80">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(invoice.taxAmount)}
                  </span>

                  <span className="text-foreground/50">Invoice Status:</span>
                  <span className="font-bold text-primary-forest uppercase tracking-wider text-[10px] print:text-black">
                    {invoice.status}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-foreground/50 italic p-3 bg-secondary-cream/50 rounded-xl">
                  <Clock size={14} className="text-primary-sage shrink-0" />
                  Invoice is currently pending completion of payment verification.
                </div>
              )}
            </div>
          </div>

          {/* Amount Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-foreground/40">Status</span>
              <div className="w-fit">{getStatusBadge(payment.status)}</div>
            </div>
            
            <div className="flex items-baseline gap-2 sm:text-right">
              <span className="text-xs font-light text-foreground/50">Total Paid Amount:</span>
              <span className="font-serif text-3xl font-bold text-primary-forest print:text-black">
                {new Intl.NumberFormat("en-US", { style: "currency", currency: payment.currency }).format(payment.amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Audit Timeline Section (Hidden on Print) */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-primary-sage/10 shadow-sm flex flex-col gap-6 print:hidden">
          <h3 className="font-serif text-lg font-bold text-primary-forest border-b border-primary-sage/10 pb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-accent-gold" />
            Secure Audit Trail
          </h3>

          <div className="flex flex-col gap-6 pl-4 border-l border-primary-sage/20 relative">
            {payment.auditLogs.map((log) => (
              <div key={log.id} className="relative flex flex-col gap-1">
                {/* Timeline node icon */}
                <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border border-primary-sage bg-[#F8F4EC] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="font-medium text-foreground/80 capitalize">
                    {getFriendlyAction(log.action)}
                  </span>
                  <span className="text-[10px] text-foreground/50 font-light flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(log.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
