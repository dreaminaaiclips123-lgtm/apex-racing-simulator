import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { readBookings } from "@/lib/store";
import MyBookingsList from "./MyBookingsList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Bookings — Apex Racing Simulator",
  description: "View and manage your upcoming racing simulator bookings.",
  robots: { index: false, follow: false },
};

export default async function MyBookingsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?returnTo=%2Fmy-bookings");
  }
  if (session.role !== "customer") {
    redirect("/admin");
  }

  const allBookings = await readBookings();
  const bookings = allBookings.filter((b) => b.userId === session.userId);

  return <MyBookingsList bookings={bookings} />;
}
