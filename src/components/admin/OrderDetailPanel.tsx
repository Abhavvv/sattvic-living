"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, MapPin, Calendar, MessageSquare, ClipboardList, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";

interface UserInfo {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Meal {
  id: string;
  name: string;
  image: string | null;
}

interface MealOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  meal: Meal;
}

interface MealOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  deliveryDate: string;
  deliveryNotes: string | null;
  addressSnapshot: string;
  phoneSnapshot: string;
  createdAt: string;
  user: UserInfo;
  items: MealOrderItem[];
}

interface OrderDetailPanelProps {
  initialOrder: MealOrder;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending Approval",
  CONFIRMED: "Confirmed",
  PREPARING: "Kitchen Prep",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function OrderDetailPanel({ initialOrder }: OrderDetailPanelProps) {
  const router = useRouter();
  const [order, setOrder] = useState<MealOrder>(initialOrder);
  const [status, setStatus] = useState<MealOrder["status"]>(initialOrder.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isFinalState = order.status === "DELIVERED" || order.status === "CANCELLED";

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === order.status) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status.");
      }

      setOrder(data.order);
      setSuccess(`Fulfillment status updated to "${STATUS_LABELS[status]}" successfully.`);
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "An unexpected error occurred.");
      setStatus(order.status); // Rollback locally
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeStyle = (orderStatus: string) => {
    switch (orderStatus) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-700 border border-amber-500/20";
      case "CONFIRMED":
        return "bg-blue-500/10 text-blue-700 border border-blue-500/20";
      case "PREPARING":
        return "bg-purple-500/10 text-purple-700 border border-purple-500/20";
      case "OUT_FOR_DELIVERY":
        return "bg-indigo-500/10 text-indigo-700 border border-indigo-500/20";
      case "DELIVERED":
        return "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20";
      case "CANCELLED":
        return "bg-rose-500/10 text-rose-700 border border-rose-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 border border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-accent-gold hover:text-accent-gold-dark transition-colors group focus:outline-none"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Order Registry
        </Link>
      </div>

      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#355E3B]/25 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-accent-gold text-lg tracking-wider">
              {order.orderNumber}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-[#FCFCFA]/60 font-light mt-1">
            Registered: {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })} at {new Date(order.createdAt).toLocaleTimeString(undefined, { timeStyle: "short" })}
          </p>
        </div>

        {isFinalState && (
          <div className="px-4 py-2 bg-primary-forest/30 border border-[#355E3B]/35 text-[10px] uppercase font-bold text-[#FCFCFA]/80 rounded-xl">
            Order Complete (Final State)
          </div>
        )}
      </div>

      {/* Feedback Alerts */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs text-emerald-400">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Detail grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Items, Notes, User snapshot */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Items details */}
          <div className="bg-[#24332B] border border-[#355E3B]/25 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#FCFCFA] border-b border-[#355E3B]/15 pb-2">
              Dishes & Package Breakdown
            </h3>

            <div className="divide-y divide-[#355E3B]/15">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-4 text-[#FCFCFA]">
                  {/* Image */}
                  <div className="w-16 h-12 rounded bg-[#2D3E35] border border-[#355E3B]/25 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.meal.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.meal.image}
                        alt={item.meal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] uppercase font-bold text-[#FCFCFA]/40">Meal</span>
                    )}
                  </div>

                  {/* Name and quantity */}
                  <div className="flex-1 min-w-0">
                    <span className="font-serif text-xs font-bold block">{item.meal.name}</span>
                    <span className="text-[10px] text-[#FCFCFA]/60 font-light block mt-0.5">
                      Quantity: {item.quantity} units
                    </span>
                  </div>

                  {/* Pricing */}
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold block">${item.totalPrice.toFixed(2)}</span>
                    <span className="text-[10px] text-[#FCFCFA]/50 font-light block">
                      ${item.unitPrice.toFixed(2)} each
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations details */}
            <div className="border-t border-[#355E3B]/15 pt-3.5 space-y-2 text-[#FCFCFA]">
              <div className="flex justify-between text-xs text-[#FCFCFA]/65 font-light">
                <span>Subtotal</span>
                <span className="font-mono">${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-[#FCFCFA]/65 font-light">
                <span>Wellness Delivery</span>
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Free</span>
              </div>
              <div className="flex justify-between text-xs font-bold border-t border-[#355E3B]/15 pt-2 text-[#FCFCFA]">
                <span>Grand Total</span>
                <span className="font-mono text-accent-gold">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Specifics details */}
          <div className="bg-[#24332B] border border-[#355E3B]/25 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#FCFCFA] border-b border-[#355E3B]/15 pb-2">
              Logistics & Address Info
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[#FCFCFA]">
              {/* Address */}
              <div className="flex gap-2.5 items-start">
                <MapPin size={16} className="text-accent-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#FCFCFA]/55 block font-light">
                    Scheduled Destination
                  </span>
                  <p className="text-xs text-[#FCFCFA]/85 leading-relaxed font-light">
                    {order.addressSnapshot}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-2.5 items-start">
                <Phone size={16} className="text-accent-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#FCFCFA]/55 block font-light">
                    Contact Phone
                  </span>
                  <p className="text-xs font-mono text-[#FCFCFA]/85">{order.phoneSnapshot}</p>
                </div>
              </div>

              {/* Delivery Date */}
              <div className="flex gap-2.5 items-start">
                <Calendar size={16} className="text-accent-gold shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#FCFCFA]/55 block font-light">
                    Delivery Date
                  </span>
                  <p className="text-xs font-mono font-bold text-accent-gold">
                    {new Date(order.deliveryDate).toLocaleDateString(undefined, { dateStyle: "long" })}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {order.deliveryNotes && (
                <div className="flex gap-2.5 items-start md:col-span-2 border-t border-[#355E3B]/15 pt-3">
                  <MessageSquare size={16} className="text-accent-gold shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#FCFCFA]/55 block font-light">
                      Fulfillment Instructions
                    </span>
                    <p className="text-xs text-[#FCFCFA]/75 font-light italic">
                      &ldquo;{order.deliveryNotes}&rdquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Status transition and Client details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Changer form */}
          <div className="bg-[#24332B] border border-[#355E3B]/25 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#FCFCFA] border-b border-[#355E3B]/15 pb-2 flex items-center gap-2">
              <ClipboardList size={16} className="text-accent-gold" />
              Fulfillment Manager
            </h3>

            <form onSubmit={handleStatusChange} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="order-status" className="block text-[10px] uppercase font-bold tracking-wider text-[#FCFCFA]/60">
                  Update Fulfillment State
                </label>
                <select
                  id="order-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MealOrder["status"])}
                  disabled={isFinalState || isLoading}
                  className="w-full px-3 py-2 bg-[#2D3E35] border border-[#355E3B]/30 rounded-xl text-xs text-[#FCFCFA] focus:ring-1 focus:ring-accent-gold focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <option value="PENDING">Pending Approval</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PREPARING">Kitchen Prep</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Status progression helpful notes */}
              {!isFinalState && (
                <div className="p-3 bg-primary-forest/20 border border-[#355E3B]/30 rounded-xl text-[10px] text-[#FCFCFA]/75 leading-relaxed font-light">
                  <strong>Progression Guide:</strong>
                  <ul className="list-disc pl-3 mt-1 space-y-0.5">
                    <li>Changing state sends HTML emails to the client.</li>
                    <li>Cancellations are locked after CONFIRMED (prep cycle).</li>
                    <li>Delivered and Cancelled are final order states.</li>
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={isFinalState || status === order.status || isLoading}
                className="w-full py-2.5 bg-accent-gold hover:bg-accent-gold-dark text-primary-forest disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Updating Database...
                  </>
                ) : (
                  "Apply Fulfillment Change"
                )}
              </button>
            </form>
          </div>

          {/* Customer profile card */}
          <div className="bg-[#24332B] border border-[#355E3B]/25 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#FCFCFA] border-b border-[#355E3B]/15 pb-2 flex items-center gap-2">
              <User size={16} className="text-accent-gold" />
              Client Profile
            </h3>

            <div className="space-y-3.5 text-[#FCFCFA]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2D3E35] border border-[#355E3B]/25 overflow-hidden flex items-center justify-center shrink-0">
                  {order.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={order.user.image}
                      alt={order.user.name || "Client avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={18} className="text-[#FCFCFA]/40" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs block truncate">{order.user.name || "Sattvic Soul"}</span>
                  <span className="text-[10px] text-[#FCFCFA]/55 block truncate">{order.user.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
