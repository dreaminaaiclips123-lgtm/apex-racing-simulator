"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBrandWhatsapp,
  IconCircleCheckFilled,
  IconDroplet,
  IconLoader2,
  IconRoad,
  IconSteeringWheel,
  IconTrophy,
} from "@tabler/icons-react";
import { formatDateKey, minutesToLabel, parseDateKey } from "@/lib/booking";
import {
  BOOKABLE_DAYS_AHEAD,
  BUSINESS,
  MODE_ORDER,
  MODES,
  PRICING,
  type DurationMinutes,
  type SimMode,
} from "@/lib/constants";

const MODE_ICONS = {
  f1: IconSteeringWheel,
  drift: IconDroplet,
  highway: IconRoad,
  race: IconTrophy,
} as const;

interface SlotAvailability {
  startMinute: number;
  available: boolean;
  remaining: number;
  past: boolean;
}

interface BookingConfirmation {
  simId: number;
  date: string;
  startMinute: number;
  endMinute: number;
  mode: SimMode;
}

function buildDays(): { key: string; weekday: string; day: string; month: string }[] {
  const days = [];
  const now = new Date();
  for (let i = 0; i <= BOOKABLE_DAYS_AHEAD; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    days.push({
      key: formatDateKey(d),
      weekday: d.toLocaleDateString("en-GB", { weekday: "short" }),
      day: d.toLocaleDateString("en-GB", { day: "numeric" }),
      month: d.toLocaleDateString("en-GB", { month: "short" }),
    });
  }
  return days;
}

