# Product

## Register

brand / local entertainment venue

## Platform

web

## Users

Egyptian motorsport fans and gamers, mostly 16-35, in and around New Cairo. Groups of friends, birthday parties, corporate team outings. They arrive from Instagram (@apexrseg, 49.6K followers) or a Google search on their phone, already sold on the vibe — the site's job is to convert that into a booked slot. Secondary user: the shop owner/staff, who need to see what's booked without calling each customer.

## Product Purpose

The digital home of Apex Racing Simulator, a real racing-sim venue in New Cairo with 4 professional rigs (2 also drift-capable). Today reservations happen entirely by phone call. This site replaces the phone-tag with a live booking system: pick a date, a 30-minute slot, a mode (F1 / Drift / Highway / Race), see real availability instantly, and lock it in — without ever double-booking a rig.

## Positioning

Not a showroom for supercars — a clubhouse for petrolheads. The site should feel like sitting in the cockpit the second it loads: dark, technical, HUD-driven, loud with checkered-flag energy, but precise, not gimmicky.

## Conversion & proof

- Primary CTA: Book a slot (the booking system itself).
- Secondary CTA: WhatsApp/call, Instagram.
- The line a visitor remembers: "Egypt's go-to place for petrolheads — 4 rigs, real racing feel, zero waiting on hold."
- Belief ladder: this is a real, active, well-loved venue (4.7★, 49.6K followers, real address) → the rigs are legit multi-mode simulators, not arcade toys → booking is instant and trustworthy (no overlap, ever).
- Proof on hand: Instagram following, Google rating, real address/hours, drop-in gallery for real venue photos once supplied.

## Brand Personality

High-octane, technical, communal. Pit-lane at night: asphalt black, headlight white, apex red. HUD typography (telemetry numbers, tachometers, lap timers) used as decoration that means something, not noise. Confident and a little cocky, the way race teams talk about their car — but the booking flow itself is dead simple and fast.

## Anti-references

- Generic go-kart/arcade party sites (bouncy comic sans energy, primary-color clutter).
- AI-slop landing pages: purple gradients, glassmorphism everywhere, generic serif-italic editorial affectation.
- Luxury supercar dealership sites (too cold/showroom — this is a hangout, not a dealership).
- Fake urgency dark patterns in the booking flow (fake countdown timers, "3 people viewing this slot").

## Design Principles

1. The intro is the ignition sequence — the one moment every visitor, every device, gets a deliberate "systems online" reveal before the site proper appears. Once per browser, skippable, never annoying on repeat visits.
2. The booking grid is the hero feature, not an afterthought bolted to the bottom — it must be fast, legible, and honest about availability (never show a slot as open that isn't).
3. One accent (apex red) carries the brand; support colors (amber caution, track green) are reserved for booking-state meaning, not decoration.
4. Real facts over invented ones — address, phone, rating, follower count are real and cited; anything invented (hours, rig names) is flagged for the owner to correct.
5. Motion is telemetry, not confetti: numbers ticking, needles sweeping, flags wiping — nothing bounces just to bounce.

## Locked direction

**Palette** (Tailwind v4 `@theme` tokens):
- `--color-bg`: `#0A0B0D` — asphalt black
- `--color-surface`: `#15171B` — panel/dash surface
- `--color-ink`: `#F4F3EF` — headlight white
- `--color-accent`: `#E8232B` — apex red (matched to real logo)
- `--color-accent-2`: `#F2B633` — caution amber (sparse: warnings, "almost full")
- `--color-go`: `#33C36B` — track green (available slots)
- `--color-stop`: `#5A2126` — muted brick red (booked slots — deliberately NOT the same red as the brand accent, so booking state never fights brand color)

**Typography**: `Rajdhani` (condensed geometric display, telemetry/HUD feel) for headings and numerals; `Titillium Web` (the actual F1-broadcast-graphics font family) for body copy. Both via `next/font/google`, variable weights, system-ui fallback.

**Signature interaction**: full-screen first-visit ignition sequence (boot text → tachometer sweep to redline → headlight flare → checkered-flag wipe into the hero), gated by `localStorage`, skip-on-tap, collapses to a 400ms fade under `prefers-reduced-motion`. Secondary, restrained motif: thin animated telemetry strip in the nav (live-feeling but decorative), checkered-flag divider used sparingly between sections.

**Sections**: Intro overlay → Nav → Hero (real stats: 4.7★, 49.6K followers, 4 rigs, New Cairo) → About/proof → Simulator lineup (4 rigs, 2 flagged drift-capable) → Modes (F1 / Drift / Highway / Race) → Pricing (200 EGP/30min, 400 EGP/1hr) → **Booking system** (date → time → duration → mode → rig auto-assigned → confirm) → Gallery (drop-in, empty-safe) → Location/Hours/Contact (map, phone, WhatsApp) → Footer.

**Booking backend**: Vercel Blob (first-party JSON store) behind API routes, so availability is real and shared across every visitor/device — not a localStorage demo. A lightweight `/admin` page (passcode-gated) lists and can cancel bookings, since a booking system the owner can't see into isn't actually usable.

## Accessibility & Inclusion

WCAG AA contrast (ink-on-bg and go/stop states all verified at 4.5:1+). Full keyboard support through the booking flow (tab through date/time/mode/confirm, visible focus rings). `prefers-reduced-motion` collapses the intro and kills ambient loops. Booking-state colors are paired with text/icons (not color alone) so colorblind users can read available vs. booked.
