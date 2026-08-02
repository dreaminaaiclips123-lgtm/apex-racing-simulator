import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Terms of Service — ${BUSINESS.name}`,
  description: `Terms of Service for booking and using ${BUSINESS.name}.`,
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "31 July 2026";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="text-display text-accent text-sm tracking-[0.3em] uppercase mb-2">
        {BUSINESS.name}
      </p>
      <h1 className="text-display text-3xl mb-2">Terms of Service</h1>
      <p className="text-ink-dim text-sm mb-10">Last updated: {LAST_UPDATED}</p>

      <div className="space-y-8 text-ink-dim leading-relaxed">
        <section>
          <h2 className="text-display text-ink text-lg mb-2">1. Who we are</h2>
          <p>
            {BUSINESS.name} ({BUSINESS.tagline}) operates a racing simulator venue at{" "}
            {BUSINESS.addressShort}. These Terms govern your use of our website, your account,
            and any booking you make with us, whether online or in person.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">2. Accounts</h2>
          <p>
            You must create an account to make a booking. You agree to provide accurate
            information (name, date of birth, phone number, email) and to keep your login
            credentials confidential. You're responsible for activity that happens under your
            account. Tell us right away if you suspect unauthorized access.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">3. Bookings, rigs & availability</h2>
          <p>
            Bookings are for a specific rig and time slot (30 or 60 minutes) and are confirmed
            only once our system accepts the request — a rig cannot be double-booked for the same
            slot. Drift-tuned rigs are limited in number and reserved preferentially for drift
            sessions; we may substitute an equivalent non-drift rig for non-drift bookings when
            needed. Prices shown at time of booking (currently 200/400 EGP for 30/60 minutes) are
            in Egyptian Pounds and may change for future bookings.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">4. Cancellations</h2>
          <p>
            You can cancel a booking from your account up until 6 hours before the session start
            time. Cancellations inside that 6-hour window are not permitted through the site —
            contact us directly at {BUSINESS.phoneDisplay} if something urgent comes up.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">5. Conduct & safety</h2>
          <p>
            Our rigs are physical equipment shared between customers. Please treat the equipment
            with care, follow staff instructions, and arrive on time — late arrival may shorten
            your session. We reserve the right to end a session early or refuse service for
            behavior that risks the safety of guests, staff, or equipment.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">6. Liability</h2>
          <p>
            You use our simulators and premises at your own risk. To the extent permitted by law,
            {" " + BUSINESS.name} is not liable for indirect or consequential loss arising from
            your visit or booking, except where such liability cannot be excluded by law.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">7. Changes to these Terms</h2>
          <p>
            We may update these Terms from time to time to reflect changes to our booking system
            or venue policies. Continued use of your account after an update means you accept the
            revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">8. Contact</h2>
          <p>
            Questions about these Terms? Reach us at {BUSINESS.phoneDisplay} (
            <a
              href={`https://wa.me/${BUSINESS.whatsappNumber.replace("+", "")}`}
              className="text-accent hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            ) or visit us at {BUSINESS.addressShort}.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-line">
        <Link href="/privacy" className="text-accent text-sm hover:underline">
          Read our Privacy Policy →
        </Link>
      </div>
    </div>
  );
}
