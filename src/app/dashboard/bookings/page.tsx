import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import BookingsClient from "@/components/dashboard/BookingsClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";

export const revalidate = 0; // Fresh database query results on every request

export const metadata: Metadata = {
  title: "My Booking Sanctuary | Sattvic Living",
  description: "View and manage your scheduled yoga session reservations and attendance histories.",
};

export default async function UserBookingsPage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/dashboard/bookings");
  }

  const userId = session.user.id;

  // Retrieve all bookings for this user with instructor and class details
  const bookings = await db.booking.findMany({
    where: { userId },
    include: {
      yogaSession: {
        include: {
          class: {
            include: {
              instructor: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert Date objects to strings for clean serialization across boundary
  const serializedBookings = bookings.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    yogaSession: {
      ...b.yogaSession,
      startTime: b.yogaSession.startTime.toISOString(),
      endTime: b.yogaSession.endTime.toISOString(),
      createdAt: b.yogaSession.createdAt.toISOString(),
      updatedAt: b.yogaSession.updatedAt.toISOString(),
      class: {
        ...b.yogaSession.class,
        createdAt: b.yogaSession.class.createdAt.toISOString(),
        updatedAt: b.yogaSession.class.updatedAt.toISOString(),
        instructor: {
          ...b.yogaSession.class.instructor,
          createdAt: b.yogaSession.class.instructor.createdAt.toISOString(),
          updatedAt: b.yogaSession.class.instructor.updatedAt.toISOString(),
        },
      },
    },
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F4EC] pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <BookingsClient initialBookings={serializedBookings} />
        </div>
      </main>
      <Footer />
    </>
  );
}
