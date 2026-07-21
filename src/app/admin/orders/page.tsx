import { redirect } from "next/navigation";
import { auth } from "@/auth";
import OrdersPanel from "@/components/admin/OrdersPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meal Orders Administration | Sattvic Living",
  description: "Monitor, filter, and manage customer food orders, tracking cycles, and delivery updates.",
};

export default async function AdminOrdersPage() {
  const session = await auth();

  // Enforce server-side role check
  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="py-6 px-4 md:px-8 max-w-7xl mx-auto">
      <OrdersPanel />
    </div>
  );
}
