import { IconBrandInstagram, IconBrandWhatsapp, IconClock, IconMapPin, IconPhone } from "@tabler/icons-react";
import { BUSINESS } from "@/lib/constants";
import Reveal from "./Reveal";

export default function LocationContact() {
  const waHref = `https://wa.me/${BUSINESS.whatsappNumber.replace(/\D/g, "")}`;
  const mapQuery = encodeURIComponent(`${BUSINESS.name}, ${BUSINESS.addressShort}`);

  return (
    <section id="location" className="relative bg-bg py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10 grid gap-12 lg:grid-cols-2 items-start">
        <Reveal>
          <p className="text-accent-2 text-xs tracking-[0.4em] uppercase mb-4">Find us</p>
          <h2 className="text-display text-4xl md:text-5xl uppercase text-ink leading-[0.95] mb-8">
            New Cairo. Every day.
          </h2>

          <div className="space-y-5">
            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-lg border border-line bg-surface p-5 hover:border-accent/50 transition-colors"
            >
              <IconMapPin size={22} className="text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-ink">{BUSINESS.addressShort}</p>
                <p className="text-sm text-ink-dim mt-0.5">Get directions →</p>
              </div>
            </a>

            <div className="flex items-start gap-4 rounded-lg border border-line bg-surface p-5">
              <IconClock size={22} className="text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-ink">Open every day</p>
                <p className="text-sm text-ink-dim mt-0.5 tabular">
                  {BUSINESS.openHour}:00 — {String(BUSINESS.closeHour % 24).padStart(2, "0")}:00
                </p>
              </div>
            </div>

            <a
              href={`tel:${BUSINESS.phoneTel}`}
              className="flex items-start gap-4 rounded-lg border border-line bg-surface p-5 hover:border-accent/50 transition-colors"
            >
              <IconPhone size={22} className="text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-ink tabular">{BUSINESS.phoneDisplay}</p>
                <p className="text-sm text-ink-dim mt-0.5">Call us</p>
              </div>
            </a>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-go/90 px-5 py-3 text-display uppercase tracking-wide text-bg hover:bg-go transition-colors"
              >
                <IconBrandWhatsapp size={18} />
                WhatsApp us
              </a>
              <a
                href={BUSINESS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-line px-5 py-3 text-display uppercase tracking-wide text-ink-dim hover:text-ink hover:border-ink-dim transition-colors"
              >
                <IconBrandInstagram size={18} />
                @{BUSINESS.instagramHandle}
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {/* `relative` + `absolute inset-0` on the iframe, not h-full: a
              plain height:100% needs a *definite* ancestor height, and
              min-h-[480px] (plus items-start on the parent grid, which
              disables stretch) doesn't count as one — the iframe fell back
              to its unstyled intrinsic default (300x150), rendering in the
              corner with the rest of the box blank. */}
          <div className="relative rounded-lg border border-line overflow-hidden h-[420px] lg:h-full lg:min-h-[480px]">
            <iframe
              title="Apex Racing Simulator location"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              className="absolute inset-0 w-full h-full grayscale invert-[92%] contrast-[90%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
