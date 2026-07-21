import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import OrdersClient from "@/components/dashboard/OrdersClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const revalidate = 0; // Fresh database query results on every request

export const metadata: Metadata = {
  title: "My Nourishment Orders | Sattvic Living",
  description: "View and track your scheduled organic daily meal orders and status history.",
};

export default async function UserOrdersPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/dashboard/orders");
  }

  const userId = session.user.id;

  // Retrieve user orders including items and meal details
  const orders = await db.mealOrder.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          meal: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize dates for clean boundary passing to the client component
  const serializedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    deliveryDate: order.deliveryDate.toISOString(),
    items: order.items.map((item) => ({
      ...item,
      meal: {
        id: item.meal.id,
        name: item.meal.name,
        image: item.meal.image,
        slug: item.meal.slug,
      },
    })),
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F4EC] pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <OrdersClient initialOrders={serializedOrders as unknown as Parameters<typeof OrdersClient>[0]["initialOrders"]} />
        </div>
      </main>
      <Footer />
    </>
  );
}
