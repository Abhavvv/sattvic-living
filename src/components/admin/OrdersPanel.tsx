"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ExternalLink, Loader2, ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Meal {
  id: string;
  name: string;
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
  addressSnapshot: string;
  phoneSnapshot: string;
  createdAt: string;
  user: User;
  items: MealOrderItem[];
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState<MealOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const limit = 10;

  // Debounced search can be added or just trigger on input changes or button click. Let's trigger on inputs changes with a slight delay or directly.
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search) queryParams.append("search", search);
        if (status !== "ALL") queryParams.append("status", status);
        if (startDate) queryParams.append("startDate", startDate);
        if (endDate) queryParams.append("endDate", endDate);

        const response = await fetch(`/api/admin/orders?${queryParams.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch orders.");
        }

        setOrders(data.orders);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      } catch (err: unknown) {
        setError((err as Error).message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status, startDate, endDate, page]);

  // Reset page when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setPage(1);
    if (filterType === "status") setStatus(value);
    if (filterType === "search") setSearch(value);
    if (filterType === "startDate") setStartDate(value);
    if (filterType === "endDate") setEndDate(value);
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
      {/* Header */}
      <div className="flex justify-between items-center border-b border-primary-sage/10 pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#FCFCFA]">
            Meal Orders Administration
          </h1>
          <p className="text-xs text-[#FCFCFA]/75 font-light">
            Monitor client dining reservations, update preparation states, and track daily deliveries.
          </p>
        </div>
        <div className="text-[#FCFCFA] bg-primary-forest/40 border border-[#355E3B]/35 px-4 py-2 rounded-xl text-xs font-mono font-bold">
          Total orders: {totalCount}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-[#24332B] border border-[#355E3B]/25 p-5 rounded-2xl">
        {/* Search */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#FCFCFA]/60">
            Search Customers
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FCFCFA]/40" size={14} />
            <input
              type="text"
              placeholder="Search Order # or Email..."
              value={search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#2D3E35] border border-[#355E3B]/30 rounded-xl text-xs text-[#FCFCFA] focus:ring-1 focus:ring-accent-gold focus:outline-none"
            />
          </div>
        </div>

        {/* Status */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#FCFCFA]/60">
            Fulfillment Status
          </label>
          <select
            value={status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 bg-[#2D3E35] border border-[#355E3B]/30 rounded-xl text-xs text-[#FCFCFA] focus:ring-1 focus:ring-accent-gold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Kitchen Prep</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="md:col-span-2.5 space-y-1.5">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#FCFCFA]/60">
            Created After
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="w-full px-3 py-2 bg-[#2D3E35] border border-[#355E3B]/30 rounded-xl text-xs text-[#FCFCFA] focus:ring-1 focus:ring-accent-gold focus:outline-none font-mono"
          />
        </div>

        {/* End Date */}
        <div className="md:col-span-2.5 space-y-1.5">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-[#FCFCFA]/60">
            Created Before
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="w-full px-3 py-2 bg-[#2D3E35] border border-[#355E3B]/30 rounded-xl text-xs text-[#FCFCFA] focus:ring-1 focus:ring-accent-gold focus:outline-none font-mono"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Datagrid Table */}
      <div className="bg-[#24332B] border border-[#355E3B]/25 rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#FCFCFA]/60">
            <Loader2 className="animate-spin text-accent-gold" size={32} />
            <span className="text-xs font-light">Retrieving database logbook...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-[#FCFCFA]/55 space-y-2">
            <p className="text-sm font-bold">No orders matched query.</p>
            <p className="text-xs font-light">Try expanding your dates or clearing customer filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#2D3E35] border-b border-[#355E3B]/35 text-[10px] uppercase tracking-wider text-[#FCFCFA]/70 font-bold">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Summary</th>
                  <th className="p-4 text-right">Grand Total</th>
                  <th className="p-4">Delivery Date</th>
                  <th className="p-4">Placed Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#355E3B]/15 text-xs text-[#FCFCFA]/90">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#2D3E35]/40 transition-colors">
                    {/* Order No */}
                    <td className="p-4 font-mono font-bold tracking-wider text-accent-gold">
                      {order.orderNumber}
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="font-bold">{order.user.name || "Sattvic Soul"}</div>
                      <div className="text-[10px] text-[#FCFCFA]/60 font-light">{order.user.email}</div>
                    </td>

                    {/* Items */}
                    <td className="p-4 max-w-[200px]">
                      <div className="truncate font-light">
                        {order.items.map((it) => `${it.meal.name} (x${it.quantity})`).join(", ")}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="p-4 text-right font-mono font-bold">
                      ${order.totalAmount.toFixed(2)}
                    </td>

                    {/* Delivery date */}
                    <td className="p-4 font-mono text-[11px]">
                      {new Date(order.deliveryDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </td>

                    {/* Placed Date */}
                    <td className="p-4 font-mono text-[11px] text-[#FCFCFA]/60">
                      {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4 text-center">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-gold hover:bg-accent-gold-dark text-primary-forest rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors"
                      >
                        Manage
                        <ExternalLink size={10} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div className="p-4 bg-[#2D3E35] border-t border-[#355E3B]/35 flex justify-between items-center gap-4 text-[#FCFCFA]">
            <span className="text-[11px] text-[#FCFCFA]/65 font-light">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="p-2 bg-[#24332B] hover:bg-primary-forest/30 border border-[#355E3B]/30 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 bg-[#24332B] hover:bg-primary-forest/30 border border-[#355E3B]/30 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
