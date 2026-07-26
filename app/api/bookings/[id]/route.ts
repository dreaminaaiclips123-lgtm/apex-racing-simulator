import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin";
import { withBookingsTransaction } from "@/lib/store";

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await ctx.params;

  const outcome = await withBookingsTransaction<null>((bookings) => {
    const exists = bookings.some((b) => b.id === id);
    if (!exists) return { error: "Booking not found." };
    return { bookings: bookings.filter((b) => b.id !== id), result: null };
  });

  if ("error" in outcome) {
    return NextResponse.json({ error: outcome.error }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
