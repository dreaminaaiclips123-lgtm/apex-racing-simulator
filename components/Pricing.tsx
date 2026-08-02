import { IconCheck } from "@tabler/icons-react";
import { PRICING } from "@/lib/constants";
import Reveal from "./Reveal";

const PLANS = [
  {
    duration: 30,
    price: PRICING[30],
    tag: null,
    perks: ["Any single mode", "1 driver per rig", "Full telemetry after your run"],
  },
  {
    duration: 60,
    price: PRICING[60],
    tag: "Best value",
    perks: ["Any single mode", "Time to actually get quick", "Swap tracks mid-session"],
  },
] as const;

export default function Pricing() {
  return (
    <section id="pricing" className="relative bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="max-w-xl">
          <p className="text-accent-2 text-xs tracking-[0.4em] uppercase mb-4">Pricing</p>
          <h2 className="text-display text-4xl md:text-5xl uppercase text-ink leading-[0.95]">
            One rate. Every mode.
          </h2>
          <p className="mt-5 text-ink-dim text-base md:text-lg">
            F1, Drift, Highway or Race — same price either way. Pay on arrival.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 max-w-2xl">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.duration} delay={i * 0.1}>
              <div
                className={`relative h-full rounded-lg border p-8 ${
                  plan.tag ? "border-accent bg-surface-2" : "border-line bg-surface-2"
                }`}
              >
                {plan.tag && (
                  <span className="absolute -top-3 left-8 rounded-full bg-accent-btn px-3 py-1 text-[10px] uppercase tracking-wide text-ink">
                    {plan.tag}
                  </span>
                )}
                <p className="text-ink-dim uppercase text-sm tracking-wide">
                  {plan.duration} minutes
                </p>
                <p className="text-display text-5xl text-ink mt-2">
                  {plan.price}
                  <span className="text-lg text-ink-dim ml-1">EGP</span>
                </p>
                <ul className="mt-6 space-y-2.5">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-ink-dim">
                      <IconCheck size={16} className="text-go shrink-0" />
                      {perk}
                    </li>
                  ))}
                </ul>
                <a
                  href="#book"
                  className="mt-7 block text-center rounded-md border border-line py-3 text-display uppercase tracking-wide text-ink hover:bg-accent-btn hover:border-accent transition-colors"
                >
                  Book {plan.duration} min
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
