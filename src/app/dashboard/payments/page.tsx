import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import PaymentsClient from "@/components/dashboard/PaymentsClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const revalidate = 0; // Fresh database query results on every request

export const metadata: Metadata = {
  title: "My Payments | Sattvic Living",
  description: "View your historical transaction references, invoices, status, and wellness payments.",
};

export default async function UserPaymentsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/dashboard/payments");
  }

  const userId = session.user.id;

  // Retrieve user payments including related invoices
  const payments = await db.payment.findMany({
    where: { userId },
    include: {
      invoices: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Serialize dates for clean boundary passing to the client component
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
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F4EC] pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <PaymentsClient initialPayments={serializedPayments as unknown as Parameters<typeof PaymentsClient>[0]["initialPayments"]} />
        </div>
      </main>
      <Footer />
    </>
  );
}
