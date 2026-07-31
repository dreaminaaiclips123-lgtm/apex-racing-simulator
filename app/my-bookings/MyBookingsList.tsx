"use client";

import { useState } from "react";
import Link from "next/link";
import { bookingStartDate, minutesToLabel, parseDateKey, type BookingRecord } from "@/lib/booking";
import { MODES, SIMULATORS } from "@/lib/constants";

const CANCEL_CUTOFF_MS = 6 * 60 * 60 * 1000;

function formatDayLabel(date: string): string {
  return parseDateKey(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function MyBookingsList({ bookings }: { bookings: BookingRecord[] }) {
  const [items, setItems] = useState(bookings);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [now] = useState(() => Date.now());
  const upcoming = items
    .filter((b) => bookingStartDate(b.date, b.startMinute).getTime() > now)
    .sort((a, b) => bookingStartDate(a.date, a.startMinute).getTime() - bookingStartDate(b.date, b.startMinute).getTime());
  const past = items
    .filter((b) => bookingStartDate(b.date, b.startMinute).getTime() <= now)
    .sort((a, b) => bookingStartDate(b.date, b.startMinute).getTime() - bookingStartDate(a.date, a.startMinute).getTime());

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  async function cancel(id: string) {
    setPending(id);
    setError(null);
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setItems((prev) => prev.filter((b) => b.id !== id));
    } else {
      setError(data.error ?? "Couldn't cancel that booking.");
    }
    setPending(null);
  }

  return (
    <div className="min-h-screen bg-bg px-6 pt-28 pb-10 md:px-12 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-5 border-b border-line pb-6 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-accent-2 text-xs tracking-[0.3em] uppercase">Apex</p>
            <h1 className="text-display text-3xl">My bookings</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/#book"
              className="rounded-md bg-accent px-4 py-2 text-sm text-display uppercase tracking-wide text-ink"
            >
              Book a slot
            </Link>
            <button
              onClick={logout}
              className="text-sm text-ink-dim hover:text-ink border border-line rounded-md px-4 py-2 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {error && <p className="text-stop text-sm mb-4">{error}</p>}

        <h2 className="text-display text-lg text-accent-2 uppercase tracking-wide mb-3">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="text-ink-dim border border-dashed border-line rounded-lg p-8 text-center mb-10">
            No upcoming bookings yet.
          </p>
        ) : (
          <div className="rounded-lg border border-line overflow-x-auto mb-10">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-surface text-ink-dim uppercase text-xs tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Time</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Mode</th>
                  <th className="text-left px-4 py-3 whitespace-nowrap">Rig</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {upcoming.map((b) => {
                  const cancellable = now < bookingStartDate(b.date, b.startMinute).getTime() - CANCEL_CUTOFF_MS;
                  return (
                    <tr key={b.id} className="border-t border-line bg-surface-2">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDayLabel(b.date)}</td>
                      <td className="px-4 py-3 tabular whitespace-nowrap">
                        {minutesToLabel(b.startMinute)}–{minutesToLabel(b.endMinute)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{MODES[b.mode].label}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {SIMULATORS.find((s) => s.id === b.simId)?.name ?? `Simulator ${b.simId}`}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {cancellable ? (
                          <button
                            onClick={() => cancel(b.id)}
                            disabled={pending === b.id}
                            className="text-stop hover:text-accent disabled:opacity-40 text-xs uppercase tracking-wide"
                          >
                            {pending === b.id ? "…" : "Cancel"}
                          </button>
                        ) : (
                          <span className="text-ink-faint text-xs uppercase tracking-wide">
                            Locked (&lt;6h)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 className="text-display text-lg text-ink-dim uppercase tracking-wide mb-3">Past</h2>
            <div className="rounded-lg border border-line overflow-x-auto opacity-70">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="bg-surface text-ink-dim uppercase text-xs tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Date</th>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Time</th>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Mode</th>
                    <th className="text-left px-4 py-3 whitespace-nowrap">Rig</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map((b) => (
                    <tr key={b.id} className="border-t border-line bg-surface-2">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDayLabel(b.date)}</td>
                      <td className="px-4 py-3 tabular whitespace-nowrap">
                        {minutesToLabel(b.startMinute)}–{minutesToLabel(b.endMinute)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{MODES[b.mode].label}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {SIMULATORS.find((s) => s.id === b.simId)?.name ?? `Simulator ${b.simId}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
