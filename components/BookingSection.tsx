import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/userStore";
import Reveal from "./Reveal";
import BookingSystem from "./BookingSystem";

export default async function BookingSection() {
  const session = await getSession();
  const user = session?.role === "customer" ? await findUserById(session.userId) : null;

  return (
    <section id="book" className="relative bg-bg py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <Reveal className="text-center max-w-xl mx-auto mb-12">
          <p className="text-accent-2 text-xs tracking-[0.4em] uppercase mb-4">Book now</p>
          <h2 className="text-display text-4xl md:text-5xl uppercase text-ink leading-[0.95]">
            Lock in your bay
          </h2>
          <p className="mt-5 text-ink-dim text-base md:text-lg">
            Real-time availability across all 4 rigs — book instantly, no phone
            tag.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <BookingSystem customerName={user?.name ?? null} />
        </Reveal>
      </div>
    </section>
  );
}
