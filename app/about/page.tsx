import type { Metadata } from "next";
import { IconSteeringWheel } from "@tabler/icons-react";
import Reveal from "@/components/Reveal";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: `About Us — ${BUSINESS.name}`,
  description: `Meet the founders and leadership behind ${BUSINESS.name}.`,
};

const TEAM = [
  {
    name: "Yehia Rashdan",
    role: "Co-Founder",
    bio: "Yehia co-founded Apex to bring pro-grade sim racing to New Cairo — built on a lifelong love of motorsport and a belief that world-class racing simulation shouldn't be out of reach. He shapes the vision behind Apex, from the rigs on the floor to the experience every driver walks away with.",
  },
  {
    name: "Ahmed El Wakil",
    role: "Co-Founder",
    bio: "Ahmed co-founded Apex alongside Yehia, bringing the same obsession with getting the details right — the feel of the wheel, the setup of every rig, the atmosphere of the garage itself. He's focused on making sure Apex feels like a real racing venue, not an arcade.",
  },
  {
    name: "Khalaf",
    role: "Managing Director",
    bio: "Khalaf runs the day-to-day at Apex — keeping the rigs running, the bookings moving, and the experience consistent for every driver who walks through the door.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-bg">
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <div
          className="absolute left-1/2 top-0 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-20 blur-[120px]"
          style={{ background: "var(--color-accent)" }}
        />
        <div className="relative mx-auto max-w-3xl px-6 md:px-10 text-center">
          <Reveal>
            <p className="text-accent-2 text-xs tracking-[0.4em] uppercase mb-4">About us</p>
            <h1 className="text-display text-4xl md:text-6xl uppercase text-ink leading-[0.95]">
              The people behind
              <br />
              <span className="text-accent">Apex</span>
            </h1>
            <p className="mt-6 text-ink-dim text-base md:text-lg">
              {BUSINESS.tagline}. Here's who built it and who keeps it running.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative pb-24 md:pb-32">
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <div className="grid gap-6 md:grid-cols-3">
            {TEAM.map((person, i) => (
              <Reveal key={person.name} delay={i * 0.08} className="h-full">
                <div className="h-full rounded-lg border border-line bg-surface p-6 flex flex-col">
                  <div className="h-12 w-12 rounded-full bg-surface-2 border border-line flex items-center justify-center text-accent shrink-0">
                    <IconSteeringWheel size={22} />
                  </div>
                  <h2 className="text-display text-xl text-ink uppercase mt-5">{person.name}</h2>
                  <p className="text-accent-2 text-xs uppercase tracking-[0.2em] mt-1">
                    {person.role}
                  </p>
                  <p className="text-sm text-ink-dim mt-4 leading-relaxed">{person.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
