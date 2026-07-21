import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import PaymentsAdminClient from "@/components/admin/PaymentsAdminClient";
import { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin Payments Console | Sattvic Living",
  description: "View system-wide transaction reports, query custom date ranges, search invoices, and log manual payments.",
};

export default async function AdminPaymentsPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/payments");
  }

  // Retrieve system users list for the offline payment generator dropdown
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Query initial paginated list of payments
  const payments = await db.payment.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      invoices: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  // Query aggregate financial stats
  const [
    totalCount,
    succeededStats,
    failedCount,
    refundedCount,
  ] = await Promise.all([
    db.payment.count(),
    db.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _count: true,
      _sum: { amount: true },
    }),
    db.payment.count({ where: { status: "FAILED" } }),
    db.payment.count({ where: { status: "REFUNDED" } }),
  ]);

  const initialStats = {
    totalPayments: totalCount,
    successfulPayments: succeededStats._count || 0,
    failedPayments: failedCount,
    refundedPayments: refundedCount,
    totalRevenue: succeededStats._sum.amount || 0,
  };

  // Serialize date objects for the client boundary
  const serializedPayments = payments.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    invoices: p.invoices.map((inv) => ({
      ...inv,
      generatedAt: inv.generatedAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
    })),
  }));

  return (
    <PaymentsAdminClient
      initialPayments={serializedPayments as unknown as Parameters<typeof PaymentsAdminClient>[0]["initialPayments"]}
      initialStats={initialStats}
      users={users}
    />
  );
}
