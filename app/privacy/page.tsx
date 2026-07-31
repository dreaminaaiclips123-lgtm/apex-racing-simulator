import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Privacy Policy — ${BUSINESS.name}`,
  description: `How ${BUSINESS.name} collects, uses, and protects your information.`,
};

const LAST_UPDATED = "31 July 2026";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="text-display text-accent text-sm tracking-[0.3em] uppercase mb-2">
        {BUSINESS.name}
      </p>
      <h1 className="text-display text-3xl mb-2">Privacy Policy</h1>
      <p className="text-ink-dim text-sm mb-10">Last updated: {LAST_UPDATED}</p>

      <div className="space-y-8 text-ink-dim leading-relaxed">
        <section>
          <h2 className="text-display text-ink text-lg mb-2">1. Information we collect</h2>
          <p>
            When you create an account or make a booking with {BUSINESS.name}, we collect:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Your full name, date of birth, phone number, and email address</li>
            <li>A securely hashed version of your password (we never store it in plain text)</li>
            <li>Your booking history — rig, mode, date, time, and duration</li>
          </ul>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">2. How we use your information</h2>
          <p>We use the information you give us to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Create and secure your account, and let you log in</li>
            <li>Process, confirm, and manage your bookings — including preventing double-bookings</li>
            <li>Contact you about a booking (e.g. by phone or WhatsApp) if something changes</li>
            <li>Let you view and cancel your own upcoming bookings</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal information, and we do not use it for advertising.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">3. Where your data is stored</h2>
          <p>
            Account and booking records are stored in encrypted cloud storage (Vercel Blob).
            Passwords are hashed with scrypt before storage — even we can't read your actual
            password. Access to admin tools is restricted to authenticated staff accounts.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">4. Sharing</h2>
          <p>
            We don't share your personal information with third parties, except where required
            by law or where necessary to operate our booking and hosting infrastructure (e.g. our
            cloud storage provider, which processes data on our behalf and does not use it for
            its own purposes).
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">5. Your choices</h2>
          <p>
            You can view your booking history at any time from your account, and cancel upcoming
            bookings (outside the 6-hour cancellation window). To request a copy of your data, or
            to ask us to delete your account and associated data, contact us using the details
            below.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">6. Cookies</h2>
          <p>
            We use a small number of essential cookies: one to keep you signed in, and one to
            remember that you've already seen our intro video so it doesn't replay on every page.
            We don't use tracking or advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">7. Changes to this policy</h2>
          <p>
            We may update this policy as our booking system evolves. We'll update the "last
            updated" date above when we do.
          </p>
        </section>

        <section>
          <h2 className="text-display text-ink text-lg mb-2">8. Contact</h2>
          <p>
            Questions about your data? Reach us at {BUSINESS.phoneDisplay} (
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
        <Link href="/terms" className="text-accent text-sm hover:underline">
          Read our Terms of Service →
        </Link>
      </div>
    </div>
  );
}
