import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getPaymentById } from "@/services/payment.service";
import PaymentDetailClient from "@/components/dashboard/PaymentDetailClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Transaction Receipt | Sattvic Living",
  description: "View details, printable invoice summaries, and execution history of your wellness payment.",
};

export default async function UserPaymentDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    const { id } = await params;
    redirect(`/login?callbackUrl=/dashboard/payments/${id}`);
  }

  const { id } = await params;
  const payment = await getPaymentById(id);

  // Verification: Ensure the payment exists and belongs to the authenticated user
  if (!payment || payment.userId !== session.user.id) {
    redirect("/dashboard/payments");
  }

  // Serialize date objects for client boundary passing
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
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F4EC] pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <PaymentDetailClient payment={serializedPayment as unknown as Parameters<typeof PaymentDetailClient>[0]["payment"]} />
        </div>
      </main>
      <Footer />
    </>
  );
}
