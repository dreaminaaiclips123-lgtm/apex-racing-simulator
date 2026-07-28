import Image from "next/image";
import {
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { BUSINESS } from "@/lib/constants";

export default function Footer() {
  const waHref = `https://wa.me/${BUSINESS.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <footer className="grain border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <Image
            src="/logo/apex-logo.png"
            alt="Apex Racing Simulator"
            width={350}
            height={100}
            className="h-9 w-auto mb-3"
          />
          <p className="text-ink-dim text-sm max-w-xs">{BUSINESS.tagline}.</p>
          <div className="flex gap-3 mt-5">
            <a
              href={BUSINESS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2.5 rounded-md border border-line text-ink-dim hover:text-accent hover:border-accent transition-colors"
            >
              <IconBrandInstagram size={20} />
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="p-2.5 rounded-md border border-line text-ink-dim hover:text-accent hover:border-accent transition-colors"
            >
              <IconBrandWhatsapp size={20} />
            </a>
          </div>
        </div>

        <div>
          <p className="text-display text-sm uppercase tracking-[0.2em] text-ink-dim mb-4">
            Find us
          </p>
          <a
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-sm text-ink hover:text-accent transition-colors mb-3"
          >
            <IconMapPin size={18} className="mt-0.5 shrink-0" />
            {BUSINESS.addressShort}
          </a>
          <a
            href={`tel:${BUSINESS.phoneTel}`}
            className="flex items-center gap-2 text-sm text-ink hover:text-accent transition-colors"
          >
            <IconPhone size={18} className="shrink-0" />
            {BUSINESS.phoneDisplay}
          </a>
        </div>

        <div>
          <p className="text-display text-sm uppercase tracking-[0.2em] text-ink-dim mb-4">
            Hours
          </p>
          <p className="text-sm text-ink">Every day</p>
          <p className="text-sm text-ink-dim tabular">
            {BUSINESS.openHour}:00 — 00:00
          </p>
          <a
            href="#book"
            className="inline-block mt-5 rounded-md bg-accent px-5 py-2.5 text-sm text-display uppercase tracking-wide text-ink hover:bg-ink hover:text-bg transition-colors"
          >
            Book a slot
          </a>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-5 flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-ink-faint">
          <p>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</p>
          <p>New Cairo, Egypt</p>
        </div>
      </div>
    </footer>
  );
}
