import { db } from "@/lib/db";
import { PaymentStatus, PaymentProvider, PaymentMethod, Prisma } from "@prisma/client";
import { logPaymentAudit } from "./audit.service";

interface CreatePaymentInput {
  userId: string;
  provider: PaymentProvider;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  relatedEntityType: string;
  relatedEntityId: string;
  metadata?: unknown;
  status?: PaymentStatus;
  providerPaymentId?: string;
  providerOrderId?: string;
}

interface GetPaymentsParams {
  userId?: string; // Filter for specific user (User Dashboard context)
  search?: string; // Search by Ref, Invoice, Email, Name
  status?: PaymentStatus;
  provider?: PaymentProvider;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Generates a unique sequential payment reference in the format SL-PAY-YYYY-XXXXXX.
 */
export async function generatePaymentReference(tx: Prisma.TransactionClient, year: number): Promise<string> {
  const prefix = `SL-PAY-${year}-`;
  
  const lastPayment = await tx.payment.findFirst({
    where: {
      paymentReference: {
        startsWith: prefix,
      },
    },
    orderBy: {
      paymentReference: "desc",
    },
    select: {
      paymentReference: true,
    },
  });

  let nextSequenceNum = 1;
  if (lastPayment && lastPayment.paymentReference) {
    const parts = lastPayment.paymentReference.split("-");
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
 * Creates a new payment record with a unique sequential reference and an audit log.
 */
export async function createPayment(data: CreatePaymentInput) {
  const year = new Date().getFullYear();
  const currency = data.currency || "USD";
  const status = data.status || PaymentStatus.PENDING;

  let retries = 5;
  while (retries > 0) {
    try {
      return await db.$transaction(async (tx) => {
        const paymentReference = await generatePaymentReference(tx, year);
        
        const payment = await tx.payment.create({
          data: {
            paymentReference,
            userId: data.userId,
            provider: data.provider,
            providerPaymentId: data.providerPaymentId,
            providerOrderId: data.providerOrderId,
            amount: data.amount,
            currency,
            status,
            paymentMethod: data.paymentMethod,
            relatedEntityType: data.relatedEntityType,
            relatedEntityId: data.relatedEntityId,
            metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
          },
        });

        await logPaymentAudit(
          payment.id,
          "PAYMENT_CREATED",
          "SYSTEM",
          { message: "Payment transaction record initialized", paymentReference },
          tx
        );

        // If payment is succeeded on creation, auto-generate invoice
        if (status === PaymentStatus.SUCCEEDED) {
          const { generateInvoice } = await import("./invoice.service");
          await generateInvoice(payment.id);
        }

        return payment;
      }, { maxWait: 15000, timeout: 30000 });
    } catch (error: unknown) {
      const dbError = error as { code?: string; meta?: { target?: string[] } };
      // P2002 is Prisma's code for unique constraint violation
      if (dbError.code === "P2002" && dbError.meta?.target?.includes("paymentReference")) {
        retries--;
        if (retries === 0) throw error;
        // Wait a random jitter and retry
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 10));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Updates payment status, generates audit records, and marks linked invoices as paid if applicable.
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  performedBy: string,
  metadata?: unknown
) {
  return await db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }

    if (payment.status === status) {
      return payment;
    }

    // Update status
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: { status },
    });

    // Audit log
    await logPaymentAudit(
      paymentId,
      "STATUS_UPDATED",
      performedBy,
      {
        oldStatus: payment.status,
        newStatus: status,
        details: metadata || "Payment status transitioned",
      },
      tx
    );

    // If payment succeeds, update status of any unpaid invoice to PAID (or create if missing)
    if (status === PaymentStatus.SUCCEEDED) {
      const invoices = await tx.invoice.findMany({
        where: { paymentId },
      });

      if (invoices.length > 0) {
        await tx.invoice.updateMany({
          where: { paymentId },
          data: { status: "PAID" },
        });
      } else {
        // Dynamically import and generate invoice
        const { generateInvoiceTx } = await import("./invoice.service");
        await generateInvoiceTx(tx, paymentId);
      }
    } else if (status === PaymentStatus.REFUNDED) {
      await tx.invoice.updateMany({
        where: { paymentId },
        data: { status: "REFUNDED" },
      });
    } else if (status === PaymentStatus.CANCELLED) {
      await tx.invoice.updateMany({
        where: { paymentId },
        data: { status: "VOID" },
      });
    }

    return updatedPayment;
  }, { maxWait: 15000, timeout: 30000 });
}

/**
 * Retrieves a single payment by ID with user, invoices, and audit logs.
 */
export async function getPaymentById(id: string) {
  return db.payment.findUnique({
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
      invoices: true,
      auditLogs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Fetches a list of payments with filtering, search, and pagination.
 */
export async function getPayments(params: GetPaymentsParams) {
  const {
    userId,
    search,
    status,
    provider,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = params;

  const skip = (page - 1) * limit;
  const where: Prisma.PaymentWhereInput = {};

  // Enforce user ownership if userId filter is passed
  if (userId) {
    where.userId = userId;
  }

  // Enforce status filter
  if (status) {
    where.status = status;
  }

  // Enforce provider filter
  if (provider) {
    where.provider = provider;
  }

  // Enforce date range
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  // Search logic
  if (search && search.trim() !== "") {
    const searchString = search.trim();
    where.OR = [
      { paymentReference: { contains: searchString, mode: "insensitive" } },
      {
        invoices: {
          some: {
            invoiceNumber: { contains: searchString, mode: "insensitive" },
          },
        },
      },
      {
        user: {
          OR: [
            { name: { contains: searchString, mode: "insensitive" } },
            { email: { contains: searchString, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  const [total, payments] = await Promise.all([
    db.payment.count({ where }),
    db.payment.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
