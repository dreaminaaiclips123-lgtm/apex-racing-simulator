import { IconDroplet, IconRoad, IconSteeringWheel, IconTrophy } from "@tabler/icons-react";
import { MODE_ORDER, MODES } from "@/lib/constants";
import Reveal from "./Reveal";

const ICONS = {
  f1: IconSteeringWheel,
  drift: IconDroplet,
  highway: IconRoad,
  race: IconTrophy,
} as const;

export default function Modes() {
  return (
    <section id="modes" className="relative bg-bg py-24 md:py-32 grain">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="max-w-xl">
          <p className="text-accent-2 text-xs tracking-[0.4em] uppercase mb-4">Pick your line</p>
          <h2 className="text-display text-4xl md:text-5xl uppercase text-ink leading-[0.95]">
            Four ways to drive
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {MODE_ORDER.map((key, i) => {
            const mode = MODES[key];
            const Icon = ICONS[key];
            return (
              <Reveal key={key} delay={i * 0.08}>
                <div className="group h-full rounded-lg border border-line bg-surface p-7 flex items-start gap-5 hover:border-accent/50 transition-colors">
                  <div className="shrink-0 rounded-md bg-surface-2 p-3.5 text-accent group-hover:bg-accent-btn group-hover:text-ink transition-colors">
                    <Icon size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-display text-2xl uppercase text-ink">{mode.label}</h3>
                      {mode.driftOnly && (
                        <span className="text-[10px] uppercase tracking-wide text-accent-2 border border-accent-2/40 rounded-full px-2 py-0.5">
                          Simulators 03 · 04 only
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-ink-dim mt-2">{mode.blurb}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
