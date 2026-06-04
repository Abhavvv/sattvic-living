import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth-utils";

const faqCreateSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const faqUpdateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  question: z.string().min(1, "Question cannot be empty").optional(),
  answer: z.string().min(1, "Answer cannot be empty").optional(),
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

// GET: Fetch all FAQs or a single FAQ
export async function GET(req: Request) {
  try {
    const session = await verifyAdmin();
    const isAdmin = !!session;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const faq = await db.fAQ.findUnique({ where: { id } });
      if (!faq || (!isAdmin && !faq.isActive)) {
        return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
      }
      return NextResponse.json(faq);
    }

    const faqs = await db.fAQ.findMany({
      where: isAdmin ? undefined : { isActive: true },
      orderBy: { displayOrder: "asc" }
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("❌ FAQs GET API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new FAQ
export async function POST(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = faqCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { question, answer, displayOrder, isActive } = result.data;

    const faq = await db.fAQ.create({
      data: {
        question,
        answer,
        displayOrder,
        isActive,
      },
    });

    return NextResponse.json({ message: "FAQ created successfully", faq }, { status: 201 });
  } catch (error) {
    console.error("❌ FAQs POST API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update an existing FAQ
export async function PUT(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const result = faqUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { id, question, answer, displayOrder, isActive } = result.data;

    // Check if FAQ exists
    const faqExists = await db.fAQ.findUnique({ where: { id } });
    if (!faqExists) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    const updatedFaq = await db.fAQ.update({
      where: { id },
      data: {
        question,
        answer,
        displayOrder,
        isActive,
      },
    });

    return NextResponse.json({ message: "FAQ updated successfully", faq: updatedFaq });
  } catch (error) {
    console.error("❌ FAQs PUT API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete an FAQ
export async function DELETE(req: Request) {
  try {
    const session = await verifyAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access. Admin privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "FAQ ID is required" }, { status: 400 });
    }

    // Check if FAQ exists
    const faqExists = await db.fAQ.findUnique({ where: { id } });
    if (!faqExists) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await db.fAQ.delete({ where: { id } });

    return NextResponse.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("❌ FAQs DELETE API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
