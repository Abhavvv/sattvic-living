"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Phone, MessageSquare, ShieldAlert, Loader2 } from "lucide-react";

interface Meal {
  id: string;
  name: string;
  image: string | null;
  slug: string;
}

interface MealOrderItem {
  id: string;
  mealId: string;
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
  items: MealOrderItem[];
}

interface OrderDetailClientProps {
  initialOrder: MealOrder;
}

const STEPS: Array<MealOrder["status"]> = ["PENDING", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

const STEP_LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Kitchen Prep",
  OUT_FOR_DELIVERY: "On the Way",
  DELIVERED: "Delivered",
};

const STEP_DESCRIPTIONS: Record<string, string> = {
  PENDING: "We received your order and are checking ingredients.",
  CONFIRMED: "Approved. Fresh local produce has been reserved.",
  PREPARING: "Chefs are preparing your dishes with conscious intent.",
  OUT_FOR_DELIVERY: "Insulated and shipped out for fresh delivery.",
  DELIVERED: "Arrived at your sanctuary. Namaste and bon appétit!",
};

export default function OrderDetailClient({ initialOrder }: OrderDetailClientProps) {
  const router = useRouter();
  const [order, setOrder] = useState<MealOrder>(initialOrder);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStatusIndex = (status: string) => {
    return STEPS.indexOf(status as MealOrder["status"]);
  };

  const currentStepIndex = getStatusIndex(order.status);
  const isCancelled = order.status === "CANCELLED";

  // Check if cancellation is permitted (only PENDING or CONFIRMED states)
  const isCancellable = order.status === "PENDING" || order.status === "CONFIRMED";

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "cancel",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel order.");
      }

      setOrder(data.order);
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred while cancelling your order.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-primary-forest hover:text-accent-gold-dark transition-colors group focus:outline-none"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Nourishment Orders
        </Link>
      </div>

      {/* Main header block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary-sage/15 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold text-primary-forest font-mono tracking-wider uppercase bg-[#FCFCFA] px-2.5 py-0.5 rounded border border-primary-sage/15 shadow-sm">
              {order.orderNumber}
            </span>
            <span className="text-xs text-foreground/45 font-light">
              Ordered {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-primary-forest">Order Progress Tracker</h1>
        </div>

        {/* Cancellation Actions */}
        {isCancellable && (
          <button
            onClick={handleCancelOrder}
            disabled={isLoading}
            className="px-5 py-2 border border-rose-500/20 hover:bg-rose-500/5 text-rose-800 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Order"
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-shake">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Order Status Timeline */}
        <div className="lg:col-span-8 space-y-6">
          {/* Status Timeline Container */}
          <div className="bg-[#FCFCFA] border border-primary-sage/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-sm font-bold text-primary-forest flex items-center gap-2 border-b border-primary-sage/10 pb-3">
              <Clock size={16} className="text-accent-gold" />
              Delivery Progress
            </h3>

            {isCancelled ? (
              <div className="flex gap-4 items-start p-4 bg-red-500/5 border border-red-500/15 rounded-xl">
                <div className="p-2 bg-red-500/10 text-red-600 rounded-full shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-xs font-bold text-red-800 uppercase tracking-wider">Order Cancelled</h4>
                  <p className="text-xs text-red-700/80 leading-relaxed font-light">
                    This order was cancelled. No kitchen prep or deliveries will occur. If you require further assistance or wish to re-order, please browse our daily menu.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary-sage/15">
                {STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  
                  return (
                    <div key={step} className="relative flex gap-4 items-start">
                      {/* Timeline Dot Indicator */}
                      <span
                        className={`absolute left-[-21px] top-1.5 w-3 h-3 rounded-full border-2 transition-all flex items-center justify-center ${
                          isCompleted
                            ? isCurrent
                              ? "bg-[#FCFCFA] border-accent-gold scale-125 shadow-sm ring-4 ring-accent-gold/20"
                              : "bg-emerald-600 border-emerald-600"
                            : "bg-[#FCFCFA] border-primary-sage/35"
                        }`}
                      >
                        {isCompleted && !isCurrent && (
                          <span className="w-1 h-1 bg-[#FCFCFA] rounded-full" />
                        )}
                      </span>

                      {/* Timeline Details */}
                      <div className="space-y-0.5">
                        <h4
                          className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                            isCompleted
                              ? isCurrent
                                ? "text-accent-gold"
                                : "text-primary-forest"
                              : "text-foreground/40"
                          }`}
                        >
                          {STEP_LABELS[step]}
                        </h4>
                        <p
                          className={`text-xs font-light leading-relaxed transition-colors ${
                            isCompleted ? "text-foreground/75" : "text-foreground/35"
                          }`}
                        >
                          {STEP_DESCRIPTIONS[step]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ordered Dish Details card */}
          <div className="bg-[#FCFCFA] border border-primary-sage/15 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-serif text-sm font-bold text-primary-forest border-b border-primary-sage/10 pb-3">
              Reserved Dishes
            </h3>
            
            <div className="divide-y divide-primary-sage/10">
              {order.items.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-4">
                  {/* Dish Thumbnail */}
                  <div className="w-16 h-12 rounded-lg bg-primary-sage/5 border border-primary-sage/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {item.meal.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.meal.image}
                        alt={item.meal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-primary-sage font-bold uppercase">Dish</span>
                    )}
                  </div>

                  {/* Detail details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/meals/${item.meal.slug}`}
                      className="font-serif text-xs font-bold text-primary-forest hover:text-accent-gold transition-colors truncate block"
                    >
                      {item.meal.name}
                    </Link>
                    <div className="text-[10px] text-foreground/50 font-light mt-0.5">
                      Quantity: <span className="font-bold">{item.quantity}</span>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-primary-forest font-mono">
                      ${item.totalPrice.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-foreground/45 font-light">
                      ${item.unitPrice.toFixed(2)} each
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-primary-sage/10 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-foreground/60 font-light">
                <span>Subtotal</span>
                <span className="font-mono">${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-foreground/60 font-light">
                <span>Wellness Delivery</span>
                <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">Free</span>
              </div>
              <div className="flex justify-between text-xs font-bold border-t border-primary-sage/10 pt-2 text-primary-forest">
                <span>Grand Total</span>
                <span className="font-mono">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Delivery Details Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FCFCFA] border border-primary-sage/15 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="font-serif text-sm font-bold text-primary-forest border-b border-primary-sage/10 pb-3">
              Delivery Logistics
            </h3>

            {/* Address */}
            <div className="flex gap-3 items-start">
              <MapPin className="text-accent-gold shrink-0 mt-0.5" size={16} />
              <div className="space-y-1">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-foreground/40 font-light">
                  Scheduled Destination
                </h4>
                <p className="text-xs text-foreground/75 leading-relaxed font-light">
                  {order.addressSnapshot}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-3 items-start">
              <Phone className="text-accent-gold shrink-0 mt-0.5" size={16} />
              <div className="space-y-1">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-foreground/40 font-light">
                  Contact Number
                </h4>
                <p className="text-xs text-foreground/75 font-mono">
                  {order.phoneSnapshot}
                </p>
              </div>
            </div>

            {/* Delivery Date */}
            <div className="flex gap-3 items-start">
              <Clock className="text-accent-gold shrink-0 mt-0.5" size={16} />
              <div className="space-y-1">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-foreground/40 font-light">
                  Delivery Date
                </h4>
                <p className="text-xs font-bold text-primary-forest font-mono">
                  {new Date(order.deliveryDate).toLocaleDateString(undefined, { dateStyle: "long" })}
                </p>
              </div>
            </div>

            {/* Notes */}
            {order.deliveryNotes && (
              <div className="flex gap-3 items-start border-t border-primary-sage/10 pt-4">
                <MessageSquare className="text-accent-gold shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <h4 className="text-[10px] uppercase font-bold tracking-wider text-foreground/40 font-light">
                    Instructions & Notes
                  </h4>
                  <p className="text-xs text-foreground/70 leading-relaxed font-light italic">
                    &ldquo;{order.deliveryNotes}&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
