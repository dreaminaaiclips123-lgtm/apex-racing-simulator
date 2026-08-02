import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { readBookings } from "@/lib/store";
import { bookingStartDate } from "@/lib/booking";
import { findUserById, SUPER_ADMIN_EMAIL } from "@/lib/userStore";
import AdminBookingsList from "./AdminBookingsList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff Dashboard — Apex Racing Simulator",
  description: "Manage bookings and admin access for Apex Racing Simulator.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login?returnTo=%2Fadmin");
  }

  const currentAdmin = await findUserById(session.userId);
  const isSuperAdmin = currentAdmin?.email === SUPER_ADMIN_EMAIL;

  const bookings = await readBookings();
  const now = Date.now();
  const upcoming = bookings.filter((b) => bookingStartDate(b.date, b.endMinute).getTime() > now);

  return <AdminBookingsList bookings={upcoming} isSuperAdmin={isSuperAdmin} />;
}