export default function BookingSystem({ customerName }: { customerName: string | null }) {
  const days = useMemo(() => buildDays(), []);
  const [date, setDate] = useState(days[0].key);
  const [mode, setMode] = useState<SimMode>("f1");
  const [duration, setDuration] = useState<DurationMinutes>(30);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [startMinute, setStartMinute] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  // Selecting a new day/mode/duration invalidates whatever time was picked.
  function selectDate(key: string) {
    setDate(key);
    setStartMinute(null);
    setConfirmation(null);
    setSubmitError(null);
  }
  function selectMode(key: SimMode) {
    setMode(key);
    setStartMinute(null);
    setConfirmation(null);
    setSubmitError(null);
  }
  function selectDuration(key: DurationMinutes) {
    setDuration(key);
    setStartMinute(null);
    setConfirmation(null);
    setSubmitError(null);
  }

  useEffect(() => {
    let cancelled = false;
    // Loading/error flags for an in-flight fetch aren't derivable from props —
    // they track this effect's own async lifecycle, so setting them up front
    // here (before the request settles) is the correct place for it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingSlots(true);
    setSlotsError(null);
    fetch(`/api/bookings?date=${date}&mode=${mode}&duration=${duration}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setSlotsError(data.error);
          setSlots([]);
        } else {
          setSlots(data.slots);
        }
      })
      .catch(() => {
        if (!cancelled) setSlotsError("Couldn't load availability — check your connection.");
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, mode, duration]);

  async function confirmBooking() {
    if (startMinute === null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, startMinute, duration, mode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Something went wrong — try again.");
        if (res.status === 409) {
          fetch(`/api/bookings?date=${date}&mode=${mode}&duration=${duration}`)
            .then((r) => r.json())
            .then((d) => !d.error && setSlots(d.slots));
        }
        return;
      }
      setConfirmation({
        simId: data.booking.simId,
        date: data.booking.date,
        startMinute: data.booking.startMinute,
        endMinute: data.booking.endMinute,
        mode: data.booking.mode,
      });
    } catch {
      setSubmitError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const dateLabel = parseDateKey(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (confirmation) {
    const waNumber = BUSINESS.whatsappNumber.replace(/\D/g, "");
    const waText = encodeURIComponent(
      `Hi Apex! Just booked ${MODES[confirmation.mode].label} on ${dateLabel} at ` +
        `${minutesToLabel(confirmation.startMinute)}–${minutesToLabel(confirmation.endMinute)} ` +
        `(Bay ${String(confirmation.simId).padStart(2, "0")}). Name: ${customerName}.`
    );
    return (
      <div className="rounded-xl border border-go/40 bg-go-dim p-8 md:p-12 text-center">
        <IconCircleCheckFilled size={48} className="text-go mx-auto" />
        <h3 className="text-display text-3xl uppercase text-ink mt-4">Bay locked in</h3>
        <p className="text-ink-dim mt-2">
          {MODES[confirmation.mode].label} · {dateLabel} ·{" "}
          {minutesToLabel(confirmation.startMinute)}–{minutesToLabel(confirmation.endMinute)} ·
          Bay {String(confirmation.simId).padStart(2, "0")}
        </p>
        <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`https://wa.me/${waNumber}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-go px-6 py-3 text-display uppercase tracking-wide text-bg"
          >
            <IconBrandWhatsapp size={18} />
            Confirm on WhatsApp
          </a>
          <button
            onClick={() => {
              setConfirmation(null);
              setStartMinute(null);
            }}
            className="rounded-md border border-line px-6 py-3 text-display uppercase tracking-wide text-ink-dim hover:text-ink"
          >
            Book another slot
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      {/* date */}
      <div className="p-6 md:p-8 border-b border-line">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-dim mb-4">1. Pick a day</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {days.map((d) => (
            <button
              key={d.key}
              onClick={() => selectDate(d.key)}
              className={`shrink-0 rounded-md px-4 py-3 text-center min-w-[64px] border transition-colors ${
                date === d.key
                  ? "bg-accent border-accent text-ink"
                  : "border-line text-ink-dim hover:text-ink hover:border-ink-dim"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-wide">{d.weekday}</span>
              <span className="block text-display text-lg leading-tight">{d.day}</span>
              <span className="block text-[10px] uppercase tracking-wide">{d.month}</span>
            </button>
          ))}
        </div>
      </div>

      {/* mode + duration */}
      <div className="p-6 md:p-8 border-b border-line grid gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-dim mb-4">2. Pick your mode</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {MODE_ORDER.map((key) => {
              const Icon = MODE_ICONS[key];
              const active = mode === key;
              return (
                <button
                  key={key}
                  onClick={() => selectMode(key)}
                  className={`rounded-md border px-3 py-3.5 flex flex-col items-center gap-1.5 transition-colors ${
                    active
                      ? "bg-accent border-accent text-ink"
                      : "border-line text-ink-dim hover:text-ink hover:border-ink-dim"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs uppercase tracking-wide">{MODES[key].label}</span>
                </button>
              );
            })}
          </div>
          {mode === "drift" && (
            <p className="text-xs text-accent-2 mt-3">Only bays 03 &amp; 04 support drift.</p>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-dim mb-4">3. Duration</p>
          <div className="flex gap-2.5">
            {([30, 60] as DurationMinutes[]).map((d) => (
              <button
                key={d}
                onClick={() => selectDuration(d)}
                className={`rounded-md border px-5 py-3.5 text-center transition-colors ${
                  duration === d
                    ? "bg-accent border-accent text-ink"
                    : "border-line text-ink-dim hover:text-ink hover:border-ink-dim"
                }`}
              >
                <span className="block text-display text-lg leading-tight">{d} min</span>
                <span className="block text-[11px] tabular">{PRICING[d]} EGP</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* time grid */}
      <div className="p-6 md:p-8 border-b border-line">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-dim mb-4">4. Pick a start time</p>

        {loadingSlots && (
          <div className="flex items-center gap-2 text-ink-dim py-8 justify-center">
            <IconLoader2 size={18} className="animate-spin" />
            Loading availability…
          </div>
        )}

        {!loadingSlots && slotsError && (
          <div className="flex items-center gap-2 text-stop py-8 justify-center text-sm">
            <IconAlertTriangle size={18} />
            {slotsError}
          </div>
        )}

        {!loadingSlots && !slotsError && (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
            {slots.map((slot) => {
              const disabled = !slot.available || slot.past;
              const selected = startMinute === slot.startMinute;
              const lowStock = slot.available && slot.remaining === 1;
              return (
                <button
                  key={slot.startMinute}
                  disabled={disabled}
                  onClick={() => setStartMinute(slot.startMinute)}
                  className={`rounded-md border px-2 py-2.5 text-center tabular text-sm transition-colors ${
                    selected
                      ? "bg-accent border-accent text-ink"
                      : disabled
                        ? "border-line/60 text-ink-faint line-through cursor-not-allowed"
                        : "border-go/40 text-ink hover:border-go hover:bg-go-dim"
                  }`}
                >
                  {minutesToLabel(slot.startMinute)}
                  {lowStock && !selected && (
                    <span className="block text-[9px] text-accent-2 normal-case">1 left</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* details + confirm */}
      {startMinute !== null && (
        <div className="p-6 md:p-8 bg-surface-2">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-dim mb-4">
            5. {customerName ? "Confirm" : "Sign in to confirm"}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-md border border-line bg-surface p-4">
            <p className="text-sm text-ink-dim">
              {MODES[mode].label} · {dateLabel} · {minutesToLabel(startMinute)}–
              {minutesToLabel(startMinute + duration)}
              <span className="block sm:inline sm:ml-2 text-display text-ink text-lg">
                {PRICING[duration]} EGP
              </span>
            </p>
            {customerName ? (
              <button
                onClick={confirmBooking}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-display uppercase tracking-wide text-ink disabled:opacity-40 transition-opacity"
              >
                {submitting ? (
                  <IconLoader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Confirm booking <IconArrowRight size={16} />
                  </>
                )}
              </button>
            ) : (
              <a
                href={`/login?returnTo=${encodeURIComponent("/#book")}`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-6 py-3 text-display uppercase tracking-wide text-ink"
              >
                Sign in to book <IconArrowRight size={16} />
              </a>
            )}
          </div>
          {customerName && (
            <p className="text-xs text-ink-faint mt-3">Booking as {customerName}.</p>
          )}
          {submitError && (
            <p className="flex items-center gap-2 text-stop text-sm mt-3">
              <IconAlertTriangle size={16} />
              {submitError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
