import { db } from "@/lib/db";
import { Prisma, InvoiceStatus } from "@prisma/client";
import { logPaymentAudit } from "./audit.service";

interface TaxConfig {
  gstRate?: number;
  pstRate?: number;
  hstRate?: number;
  internationalRate?: number;
  isExclusive?: boolean; // If true, tax is added on top of payment amount. If false, tax is inclusive.
}

/**
 * Generates a unique sequential invoice number in the format SL-INV-YYYY-XXXXXX.
 */
export async function generateInvoiceNumber(tx: Prisma.TransactionClient, year: number): Promise<string> {
  const prefix = `SL-INV-${year}-`;
  
  const lastInvoice = await tx.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      invoiceNumber: "desc",
    },
    select: {
      invoiceNumber: true,
    },
  });

  let nextSequenceNum = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split("-");
    const lastNumStr = parts[parts.length - 1];
    const lastNum = parseInt(lastNumStr, 10);
    if (!isNaN(lastNum)) {
      nextSequenceNum = lastNum + 1;
    }
  }

  const paddedSequence = String(nextSequenceNum).padStart(6, "0");
  return `${prefix}${paddedSequence}`;
}

/**
 * Core invoice generation transaction logic.
 */
export async function generateInvoiceTx(
  tx: Prisma.TransactionClient,
  paymentId: string,
  taxConfig?: TaxConfig
) {
  const payment = await tx.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new Error(`Payment not found: ${paymentId}`);
  }

  // Check if invoice already exists
  const existingInvoice = await tx.invoice.findFirst({
    where: { paymentId },
  });
  if (existingInvoice) {
    return existingInvoice;
  }

  const year = new Date().getFullYear();
  const invoiceNumber = await generateInvoiceNumber(tx, year);

  // Compute tax
  const gstRate = taxConfig?.gstRate || 0;
  const pstRate = taxConfig?.pstRate || 0;
  const hstRate = taxConfig?.hstRate || 0;
  const internationalRate = taxConfig?.internationalRate || 0;
  const totalRate = gstRate + pstRate + hstRate + internationalRate;

  let subtotal = payment.amount;
  let taxAmount = 0;
  let totalAmount = payment.amount;

  if (totalRate > 0) {
    if (taxConfig?.isExclusive) {
      // Tax-exclusive
      taxAmount = payment.amount * totalRate;
      totalAmount = payment.amount + taxAmount;
      subtotal = payment.amount;
    } else {
      // Tax-inclusive (standard default)
      totalAmount = payment.amount;
      taxAmount = totalAmount * (totalRate / (1 + totalRate));
      subtotal = totalAmount - taxAmount;
    }
  }

  // Round values to 2 decimal places
  subtotal = Math.round(subtotal * 100) / 100;
  taxAmount = Math.round(taxAmount * 100) / 100;
  totalAmount = Math.round(totalAmount * 100) / 100;

  // Invoice status maps to payment status
  let status: InvoiceStatus = "UNPAID";
  if (payment.status === "SUCCEEDED") {
    status = "PAID";
  } else if (payment.status === "REFUNDED") {
    status = "REFUNDED";
  } else if (payment.status === "CANCELLED") {
    status = "VOID";
  }

  const invoice = await tx.invoice.create({
    data: {
      invoiceNumber,
      paymentId,
      userId: payment.userId,
      subtotal,
      taxAmount,
      totalAmount,
      currency: payment.currency,
      status,
      generatedAt: new Date(),
    },
  });

  await logPaymentAudit(
    paymentId,
    "INVOICE_GENERATED",
    "SYSTEM",
    {
      invoiceId: invoice.id,
      invoiceNumber,
      taxBreakdown: {
        gstRate,
        pstRate,
        hstRate,
        internationalRate,
        totalRate,
      },
    },
    tx
  );

  return invoice;
}

/**
 * Standard invoice generation method with automatic retry loop for unique constraints.
 */
export async function generateInvoice(paymentId: string, taxConfig?: TaxConfig) {
  let retries = 5;
  while (retries > 0) {
    try {
      return await db.$transaction(async (tx) => {
        return await generateInvoiceTx(tx, paymentId, taxConfig);
      }, { maxWait: 15000, timeout: 30000 });
    } catch (error: unknown) {
      const dbError = error as { code?: string; meta?: { target?: string[] } };
      if (dbError.code === "P2002" && dbError.meta?.target?.includes("invoiceNumber")) {
        retries--;
        if (retries === 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 10));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Retrieves invoice by ID.
 */
export async function getInvoiceById(id: string) {
  return db.invoice.findUnique({
    where: { id },
    include: {
      payment: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}
