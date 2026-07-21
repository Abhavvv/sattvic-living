import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPaymentById } from "@/services/payment.service";
import PaymentDetailAdminClient from "@/components/admin/PaymentDetailAdminClient";
import { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Admin Transaction Review | Sattvic Living",
  description: "Review comprehensive customer transaction metadata, inspect detailed invoice breakdowns, and run administrative status changes.",
};

export default async function AdminPaymentDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "ADMIN") {
    const { id } = await params;
    redirect(`/login?callbackUrl=/admin/payments/${id}`);
  }

  const { id } = await params;
  const payment = await getPaymentById(id);

  if (!payment) {
    redirect("/admin/payments");
  }

  // Serialize date objects for clean client boundary passing
  const serializedPayment = {
    ...payment,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    invoices: payment.invoices.map((inv) => ({
      ...inv,
      generatedAt: inv.generatedAt.toISOString(),
      createdAt: inv.createdAt.toISOString(),
    })),
    auditLogs: payment.auditLogs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })),
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PaymentDetailAdminClient payment={serializedPayment as unknown as Parameters<typeof PaymentDetailAdminClient>[0]["payment"]} />
    </div>
  );
}
