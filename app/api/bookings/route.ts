import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  assignRig,
  computeDayAvailability,
  formatDateKey,
  isPastSlot,
  type BookingRecord,
} from "@/lib/booking";
import { readBookings, withBookingsTransaction } from "@/lib/store";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/userStore";
import {
  BOOKABLE_DAYS_AHEAD,
  MODE_ORDER,
  PRICING,
  type DurationMinutes,
  type SimMode,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DURATIONS: DurationMinutes[] = [30, 60];

function isValidDate(date: string): boolean {
  if (!DATE_RE.test(date)) return false;
  const today = formatDateKey(new Date());
  const max = formatDateKey(
    new Date(Date.now() + BOOKABLE_DAYS_AHEAD * 24 * 60 * 60 * 1000)
  );
  return date >= today && date <= max;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date = searchParams.get("date") ?? "";
  const mode = searchParams.get("mode") as SimMode | null;
  const durationRaw = searchParams.get("duration") ?? "30";
  const duration = Number(durationRaw) as DurationMinutes;

  if (!isValidDate(date)) {
    return NextResponse.json({ error: "Invalid or out-of-range date." }, { status: 400 });
  }
  if (!mode || !MODE_ORDER.includes(mode)) {
    return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
  }
  if (!DURATIONS.includes(duration)) {
    return NextResponse.json({ error: "Invalid duration." }, { status: 400 });
  }

  const bookings = await readBookings();
  const now = new Date();
  const slots = computeDayAvailability(date, duration, mode, bookings).map((slot) => ({
    ...slot,
    past: isPastSlot(date, slot.startMinute, now),
  }));

  return NextResponse.json({ slots, price: PRICING[duration] });
}

interface CreateBookingBody {
  date: string;
  startMinute: number;
  duration: DurationMinutes;
  mode: SimMode;
}

function isCreateBookingBody(body: unknown): body is CreateBookingBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.date === "string" &&
    typeof b.startMinute === "number" &&
    typeof b.duration === "number" &&
    typeof b.mode === "string"
  );
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "customer") {
    return NextResponse.json({ error: "Sign in to book a slot." }, { status: 401 });
  }
  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "Sign in to book a slot." }, { status: 401 });
  }
  if (!user.name || !user.phone) {
    return NextResponse.json({ error: "Complete your profile before booking." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  if (!isCreateBookingBody(body)) {
    return NextResponse.json({ error: "Missing booking details." }, { status: 400 });
  }

  const { date, startMinute, duration, mode } = body;

  if (!isValidDate(date)) {
    return NextResponse.json({ error: "Invalid or out-of-range date." }, { status: 400 });
  }
  if (!MODE_ORDER.includes(mode)) {
    return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
  }
  if (!DURATIONS.includes(duration as DurationMinutes)) {
    return NextResponse.json({ error: "Invalid duration." }, { status: 400 });
  }
  if (!Number.isInteger(startMinute) || startMinute < 0) {
    return NextResponse.json({ error: "Invalid start time." }, { status: 400 });
  }
  if (isPastSlot(date, startMinute, new Date())) {
    return NextResponse.json({ error: "That slot is in the past." }, { status: 400 });
  }

  const endMinute = startMinute + duration;

  const outcome = await withBookingsTransaction<BookingRecord>((bookings) => {
    const simId = assignRig(date, startMinute, endMinute, mode, bookings);
    if (simId === null) {
      return { error: "That slot just filled up — pick another time." };
    }
    const booking: BookingRecord = {
      id: randomUUID(),
      date,
      startMinute,
      endMinute,
      mode,
      simId,
      userId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      createdAt: new Date().toISOString(),
    };
    return { bookings: [...bookings, booking], result: booking };
  });

  if ("error" in outcome) {
    return NextResponse.json({ error: outcome.error }, { status: 409 });
  }

  return NextResponse.json({ booking: outcome.result, price: PRICING[duration as DurationMinutes] });
}
