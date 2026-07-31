import { IconGauge, IconHeadset, IconSteeringWheel, IconUsers } from "@tabler/icons-react";
import Reveal from "./Reveal";

const FEATURES = [
  {
    icon: IconSteeringWheel,
    title: "Force-feedback wheels",
    body: "Direct-drive wheels and load-cell pedals — every kerb, lock-up and slide comes through your hands.",
  },
  {
    icon: IconGauge,
    title: "4 multi-mode rigs",
    body: "Every simulator runs F1, Race and Highway. Simulators 03 & 04 are drift-tuned for full-send slides.",
  },
  {
    icon: IconHeadset,
    title: "Immersive setup",
    body: "Wraparound displays, racing seats and real telemetry — built to disappear into the drive.",
  },
  {
    icon: IconUsers,
    title: "Built for the crew",
    body: "Birthdays, corporate nights, or just the squad after work — book simulators side by side.",
  },
];

export default function About() {
  return (
    <section className="relative bg-bg py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="max-w-2xl">
          <p className="text-accent-2 text-xs tracking-[0.4em] uppercase mb-4">Who we are</p>
          <h2 className="text-display text-4xl md:text-5xl uppercase text-ink leading-[0.95]">
            Built for petrolheads,
            <br />
            not tourists
          </h2>
          <p className="mt-6 text-ink-dim text-base md:text-lg">
            We&apos;re Egypt&apos;s go-to place for motorsport lovers — a real garage for
            people who&apos;d rather be behind a wheel than watching one. No arcade
            toys, no queueing. Just professional-grade rigs, real physics, and a
            crowd that gets it.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div className="h-full rounded-lg border border-line bg-surface p-6">
                <f.icon size={26} className="text-accent" />
                <h3 className="text-display text-lg text-ink uppercase mt-4">{f.title}</h3>
                <p className="text-sm text-ink-dim mt-2">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
