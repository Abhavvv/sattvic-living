import { db } from "../src/lib/db";
import { createPayment, updatePaymentStatus, getPaymentById, getPayments } from "../src/services/payment.service";
import { generateInvoice } from "../src/services/invoice.service";
import { getPaymentAuditHistory } from "../src/services/audit.service";
import { PaymentStatus, PaymentProvider, PaymentMethod } from "@prisma/client";

async function main() {
  console.log("🧪 Starting Payment Infrastructure Verification Tests...");

  // 1. Retrieve a test user or create a mock one if none exists
  let user = await db.user.findFirst();
  if (!user) {
    console.log("⚠️ No users found in database. Creating a mock test user...");
    user = await db.user.create({
      data: {
        name: "Test Seeker",
        email: "test.seeker@sattvic.com",
        role: "USER",
      },
    });
  }
  console.log(`👤 Using test user: ${user.name} (${user.email})`);

  // 2. Test Payment Creation (Default PENDING status)
  console.log("\n1️⃣ Testing Payment Creation...");
  const payment1 = await createPayment({
    userId: user.id,
    provider: PaymentProvider.MANUAL,
    amount: 150.00,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    relatedEntityType: "YOGA_BOOKING",
    relatedEntityId: "test-yoga-session-123",
    metadata: { note: "Manual check-in deposit" },
  });

  if (!payment1) {
    throw new Error("❌ Test Failed: payment1 is undefined");
  }

  console.log(`✓ Payment record created successfully!`);
  console.log(`  ID: ${payment1.id}`);
  console.log(`  Reference: ${payment1.paymentReference}`);
  console.log(`  Status: ${payment1.status} (Expected: PENDING)`);

  // Assert payment reference structure: SL-PAY-YYYY-XXXXXX
  const refPattern = /^SL-PAY-\d{4}-\d{6}$/;
  if (!refPattern.test(payment1.paymentReference)) {
    throw new Error(`❌ Test Failed: Payment reference format is incorrect: ${payment1.paymentReference}`);
  }
  console.log("✓ Payment reference format matches SL-PAY-YYYY-XXXXXX");

  // Verify that NO invoice exists yet (since status is PENDING)
  const invoices1 = await db.invoice.findMany({ where: { paymentId: payment1.id } });
  if (invoices1.length > 0) {
    throw new Error(`❌ Test Failed: Invoice was generated prematurely for a PENDING payment`);
  }
  console.log("✓ No invoice generated for PENDING payment (correct)");

  // 3. Test Status Transitions & Auto-Invoice generation
  console.log("\n2️⃣ Testing Status Transition to SUCCEEDED...");
  const updated1 = await updatePaymentStatus(
    payment1.id,
    PaymentStatus.SUCCEEDED,
    "ADMIN_TEST_RUNNER",
    "Customer cash clearance verified by admin"
  );

  if (updated1.status !== PaymentStatus.SUCCEEDED) {
    throw new Error(`❌ Test Failed: Payment status did not update to SUCCEEDED. Current: ${updated1.status}`);
  }
  console.log("✓ Payment status successfully updated to SUCCEEDED");

  // Verify that an invoice was generated automatically on SUCCEEDED
  const paymentDetails1 = await getPaymentById(payment1.id);
  if (!paymentDetails1 || paymentDetails1.invoices.length === 0) {
    throw new Error(`❌ Test Failed: No invoice was generated upon transition to SUCCEEDED`);
  }
  const autoInvoice = paymentDetails1.invoices[0];
  console.log(`✓ Invoice auto-generated!`);
  console.log(`  Invoice ID: ${autoInvoice.id}`);
  console.log(`  Invoice Number: ${autoInvoice.invoiceNumber}`);
  console.log(`  Invoice Status: ${autoInvoice.status} (Expected: PAID)`);

  // Assert invoice number format: SL-INV-YYYY-XXXXXX
  const invPattern = /^SL-INV-\d{4}-\d{6}$/;
  if (!invPattern.test(autoInvoice.invoiceNumber)) {
    throw new Error(`❌ Test Failed: Invoice number format is incorrect: ${autoInvoice.invoiceNumber}`);
  }
  console.log("✓ Invoice number format matches SL-INV-YYYY-XXXXXX");

  // Assert default 0% tax calculations on auto-invoice
  if (autoInvoice.totalAmount !== 150.00 || autoInvoice.taxAmount !== 0.00 || autoInvoice.subtotal !== 150.00) {
    throw new Error(`❌ Test Failed: Default tax math is wrong: subtotal=${autoInvoice.subtotal}, tax=${autoInvoice.taxAmount}, total=${autoInvoice.totalAmount}`);
  }
  console.log("✓ Default tax calculations correct (subtotal=150, tax=0, total=150)");

  // 4. Test Advanced Tax Calculations (inclusive & exclusive)
  console.log("\n3️⃣ Testing Advanced Tax Calculations...");
  const payment2 = await createPayment({
    userId: user.id,
    provider: PaymentProvider.STRIPE,
    amount: 115.00, // inclusive total paid
    paymentMethod: PaymentMethod.CARD,
    relatedEntityType: "MEAL_ORDER",
    relatedEntityId: "test-meal-order-456",
  });

  if (!payment2) {
    throw new Error("❌ Test Failed: payment2 is undefined");
  }

  // Calculate 15% inclusive HST tax
  const taxInclusiveInvoice = await generateInvoice(payment2.id, {
    hstRate: 0.15,
    isExclusive: false,
  });

  if (!taxInclusiveInvoice) {
    throw new Error("❌ Test Failed: taxInclusiveInvoice is undefined");
  }

  console.log("✓ Tax inclusive calculation (15% HST of 115.00 USD total):");
  console.log(`  Subtotal: ${taxInclusiveInvoice.subtotal} (Expected: 100.00)`);
  console.log(`  Tax Amount: ${taxInclusiveInvoice.taxAmount} (Expected: 15.00)`);
  console.log(`  Total: ${taxInclusiveInvoice.totalAmount} (Expected: 115.00)`);

  if (taxInclusiveInvoice.subtotal !== 100.00 || taxInclusiveInvoice.taxAmount !== 15.00 || taxInclusiveInvoice.totalAmount !== 115.00) {
    throw new Error("❌ Test Failed: Tax inclusive calculations failed.");
  }

  // Check Tax exclusive
  const payment3 = await createPayment({
    userId: user.id,
    provider: PaymentProvider.PAYPAL,
    amount: 100.00, // exclusive base
    paymentMethod: PaymentMethod.PAYPAL,
    relatedEntityType: "MEAL_ORDER",
    relatedEntityId: "test-meal-order-789",
  });

  if (!payment3) {
    throw new Error("❌ Test Failed: payment3 is undefined");
  }

  // Calculate 5% GST and 7% PST exclusive tax (12% total)
  const taxExclusiveInvoice = await generateInvoice(payment3.id, {
    gstRate: 0.05,
    pstRate: 0.07,
    isExclusive: true,
  });

  if (!taxExclusiveInvoice) {
    throw new Error("❌ Test Failed: taxExclusiveInvoice is undefined");
  }

  console.log("✓ Tax exclusive calculation (5% GST + 7% PST on 100.00 USD base):");
  console.log(`  Subtotal: ${taxExclusiveInvoice.subtotal} (Expected: 100.00)`);
  console.log(`  Tax Amount: ${taxExclusiveInvoice.taxAmount} (Expected: 12.00)`);
  console.log(`  Total: ${taxExclusiveInvoice.totalAmount} (Expected: 112.00)`);

  if (taxExclusiveInvoice.subtotal !== 100.00 || taxExclusiveInvoice.taxAmount !== 12.00 || taxExclusiveInvoice.totalAmount !== 112.00) {
    throw new Error("❌ Test Failed: Tax exclusive calculations failed.");
  }

  // 5. Test Audit logs
  console.log("\n4️⃣ Testing Audit Trails...");
  const auditLogs = await getPaymentAuditHistory(payment1.id);
  if (auditLogs.length < 2) {
    throw new Error(`❌ Test Failed: Insufficient audit logs generated. Found: ${auditLogs.length}`);
  }
  console.log(`✓ Audit logs generated correctly (Found ${auditLogs.length} events):`);
  auditLogs.forEach((log) => {
    console.log(`  - [${new Date(log.createdAt).toLocaleTimeString()}] ${log.action} performed by ${log.performedBy}`);
  });

  // 6. Test Search and Filters
  console.log("\n5️⃣ Testing Search and Filtering Functions...");
  // Test reference text search
  const searchResult = await getPayments({
    search: payment1.paymentReference,
  });
  if (searchResult.payments.length === 0 || searchResult.payments[0].id !== payment1.id) {
    throw new Error("❌ Test Failed: Search by payment reference returned zero results");
  }
  console.log("✓ Search by payment reference successfully returned the transaction");

  // Test status filter
  const statusResult = await getPayments({
    status: PaymentStatus.SUCCEEDED,
  });
  const found = statusResult.payments.some((p) => p.id === payment1.id);
  if (!found) {
    throw new Error("❌ Test Failed: Status filtering failed to locate the succeeded transaction");
  }
  console.log("✓ Status filtering successfully returned the succeeded transaction");

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! Payment Infrastructure Foundation is verified as production-grade.");
}

main()
  .catch((err) => {
    console.error("\n❌ Verification failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
