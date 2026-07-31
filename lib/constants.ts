export const BUSINESS = {
  name: "Apex Racing Simulator",
  tagline: "Egypt's go-to place for petrolheads & motorsport lovers",
  city: "New Cairo",
  addressShort: "2G8G+7XR, New Cairo 1, Cairo Governorate",
  mapsUrl: "https://maps.app.goo.gl/L8mDqsW58hgc7Cxp6",
  instagramHandle: "apexrseg",
  instagramUrl: "https://www.instagram.com/apexrseg",
  instagramFollowers: "49.6K",
  googleRating: 4.7,
  phoneDisplay: "011 1041 4102",
  phoneTel: "+201110414102",
  whatsappNumber: "+201212040789",
  // Assumed from typical New Cairo entertainment-venue hours — confirm/correct with owner.
  openHour: 10,
  closeHour: 24,
} as const;

export const SLOT_MINUTES = 30;

export type SimMode = "f1" | "drift" | "highway" | "race";

export const MODES: Record<
  SimMode,
  { label: string; short: string; blurb: string; driftOnly: boolean }
> = {
  f1: {
    label: "F1",
    short: "F1",
    blurb: "Open-wheel precision. Late-brake into every apex on official-spec circuits.",
    driftOnly: false,
  },
  race: {
    label: "Race",
    short: "Race",
    blurb: "GT & endurance racing. Wheel-to-wheel grid starts against the clock.",
    driftOnly: false,
  },
  highway: {
    label: "Highway",
    short: "Highway",
    blurb: "Open-world top speed runs. Traffic, throttle, and nerve.",
    driftOnly: false,
  },
  drift: {
    label: "Drift",
    short: "Drift",
    blurb: "Full send, sideways. Angle and smoke on our 2 drift-tuned rigs.",
    driftOnly: true,
  },
};

export const MODE_ORDER: SimMode[] = ["f1", "drift", "highway", "race"];

export interface SimulatorRig {
  id: number;
  name: string;
  driftCapable: boolean;
}

// Simulators 3 & 4 are the drift-tuned rigs — all 4 run F1 / Race / Highway.
export const SIMULATORS: SimulatorRig[] = [
  { id: 1, name: "SIMULATOR 01", driftCapable: false },
  { id: 2, name: "SIMULATOR 02", driftCapable: false },
  { id: 3, name: "SIMULATOR 03", driftCapable: true },
  { id: 4, name: "SIMULATOR 04", driftCapable: true },
];

export const PRICING = {
  30: 200,
  60: 400,
} as const;

export type DurationMinutes = keyof typeof PRICING;

export const BOOKABLE_DAYS_AHEAD = 10;
