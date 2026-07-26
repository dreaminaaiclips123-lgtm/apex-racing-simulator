import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin";
import { readBookings } from "@/lib/store";
import { formatDateKey } from "@/lib/booking";
import AdminLogin from "./AdminLogin";
import AdminBookingsList from "./AdminBookingsList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!isValidAdminToken(token)) {
    return <AdminLogin />;
  }

  const bookings = await readBookings();
  const now = new Date();
  const todayKey = formatDateKey(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = bookings.filter(
    (b) => b.date > todayKey || (b.date === todayKey && b.endMinute > nowMinutes)
  );

  return <AdminBookingsList bookings={upcoming} />;
}
