"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Search, 
  ChevronRight, 
  FileText, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCcw,
  Sparkles,
  ArrowRight,
  Filter
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
  invoices: SerializedInvoice[];
}

interface PaymentsClientProps {
  initialPayments: SerializedPayment[];
}

export default function PaymentsClient({ initialPayments }: PaymentsClientProps) {
  const payments = initialPayments;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filter logic
  const filteredPayments = payments.filter((p) => {
    const matchesSearch = 
      p.paymentReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.invoices[0]?.invoiceNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.relatedEntityType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="flex flex-col gap-8">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary-sage">
          <Link href="/dashboard" className="hover:text-primary-forest transition-colors">Dashboard</Link>
          <ChevronRight size={10} />
          <span className="text-foreground/60">Payments</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-primary-sage/15 pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-widest text-accent-gold font-bold flex items-center gap-1.5">
              <Sparkles size={12} className="text-accent-gold" />
              Financial Records
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-forest leading-tight">
              Transaction Sanctuary
            </h1>
            <p className="text-sm text-foreground/75 font-light max-w-2xl">
              Track all your completed yoga sessions and meal plan payments. Access your invoices and monitor transaction timelines securely.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-bold uppercase tracking-widest text-primary-forest border border-primary-sage/35 hover:bg-primary-forest/5 px-5 py-2.5 rounded-full transition-all duration-300 flex items-center gap-1.5 w-fit"
          >
            <ArrowLeft size={12} />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-primary-sage/10 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-sage" />
          <input
            type="text"
            placeholder="Search by Payment Reference or Invoice Number..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#FCFCFA]/80 rounded-xl border border-primary-sage/20 focus:outline-none focus:border-accent-gold transition-all text-sm font-light text-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <Filter size={14} className="text-primary-sage shrink-0" />
          <select
            className="w-full md:w-48 bg-[#FCFCFA]/80 border border-primary-sage/20 rounded-xl px-3 py-2.5 text-sm font-light text-foreground focus:outline-none focus:border-accent-gold transition-all cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCEEDED">Succeeded</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Table/Grid */}
      {filteredPayments.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl border border-primary-sage/10 shadow-sm text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-secondary-cream flex items-center justify-center rounded-full text-primary-sage border border-primary-sage/10">
            <CreditCard size={28} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-serif text-xl font-bold text-primary-forest">No transactions found</h3>
            <p className="text-xs text-foreground/60 max-w-sm mx-auto font-light leading-relaxed">
              We couldn&apos;t find any payment history matching your criteria. Explore yoga sessions or meals to get started!
            </p>
          </div>
          <Link
            href="/yoga-classes"
            className="text-xs font-bold uppercase tracking-widest text-[#FCFCFA] px-6 py-3 rounded-full bg-primary-forest hover:bg-primary-sage transition-all duration-300 shadow-sm flex items-center gap-2 mt-2"
          >
            Explore Yoga Classes
            <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-primary-sage/10 shadow-sm bg-white/40 backdrop-blur-md">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary-forest/5 text-primary-forest font-serif border-b border-primary-sage/10 text-xs uppercase tracking-widest">
                  <th className="py-4 px-6 font-bold">Payment Reference</th>
                  <th className="py-4 px-6 font-bold">Related Entity</th>
                  <th className="py-4 px-6 font-bold">Invoice Number</th>
                  <th className="py-4 px-6 font-bold">Date</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Amount</th>
                  <th className="py-4 px-6 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-sage/10 text-sm font-light text-foreground/80">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-primary-forest/[0.02] transition-colors">
                    <td className="py-4 px-6 font-medium text-primary-forest truncate max-w-[180px]">
                      {p.paymentReference}
                    </td>
                    <td className="py-4 px-6 capitalize">
                      <div className="flex flex-col">
                        <span className="font-medium">{p.relatedEntityType.replace("_", " ")}</span>
                        <span className="text-[10px] text-foreground/50 truncate max-w-[120px]">ID: {p.relatedEntityId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {p.invoices[0] ? (
                        <span className="inline-flex items-center gap-1 text-primary-forest hover:text-accent-gold transition-colors font-medium">
                          <FileText size={12} className="text-primary-sage shrink-0" />
                          {p.invoices[0].invoiceNumber}
                        </span>
                      ) : (
                        <span className="text-foreground/40 italic text-xs">No Invoice</span>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-xs">
                      {new Date(p.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="py-4 px-6 font-bold text-right text-primary-forest">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: p.currency }).format(p.amount)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/dashboard/payments/${p.id}`}
                        className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-forest border border-primary-sage/20 hover:bg-primary-forest/5 rounded-full transition-all duration-300"
                      >
                        Details
                        <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="grid grid-cols-1 divide-y divide-primary-sage/10 md:hidden">
            {filteredPayments.map((p) => (
              <div key={p.id} className="p-5 flex flex-col gap-4 hover:bg-primary-forest/[0.01]">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-primary-sage">Reference</span>
                    <span className="font-serif font-bold text-primary-forest text-sm">{p.paymentReference}</span>
                  </div>
                  <span className="text-base font-bold text-primary-forest">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: p.currency }).format(p.amount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Entity</span>
                    <span className="capitalize font-medium text-foreground/80">{p.relatedEntityType.replace("_", " ")}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Date</span>
                    <span className="text-foreground/80">
                      {new Date(p.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 col-span-2">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Invoice</span>
                    {p.invoices[0] ? (
                      <span className="inline-flex items-center gap-1 font-medium text-primary-forest">
                        <FileText size={12} className="text-primary-sage" />
                        {p.invoices[0].invoiceNumber}
                      </span>
                    ) : (
                      <span className="text-foreground/40 italic">No Invoice</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-primary-sage/5">
                  {getStatusBadge(p.status)}
                  <Link
                    href={`/dashboard/payments/${p.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-forest border border-primary-sage/20 hover:bg-primary-forest/5 rounded-full transition-all"
                  >
                    Details
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
