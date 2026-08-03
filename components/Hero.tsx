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
      {/* perspective track-grid horizon, ambient.
          This used to be a live CSS perspective+rotateX transform squeezing a
          hairline repeating-linear-gradient. That combination is what caused
          six rounds of this breaking in different ways: squeezing a thin
          gradient stripe through a real 3D transform pushes every browser
          into its own sub-pixel rounding/antialiasing behaviour, and Chrome
          (Skia) vs Safari (WebKit/CoreGraphics) round that differently — no
          line-width/perspective number is safe against both at once, which is
          why tuning it for one engine kept re-breaking it for the other (plus
          browser zoom and DPR, which shift the same rounding again).

          Replaced with a static SVG (public/images/hero-grid.svg) — the
          converging-perspective look is pre-computed at build time (a
          harmonic row-spacing formula, not a live 3D transform), and every
          line uses vector-effect="non-scaling-stroke", which fixes stroke
          width in actual rendered pixels regardless of how much
          background-size scales the image. There is no per-viewport or
          per-engine number left to get wrong — this is a stable, long-
          supported SVG 1.1 feature, not a 3D-transform corner case. */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Sized/positioned so it sits below the headline instead of
            climbing into it — the static SVG has a much bolder, more
            uniform brightness than the old faint hairline-gradient version,
            so it needs a shorter box and a lighter vignette or it reads as
            "washed out" instead of "faded at the horizon". */}
        <div
          className="absolute inset-x-0 bottom-[-8%] h-[52%] opacity-45"
          style={{
            backgroundImage: "url(/images/hero-grid.svg)",
            backgroundSize: "100% 100%",
            backgroundPosition: "bottom center",
            backgroundRepeat: "no-repeat",
          }}
        />
        {/* Horizon fade / vignette, retuned for the new image's own box
            (h-52%, not h-75%) and brightness. Lighter than the previous
            grid's vignette needed to be, since the SVG's own convergence
            (thin, sparse far rows vs thick, dense near rows) already carries
            most of the "fades into the distance" read on its own — this
            gradient's job now is mainly to soften the top edge into the text
            area and taper the left/right edges, not to do all the fading
            work by itself. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 100%, transparent 40%, var(--color-bg) 100%)",
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
