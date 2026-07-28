import { NextRequest, NextResponse } from "next/server";
import { bookingStartDate } from "@/lib/booking";
import { getSession } from "@/lib/session";
import { withBookingsTransaction } from "@/lib/store";

const CANCEL_CUTOFF_MS = 6 * 60 * 60 * 1000; // 6 hours before start

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await ctx.params;

  const outcome = await withBookingsTransaction<null>((bookings) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return { error: "Booking not found." };

    if (session.role === "customer") {
      if (booking.userId !== session.userId) {
        return { error: "Not authorized." };
      }
      const cutoff = bookingStartDate(booking.date, booking.startMinute).getTime() - CANCEL_CUTOFF_MS;
      if (Date.now() > cutoff) {
        return { error: "Too close to your slot to cancel — cancellations close 6 hours before start." };
      }
    }
    // Admins can cancel any booking regardless of the 6h window.

    return { bookings: bookings.filter((b) => b.id !== id), result: null };
  });

  if ("error" in outcome) {
    const status = outcome.error === "Not authorized." ? 401 : outcome.error === "Booking not found." ? 404 : 403;
    return NextResponse.json({ error: outcome.error }, { status });
  }
  return NextResponse.json({ ok: true });
}
