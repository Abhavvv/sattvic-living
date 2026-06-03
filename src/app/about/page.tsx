import { db } from "@/lib/db";
import AboutClient from "@/components/about/AboutClient";
import { Metadata } from "next";

export const revalidate = 0; // Fresh database query results on every request

export const metadata: Metadata = {
  title: "Our Core Philosophy | Sattvic Living",
  description: "Learn about the classical lineages, history, core principles, and the lineage guides of Sattvic Living.",
};

export default async function AboutPage() {
  const instructors = await db.instructor.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const faqs = await db.fAQ.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
  });

  return <AboutClient initialInstructors={instructors} initialFaqs={faqs} />;
}
