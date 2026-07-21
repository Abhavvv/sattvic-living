"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, ShoppingBag, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface OrderPanelProps {
  mealId: string;
  mealSlug: string;
  price: number;
  isAvailable: boolean;
  isAuthenticated: boolean;
  userPhone?: string | null;
}

interface SuccessOrder {
  orderNumber: string;
  addressSnapshot: string;
}

export default function OrderPanel({
  mealId,
  mealSlug,
  price,
  isAvailable,
  isAuthenticated,
  userPhone,
}: OrderPanelProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  
  // Set default delivery date to tomorrow
  const getTomorrowString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const [deliveryDate, setDeliveryDate] = useState(getTomorrowString());
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [phone, setPhone] = useState(userPhone || "");
  const [address, setAddress] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<SuccessOrder | null>(null);

  // Load saved address and phone from localStorage for convenience if available
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated) {
      const savedAddress = localStorage.getItem("sat_delivery_address");
      const savedPhone = localStorage.getItem("sat_delivery_phone");
      if (savedAddress) setAddress(savedAddress);
      if (savedPhone && !phone) setPhone(savedPhone);
    }
  }, [isAuthenticated, phone]);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleLoginRedirect = () => {
    const currentPath = `/meals/${mealSlug}`;
    router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }

    if (!phone || phone.trim().length < 8) {
      setError("Please enter a valid phone number (at least 8 digits).");
      return;
    }

    if (!address || address.trim().length < 5) {
      setError("Please enter a complete delivery address.");
      return;
    }

    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    const selectedDate = new Date(deliveryDate);
    if (selectedDate <= new Date()) {
      setError("Delivery date must be in the future (tomorrow or later).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveryDate,
          deliveryNotes: deliveryNotes.trim() || null,
          phone: phone.trim(),
          address: address.trim(),
          items: [
            {
              mealId,
              quantity,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to place order.");
      }

      // Save delivery details to localStorage for future prefill
      localStorage.setItem("sat_delivery_address", address.trim());
      localStorage.setItem("sat_delivery_phone", phone.trim());

      setSuccessOrder(data.order);
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalItemPrice = price * quantity;
  const deliveryFee = 0.0; // Free delivery as part of health packages
  const grandTotal = totalItemPrice + deliveryFee;

  if (!isAvailable) {
    return (
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-red-500/10 text-red-600">
          <AlertCircle size={24} />
        </div>
        <h4 className="font-serif text-sm font-bold text-red-800 uppercase tracking-wider">Sold Out Today</h4>
        <p className="text-xs text-red-700/80 leading-relaxed max-w-xs mx-auto">
          We source our fresh ingredients daily. This Ayurvedic profile has reached its preparation capacity for the day. Please check back tomorrow!
        </p>
      </div>
    );
  }

  if (successOrder) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-4 animate-fade-in">
        <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 size={28} />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif text-base font-bold text-emerald-800">Order Placed Successfully!</h4>
          <p className="text-[11px] text-emerald-700 font-mono tracking-widest uppercase">
            Order No: {successOrder.orderNumber}
          </p>
        </div>
        
        <div className="p-4 bg-[#FCFCFA] border border-emerald-500/10 rounded-xl text-left text-xs text-foreground/80 space-y-2.5">
          <div className="flex justify-between border-b border-primary-sage/10 pb-1.5 font-bold">
            <span className="text-primary-forest">Nourishment Package</span>
            <span className="font-mono">${grandTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Quantity:</span>
            <span className="font-bold">{quantity}x</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Scheduled Delivery:</span>
            <span className="font-bold">{new Date(deliveryDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>Deliver To:</span>
            <span className="font-bold text-right truncate max-w-[150px]">{successOrder.addressSnapshot}</span>
          </div>
        </div>

        <p className="text-[10px] text-emerald-700/70 leading-relaxed font-light">
          A confirmation email has been logged. You can view the preparation status in real time inside your dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-[#FCFCFA] rounded-full text-xs font-bold transition-all shadow-sm"
          >
            Track Status Timeline
          </button>
          <button
            onClick={() => setSuccessOrder(null)}
            className="flex-1 px-4 py-2 border border-emerald-600/30 hover:bg-emerald-500/5 text-emerald-800 rounded-full text-xs font-bold transition-all"
          >
            Order Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FCFCFA] border border-primary-sage/20 rounded-2xl p-6 shadow-md space-y-6">
      <div className="flex items-center justify-between border-b border-primary-sage/10 pb-4">
        <h3 className="font-serif text-sm font-bold text-primary-forest flex items-center gap-2">
          <ShoppingBag size={16} className="text-accent-gold" />
          Nourishment Checkout
        </h3>
        <span className="text-xs text-foreground/50 font-light">Daily Dispatch</span>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-4 text-center py-4">
          <p className="text-xs text-foreground/75 leading-relaxed">
            Please register or sign in to complete your meal reservation and track your healthy delivery.
          </p>
          <button
            onClick={handleLoginRedirect}
            className="w-full py-2.5 bg-primary-forest hover:bg-accent-gold-dark text-[#FCFCFA] hover:text-primary-forest rounded-full text-xs font-bold transition-all shadow-sm"
          >
            Sign In to Order
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary-forest">Quantity</span>
            <div className="flex items-center gap-1 bg-[#F8F4EC] border border-primary-sage/15 rounded-full p-1">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FCFCFA] text-primary-forest hover:bg-primary-sage/10 transition-colors shadow-sm focus:outline-none"
              >
                <Minus size={12} />
              </button>
              <span className="w-10 text-center text-xs font-bold font-mono text-primary-forest">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FCFCFA] text-primary-forest hover:bg-primary-sage/10 transition-colors shadow-sm focus:outline-none"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Delivery Date */}
          <div className="space-y-1.5">
            <label htmlFor="delivery-date" className="block text-xs font-bold text-primary-forest">
              Scheduled Delivery Date
            </label>
            <input
              id="delivery-date"
              type="date"
              min={getTomorrowString()}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#F8F4EC] border border-primary-sage/15 rounded-xl text-xs focus:ring-1 focus:ring-primary-forest focus:outline-none font-mono"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label htmlFor="phone" className="block text-xs font-bold text-primary-forest">
              Contact Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#F8F4EC] border border-primary-sage/15 rounded-xl text-xs focus:ring-1 focus:ring-primary-forest focus:outline-none"
            />
          </div>

          {/* Delivery Address */}
          <div className="space-y-1.5">
            <label htmlFor="address" className="block text-xs font-bold text-primary-forest">
              Delivery Address Snapshot
            </label>
            <textarea
              id="address"
              rows={2}
              placeholder="Enter your complete house/flat details and street address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[#F8F4EC] border border-primary-sage/15 rounded-xl text-xs focus:ring-1 focus:ring-primary-forest focus:outline-none resize-none font-light leading-relaxed"
            />
          </div>

          {/* Delivery Notes */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="block text-xs font-bold text-primary-forest">
              Delivery Notes (Optional)
            </label>
            <input
              id="notes"
              type="text"
              placeholder="e.g. Leave with security, ring bell, no onion/garlic..."
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F4EC] border border-primary-sage/15 rounded-xl text-xs focus:ring-1 focus:ring-primary-forest focus:outline-none font-light"
            />
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-primary-sage/10 pt-3.5 space-y-2">
            <div className="flex justify-between text-xs text-foreground/60 font-light">
              <span>Item Total ({quantity} items)</span>
              <span className="font-mono">${totalItemPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-foreground/60 font-light">
              <span>Delivery Fee</span>
              <span className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">Free</span>
            </div>
            <div className="flex justify-between text-xs font-bold border-t border-primary-sage/10 pt-2 text-primary-forest">
              <span>Grand Total</span>
              <span className="font-mono text-base">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Sandboxed Payment Disclaimer */}
          <p className="text-[10px] text-foreground/50 font-light leading-relaxed">
            * Payment: Cash/Invoice on Delivery. Card/UPI integration is skipped for sandbox validation.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-forest hover:bg-primary-forest/90 text-[#FCFCFA] rounded-full text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Reserving Dish...
              </>
            ) : (
              <>
                <ShoppingBag size={14} />
                Reserve Ayurvedic Meal
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
