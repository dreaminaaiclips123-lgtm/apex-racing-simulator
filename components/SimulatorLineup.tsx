import { IconDroplet, IconFlagFilled } from "@tabler/icons-react";
import { MODE_ORDER, MODES, SIMULATORS } from "@/lib/constants";
import Reveal from "./Reveal";

export default function SimulatorLineup() {
  return (
    <section id="simulators" className="relative bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="max-w-xl">
          <p className="text-accent-2 text-xs tracking-[0.4em] uppercase mb-4">The lineup</p>
          <h2 className="text-display text-4xl md:text-5xl uppercase text-ink leading-[0.95]">
            4 bays. Your call.
          </h2>
          <p className="mt-5 text-ink-dim text-base md:text-lg">
            Every bay runs F1, Race and Highway. Bays 03 &amp; 04 are our drift-tuned
            rigs — book one specifically if sideways is the plan.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SIMULATORS.map((rig, i) => (
            <Reveal key={rig.id} delay={i * 0.08}>
              <div
                className={`relative h-full rounded-lg border p-6 overflow-hidden transition-colors ${
                  rig.driftCapable
                    ? "border-accent/40 bg-gradient-to-b from-accent-dim/30 to-surface-2"
                    : "border-line bg-surface-2"
                }`}
              >
                {rig.driftCapable && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[10px] uppercase tracking-wide text-accent-2">
                    <IconDroplet size={12} />
                    Drift
                  </span>
                )}
                <IconFlagFilled size={20} className="text-ink-faint" />
                <p className="text-display text-4xl text-ink mt-4">
                  {String(rig.id).padStart(2, "0")}
                </p>
                <p className="text-xs uppercase tracking-[0.25em] text-ink-dim mt-1">
                  {rig.name}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {MODE_ORDER.filter((m) => !MODES[m].driftOnly || rig.driftCapable).map(
                    (m) => (
                      <span
                        key={m}
                        className="text-[11px] uppercase tracking-wide rounded border border-line px-2 py-1 text-ink-dim"
                      >
                        {MODES[m].short}
                      </span>
                    )
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
