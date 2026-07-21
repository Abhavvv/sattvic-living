import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import OrderDetailClient from "@/components/dashboard/OrderDetailClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const revalidate = 0; // Fresh database query results on every request

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Order Status Tracker | Sattvic Living",
  description: "Track your scheduled meal order delivery progress in real-time.",
};

export default async function UserOrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const { id } = await params;

  // Retrieve details of the specific order
  const order = await db.mealOrder.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          meal: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Ownership verification (only owner or admin can view)
  const isOwner = order.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    redirect("/dashboard");
  }

  // Serialize dates for the client component boundary
  const serializedOrder = {
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
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F4EC] pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <OrderDetailClient initialOrder={serializedOrder as unknown as Parameters<typeof OrderDetailClient>[0]["initialOrder"]} />
        </div>
      </main>
      <Footer />
    </>
  );
}
