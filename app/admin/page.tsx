import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { readBookings } from "@/lib/store";
import { formatDateKey } from "@/lib/booking";
import AdminBookingsList from "./AdminBookingsList";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login?returnTo=%2Fadmin");
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
