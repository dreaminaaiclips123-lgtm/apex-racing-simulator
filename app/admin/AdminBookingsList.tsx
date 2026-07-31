"use client";

import { useState } from "react";
import { minutesToLabel, parseDateKey, type BookingRecord } from "@/lib/booking";
import { MODES, SIMULATORS } from "@/lib/constants";
import AdminsPanel from "./AdminsPanel";

function formatDayLabel(date: string): string {
  return parseDateKey(date).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function AdminBookingsList({
  bookings,
  isSuperAdmin,
}: {
  bookings: BookingRecord[];
  isSuperAdmin: boolean;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const [items, setItems] = useState(bookings);
  const [showAdminsPanel, setShowAdminsPanel] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  async function cancel(id: string) {
    setPending(id);
    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((b) => b.id !== id));
    }
    setPending(null);
  }

  const grouped = items.reduce<Record<string, BookingRecord[]>>((acc, b) => {
    (acc[b.date] ??= []).push(b);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort();
  for (const d of dates) grouped[d].sort((a, b) => a.startMinute - b.startMinute);

  return (
    <div className="min-h-screen bg-bg px-6 pt-28 pb-10 md:px-12 md:pt-32">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-5 border-b border-line pb-6 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-display text-accent text-sm tracking-[0.3em] uppercase">Apex / Staff</p>
            <h1 className="text-display text-3xl">Upcoming bookings</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isSuperAdmin && (
              <button
                onClick={() => setShowAdminsPanel((v) => !v)}
                className="text-sm text-ink-dim hover:text-ink border border-line rounded-md px-4 py-2 transition-colors"
              >
                {showAdminsPanel ? "Close" : "Manage admins"}
              </button>
            )}
            <button
              onClick={logout}
              className="text-sm text-ink-dim hover:text-ink border border-line rounded-md px-4 py-2 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {isSuperAdmin && showAdminsPanel && (
          <AdminsPanel onDone={() => setShowAdminsPanel(false)} />
        )}

        {dates.length === 0 && (
          <p className="text-ink-dim border border-dashed border-line rounded-lg p-8 text-center">
            No upcoming bookings yet.
          </p>
        )}

        <div className="space-y-8">
          {dates.map((date) => (
            <div key={date}>
              <h2 className="text-display text-lg text-accent-2 uppercase tracking-wide mb-3">
                {formatDayLabel(date)}
              </h2>
              <div className="rounded-lg border border-line overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-ink-dim uppercase text-xs tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3">Time</th>
                      <th className="text-left px-4 py-3">Mode</th>
                      <th className="text-left px-4 py-3">Rig</th>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3">Phone</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[date].map((b) => (
                      <tr key={b.id} className="border-t border-line bg-surface-2">
                        <td className="px-4 py-3 tabular">
                          {minutesToLabel(b.startMinute)}–{minutesToLabel(b.endMinute)}
                        </td>
                        <td className="px-4 py-3">{MODES[b.mode].label}</td>
                        <td className="px-4 py-3">
                          {SIMULATORS.find((s) => s.id === b.simId)?.name ?? `Simulator ${b.simId}`}
                        </td>
                        <td className="px-4 py-3">{b.customerName}</td>
                        <td className="px-4 py-3 tabular">
                          <a href={`tel:${b.customerPhone}`} className="hover:text-accent-2">
                            {b.customerPhone}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => cancel(b.id)}
                            disabled={pending === b.id}
                            className="text-stop hover:text-accent disabled:opacity-40 text-xs uppercase tracking-wide"
                          >
                            {pending === b.id ? "…" : "Cancel"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
