import {
  BUSINESS,
  SIMULATORS,
  SLOT_MINUTES,
  type DurationMinutes,
  type SimMode,
} from "./constants";

export interface BookingRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  startMinute: number; // minutes since midnight
  endMinute: number;
  mode: SimMode;
  simId: number;
  userId: string;
  customerName: string;
  customerPhone: string;
  createdAt: string; // ISO timestamp
}

export type NewBookingInput = Omit<BookingRecord, "id" | "simId" | "createdAt">;

export function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parses a "YYYY-MM-DD" key as local calendar date components (avoids UTC day-shift). */
export function parseDateKey(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Add (or subtract) whole days to a "YYYY-MM-DD" key — pure calendar math, no timezone involved. */
export function addDaysToKey(key: string, days: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

// The server (Vercel) always runs in UTC regardless of visitor location, so
// any business-hours math done with the runtime's own local Date getters
// (getHours(), getDate(), etc.) silently uses the wrong calendar day for a
// couple of hours around Cairo midnight, letting already-elapsed slots stay
// bookable. Everything below computes real Cairo wall-clock time via the
// IANA tz database (Intl, not a hardcoded offset) — Egypt has flip-flopped on
// DST multiple times (abolished 2014, reinstated 2023), so EEeither+2 or +3
// depending on time of year is a real, current fact, not a one-off historical
// detail — UTC+2 in winter, UTC+3 in summer as of 2026 — so a fixed offset
// would just move the same class of bug to whichever months it got wrong.
const CAIRO_TZ = "Africa/Cairo";
const cairoFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAIRO_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function cairoParts(instant: Date) {
  const parts = Object.fromEntries(
    cairoFormatter.formatToParts(instant).map((p) => [p.type, p.value])
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/** Cairo's real UTC offset (in minutes) in effect at a given absolute instant — accounts for DST. */
function cairoOffsetMinutesAt(utcMs: number): number {
  const { year, month, day, hour, minute } = cairoParts(new Date(utcMs));
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute);
  return Math.round((asIfUtc - utcMs) / 60_000);
}

/** "YYYY-MM-DD" for the current date in Cairo, regardless of server/runtime timezone or DST. */
export function todayKeyCairo(now: Date = new Date()): string {
  const { year, month, day } = cairoParts(now);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * The real absolute instant a given Cairo-local date + minute-of-day refers
 * to, for cutoff comparisons (the 6h cancel window, past-slot checks). Uses
 * the real (DST-aware) Cairo UTC offset for that specific date, not "now" —
 * a booking near a DST transition must resolve against its own date's offset,
 * not whatever offset happens to be in effect when this function is called.
 * The result is the same real moment in time regardless of which timezone
 * the calling code (server or browser) happens to run in.
 */
export function bookingStartDate(date: string, minuteOfDay: number): Date {
  const [y, m, d] = date.split("-").map(Number);
  const asIfUtcMs = Date.UTC(y, m - 1, d, 0, 0, 0, 0) + minuteOfDay * 60_000;
  // Two-pass: guess the offset using itself as the probe instant, then
  // re-check against the resulting UTC instant in case that guess crossed a
  // DST boundary. Cairo's transitions happen at most once per day, so one
  // refinement pass is always enough.
  const guessOffset = cairoOffsetMinutesAt(asIfUtcMs);
  let utcMs = asIfUtcMs - guessOffset * 60_000;
  const realOffset = cairoOffsetMinutesAt(utcMs);
  if (realOffset !== guessOffset) {
    utcMs = asIfUtcMs - realOffset * 60_000;
  }
  return new Date(utcMs);
}

export function dayOpenMinute(): number {
  return BUSINESS.openHour * 60;
}

export function dayCloseMinute(): number {
  return BUSINESS.closeHour * 60;
}

/** All possible 30-min slot start times for a day, regardless of booking duration. */
export function generateDaySlots(): number[] {
  const slots: number[] = [];
  for (let m = dayOpenMinute(); m < dayCloseMinute(); m += SLOT_MINUTES) {
    slots.push(m);
  }
  return slots;
}

/** Start times that can host a booking of the given duration without running past close. */
export function bookableStarts(duration: DurationMinutes): number[] {
  return generateDaySlots().filter((start) => start + duration <= dayCloseMinute());
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Which rig would this booking claim, if any?
 * Non-drift requests prefer non-drift-capable rigs first so the 2 drift simulators
 * stay free for longer — drift is the scarcer resource.
 */
export function assignRig(
  date: string,
  startMinute: number,
  endMinute: number,
  mode: SimMode,
  existingBookings: BookingRecord[]
): number | null {
  const freeRigs = SIMULATORS.filter(
    (rig) =>
      !existingBookings.some(
        (b) =>
          b.date === date &&
          b.simId === rig.id &&
          overlaps(b.startMinute, b.endMinute, startMinute, endMinute)
      )
  );

  if (mode === "drift") {
    const candidate = freeRigs.find((r) => r.driftCapable);
    return candidate ? candidate.id : null;
  }

  const nonDrift = freeRigs.find((r) => !r.driftCapable);
  if (nonDrift) return nonDrift.id;
  const anyFree = freeRigs[0];
  return anyFree ? anyFree.id : null;
}

export interface SlotAvailability {
  startMinute: number;
  available: boolean;
  remaining: number;
}

/** Availability for every bookable start time on a date, for a given mode + duration. */
export function computeDayAvailability(
  date: string,
  duration: DurationMinutes,
  mode: SimMode,
  existingBookings: BookingRecord[]
): SlotAvailability[] {
  return bookableStarts(duration).map((startMinute) => {
    const endMinute = startMinute + duration;
    const freeRigs = SIMULATORS.filter(
      (rig) =>
        !existingBookings.some(
          (b) =>
            b.date === date &&
            b.simId === rig.id &&
            overlaps(b.startMinute, b.endMinute, startMinute, endMinute)
        )
    );
    const eligible =
      mode === "drift" ? freeRigs.filter((r) => r.driftCapable) : freeRigs;
    return {
      startMinute,
      available: eligible.length > 0,
      remaining: eligible.length,
    };
  });
}

export function isPastSlot(date: string, startMinute: number, now: Date): boolean {
  return bookingStartDate(date, startMinute).getTime() <= now.getTime();
}
