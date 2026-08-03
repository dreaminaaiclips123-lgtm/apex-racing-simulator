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
          The rotated plane's own edges are hard rectangle boundaries. A prior
          attempt to hide that with mask-image on the 3D-transformed element
          itself was unreliable — mask-image + perspective/rotateX doesn't
          composite consistently across browsers, and the visible result
          varied. Fixed properly with a flat, non-transformed vignette overlay
          instead: a plain radial-gradient div, painted *after* the grid in
          normal 2D space, with zero dependency on how the 3D layer beneath
          it rendered. Solid --color-bg outside the oval hides the top edge
          (horizon) and both left/right edges equally; nothing shows through
          except the oval itself, so there's no hard edge or asymmetry left
          to expose. */}
      {/* ROOT CAUSE of the long-running "grid disappears until I zoom in" bug:
          sub-pixel rasterization. rotateX + perspective foreshortens the plane,
          so a hairline 1px grid line gets scaled *down* with depth. Measured
          with the old values (perspective:30vw, rotateX:78deg), lines fell to
          0.39x scale at the far end — 0.39 device px on a DPR-1 monitor — and
          then got multiplied by opacity-25, leaving ~10% pixel coverage against
          a near-black background. The rasterizer discards that, so the grid is
          simply not painted. Browser zoom raises the device-pixel budget for
          the same CSS px, pushing those lines back over the 1-device-px
          threshold, which is exactly why zooming made it reappear.

          Fix is dimensional, not cosmetic: keep every line >= 1 device px even
          at maximum depth on a DPR-1 screen.
            - perspective 30vw -> 55vw and rotateX 78 -> 74deg, so the worst-case
              depth scale rises from 0.39 to ~0.55
            - line width 1px/2px -> 3px, so worst case is 3 * 0.55 ~= 1.6 device
              px (was 0.39) — comfortably above the threshold
            - opacity 0.25 -> 0.4 to restore the intended look now that the
              lines are no longer being silently thinned away
          Tile size stays 64px so the animation still translates exactly one
          tile per loop. */}
      <div className="absolute inset-0 [perspective:55vw] overflow-hidden">
        <div className="absolute inset-x-[-50%] bottom-[-10%] h-[75%] [transform:rotateX(74deg)] opacity-40 overflow-hidden">
          {/* Extends 64px above its box and translates by exactly one tile
              (transform, not background-position) so the loop is GPU-composited
              instead of repainting every frame — background-position animation
              was a real source of scroll jank on mobile. */}
          <div
            className="absolute inset-x-0 -top-16 h-[calc(100%+64px)] animate-track"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--color-ink) 0 3px, transparent 3px 64px), repeating-linear-gradient(0deg, var(--color-ink) 0 3px, transparent 3px 64px)",
              backgroundSize: "64px 64px, 100% 64px",
            }}
          />
        </div>
        {/* Horizon fade / vignette. Tuned against the *composited pixel
            value* of a grid line, not against coverage percentages — reading
            coverage alone is what made the two previous attempts wrong in
            opposite directions:
              65% radius / transparent 25% -> edges 77% covered, grid erased
              140% radius / transparent 55% -> edges 0% covered, no fade
              75% radius / transparent 45% -> edges faded, but the horizon
                still sat at rgb(50,51,52) against a rgb(10,11,13) page, so
                the plane visibly *ended* rather than receding, i.e. still
                read as "no vignette"
            With these values a line composites to roughly:
              rgb(104,104,103) at the bottom centre  (crisp foreground)
              rgb( 56, 57, 58) at the left/right edges (clear vignette, and
                                 still well above the visibility floor —
                                 lines are 3px / ~1.6 device px here)
              rgb( 14, 15, 17) at the horizon         (dissolves into the
                                 rgb(10,11,13) background) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 85% 60% at 50% 100%, transparent 22%, var(--color-bg) 95%)",
          }}
        />
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
