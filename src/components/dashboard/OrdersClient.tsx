"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Calendar, ArrowRight, Utensils, SlidersHorizontal } from "lucide-react";

interface Meal {
  id: string;
  name: string;
  image: string | null;
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

interface OrdersClientProps {
  initialOrders: MealOrder[];
}

const STATUS_OPTIONS = [
  { label: "All Orders", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const orders = initialOrders;
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.items.some((item) => item.meal.name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col gap-2 border-b border-primary-sage/15 pb-6">
        <div className="text-xs text-primary-sage font-medium flex items-center gap-1.5 font-light">
          <Link href="/dashboard" className="hover:text-primary-forest transition-colors">
            Sanctuary
          </Link>
          <span>/</span>
          <span className="text-primary-forest font-bold">Nourishment Orders</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-primary-forest flex items-center gap-3">
          <Utensils className="text-accent-gold" size={28} />
          Ayurvedic Meal Orders
        </h1>
        <p className="text-xs text-foreground/70 font-light max-w-2xl">
          Track and manage your daily prana-rich dining requests. Monitor prep cycles and schedule options.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col gap-4 bg-[#FCFCFA] border border-primary-sage/15 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" size={16} />
            <input
              type="text"
              placeholder="Search by Order # or dish name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F4EC] border border-primary-sage/15 rounded-xl text-xs focus:ring-1 focus:ring-primary-forest focus:outline-none"
            />
          </div>
          {/* Filter Indicator */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#F8F4EC] border border-primary-sage/15 rounded-xl text-[10px] uppercase font-bold text-primary-forest w-fit">
            <SlidersHorizontal size={12} />
            Filter Engine
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-primary-sage/10">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedStatus(opt.value)}
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedStatus === opt.value
                  ? "bg-primary-forest text-[#FCFCFA] shadow-sm"
                  : "bg-[#F8F4EC] text-foreground/60 hover:bg-primary-sage/10 border border-primary-sage/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#FCFCFA] rounded-2xl border border-primary-sage/15 shadow-sm space-y-4">
          <div className="inline-flex p-4 rounded-full bg-primary-sage/5 text-primary-sage">
            <ShoppingBag size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-primary-forest">No Orders Located</h3>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto leading-relaxed font-light">
              We couldn&apos;t find any meal orders matching your filters. Nourish your body with pure, organic recipes.
            </p>
          </div>
          <Link
            href="/meals"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FCFCFA] px-5 py-2.5 rounded-full bg-primary-forest hover:bg-primary-sage transition-all shadow-sm"
          >
            Browse Ayurvedic Meals
            <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[#FCFCFA] border border-primary-sage/15 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
            >
              {/* Order Header */}
              <div className="flex justify-between items-start gap-4 border-b border-primary-sage/10 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-primary-forest font-mono tracking-wider uppercase bg-[#F8F4EC] px-2.5 py-0.5 rounded-md border border-primary-sage/10">
                    {order.orderNumber}
                  </span>
                  <div className="text-[10px] text-foreground/45 font-light pt-1">
                    Placed: {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>

              {/* Items Summary */}
              <div className="space-y-2 flex-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs gap-3">
                    <span className="text-foreground/75 truncate font-medium max-w-[70%]">
                      {item.meal.name}
                    </span>
                    <span className="text-foreground/50 font-mono text-[11px] shrink-0">
                      {item.quantity}x @ ${item.unitPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="border-t border-primary-sage/10 pt-3.5 flex justify-between items-center gap-4">
                <div className="space-y-0.5">
                  <div className="text-[8px] uppercase tracking-wider text-foreground/45 font-light">Delivery Scheduled</div>
                  <div className="text-xs font-bold text-primary-forest flex items-center gap-1.5">
                    <Calendar size={12} className="text-accent-gold" />
                    {new Date(order.deliveryDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <div className="text-[11px] font-bold text-primary-forest font-mono">
                    Total: ${order.totalAmount.toFixed(2)}
                  </div>
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-accent-gold hover:text-accent-gold-dark transition-colors"
                  >
                    Track Status &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
