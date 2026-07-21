import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import OrderDetailPanel from "@/components/admin/OrderDetailPanel";
import { Metadata } from "next";

export const revalidate = 0; // Fresh database query results on every request

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "Manage Meal Order | Sattvic Living Admin",
  description: "Admin portal to update customer meal orders, schedule cycles, and track states.",
};

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const session = await auth();

  // Enforce server-side role check
  if (!session || !session.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { id } = await params;

  // Retrieve order details
  const order = await db.mealOrder.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
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

  // Serialize dates for the client component boundary passing
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
      },
    })),
  };

  return (
    <div className="py-6 px-4 md:px-8 max-w-5xl mx-auto">
      <OrderDetailPanel initialOrder={serializedOrder as unknown as Parameters<typeof OrderDetailPanel>[0]["initialOrder"]} />
    </div>
  );
}
