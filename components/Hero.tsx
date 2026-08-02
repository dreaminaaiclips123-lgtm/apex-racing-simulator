import { IconStarFilled } from "@tabler/icons-react";
import { BUSINESS } from "@/lib/constants";

const STATS = [
  { value: `${BUSINESS.googleRating}`, label: "Google rating" },
  { value: `${BUSINESS.closeHour - BUSINESS.openHour}`, label: "Hours open daily" },
  { value: "4", label: "Racing rigs" },
  { value: "2", label: "Drift simulators" },
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-bg pt-28 pb-12"
    >
      {/* perspective track-grid horizon, ambient — pauses under prefers-reduced-motion globally.
          The rotated plane's own edges are hard rectangle boundaries — without
          a mask the grid just starts abruptly mid-screen and any edge/tiling
          seam shows as a visible cut, worst on the right. A radial mask
          anchored at the bottom-center fades it out toward the top (so it
          reads as receding into the distance, not popping in) and toward
          both left/right edges at once (so there's no hard edge to see). */}
      <div className="absolute inset-0 [perspective:300px] overflow-hidden">
        <div
          className="absolute inset-x-[-50%] bottom-[-10%] h-[75%] [transform:rotateX(78deg)] opacity-25 overflow-hidden"
          style={{
            // Sized in vw, not %: the box this mask paints on is 200vw wide
            // (inset-x-[-50%] on purpose, for perspective headroom), so a
            // percentage-based radius here is a percentage of 200vw, not of
            // the viewport — a "75%" radius was actually 150vw, which barely
            // reached the visible ±50vw window at all and left the right
            // side effectively unmasked/untouched (looked "missing" there).
            maskImage: "radial-gradient(60vw 100% at 50% 100%, black 55%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(60vw 100% at 50% 100%, black 55%, transparent 100%)",
          }}
        >
          {/* Extends 64px above its box and translates by exactly one tile
              (transform, not background-position) so the loop is GPU-composited
              instead of repainting every frame — background-position animation
              was a real source of scroll jank on mobile. */}
          <div
            className="absolute inset-x-0 -top-16 h-[calc(100%+64px)] animate-track"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--color-ink) 0 1px, transparent 1px 64px), repeating-linear-gradient(0deg, var(--color-ink) 0 2px, transparent 2px 64px)",
              backgroundSize: "64px 64px, 100% 64px",
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/40 to-bg" />
      </div>

      <div
        className="absolute left-1/2 top-[38%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[120px]"
        style={{ background: "var(--color-accent)" }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-6 md:px-10 text-center">
        <p
          className="animate-fade-in-up text-accent-2 text-xs md:text-sm tracking-[0.4em] uppercase mb-5"
          style={{ animationDelay: "0s" }}
        >
          Where New Cairo Comes To Race
        </p>

        {/* Plain element, not motion.h1 — this is the page's LCP candidate.
            Framer Motion server-renders `initial` as inline opacity:0, and
            Chrome's LCP algorithm excludes zero-opacity elements from being
            recorded at all, so LCP ends up tied to hydration time instead of
            first paint. It's the largest thing on screen; it should just be
            there immediately. */}
        <h1 className="text-display text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.92] uppercase text-ink">
          Feel the
          <br />
          <span className="text-accent">Apex</span>
        </h1>

        <p
          className="animate-fade-in-up mt-6 max-w-xl mx-auto text-ink-dim text-base md:text-lg"
          style={{ animationDelay: "0.2s" }}
        >
          {BUSINESS.tagline}. Four pro-grade rigs, real racing feel, zero waiting
          on hold. Pick F1, Drift, Highway or Race — and lock your simulator in.
        </p>

        <div
          className="animate-fade-in-up mt-9 flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animationDelay: "0.3s" }}
        >
          <a
            href="#book"
            className="w-full sm:w-auto rounded-md bg-accent-btn px-8 py-4 text-display uppercase tracking-wide text-ink hover:bg-ink hover:text-bg transition-colors"
          >
            Book a slot
          </a>
          <a
            href="#simulators"
            className="w-full sm:w-auto rounded-md border border-line px-8 py-4 text-display uppercase tracking-wide text-ink-dim hover:text-ink hover:border-ink transition-colors"
          >
            See the rigs
          </a>
        </div>

        <div
          className="animate-fade-in-up mt-14 max-w-2xl mx-auto"
          style={{ animationDelay: "0.45s" }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-display text-2xl md:text-3xl text-ink flex items-center justify-center gap-1">
                  {s.label === "Google rating" && (
                    <IconStarFilled size={18} className="text-accent-2" />
                  )}
                  {s.value}
                </p>
                <p className="text-[11px] text-ink-faint uppercase tracking-wide mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
