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

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** The real Date a booking starts at, for cutoff comparisons (e.g. the 6h cancel window). */
export function bookingStartDate(date: string, startMinute: number): Date {
  const start = parseDateKey(date);
  start.setMinutes(start.getMinutes() + startMinute);
  return start;
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
 * Non-drift requests prefer non-drift-capable rigs first so the 2 drift bays
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
  const todayKey = formatDateKey(now);
  if (date > todayKey) return false;
  if (date < todayKey) return true;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return startMinute <= nowMinutes;
}
