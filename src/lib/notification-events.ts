import { db } from "@/lib/db";
import { logSecurityEvent } from "@/lib/audit";

export async function triggerBookingCreated(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        yogaSession: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!booking) return;

    await logSecurityEvent(
      booking.userId,
      "BOOKING_CREATED",
      `Booking ${booking.id} created for session ${booking.yogaSessionId} (${booking.yogaSession.class.title}). Available seats left: ${booking.yogaSession.availableSeats}`
    );

    console.log(`[Notification Hook] Email queued for ${booking.user.email}: Booking for ${booking.yogaSession.class.title} is registered.`);
  } catch (error) {
    console.error("Error in triggerBookingCreated hook:", error);
  }
}

export async function triggerBookingConfirmed(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        yogaSession: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!booking) return;

    await logSecurityEvent(
      booking.userId,
      "BOOKING_CONFIRMED",
      `Booking ${booking.id} confirmed for session ${booking.yogaSessionId}`
    );

    console.log(`[Notification Hook] Email queued for ${booking.user.email}: Booking for ${booking.yogaSession.class.title} has been CONFIRMED.`);
  } catch (error) {
    console.error("Error in triggerBookingConfirmed hook:", error);
  }
}

export async function triggerBookingCancelled(bookingId: string, initiatedByAdmin: boolean = false) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        yogaSession: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!booking) return;

    await logSecurityEvent(
      booking.userId,
      "BOOKING_CANCELLED",
      `Booking ${booking.id} cancelled for session ${booking.yogaSessionId} (Initiated by admin: ${initiatedByAdmin})`
    );

    console.log(`[Notification Hook] Email queued for ${booking.user.email}: Booking for ${booking.yogaSession.class.title} has been CANCELLED.`);
  } catch (error) {
    console.error("Error in triggerBookingCancelled hook:", error);
  }
}

export async function triggerBookingCompleted(bookingId: string) {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        yogaSession: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!booking) return;

    await logSecurityEvent(
      booking.userId,
      "BOOKING_COMPLETED",
      `Booking ${booking.id} completed for session ${booking.yogaSessionId}`
    );

    console.log(`[Notification Hook] Email queued for ${booking.user.email}: Hope you enjoyed your session of ${booking.yogaSession.class.title}.`);
  } catch (error) {
    console.error("Error in triggerBookingCompleted hook:", error);
  }
}
