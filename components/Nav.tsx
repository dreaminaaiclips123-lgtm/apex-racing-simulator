"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { BUSINESS } from "@/lib/constants";

const LINKS = [
  { href: "#simulators", label: "Rigs" },
  { href: "#modes", label: "Modes" },
  { href: "#pricing", label: "Pricing" },
  { href: "#location", label: "Find us" },
];

const TICKER_ITEMS = [
  "4 RIGS",
  "2 DRIFT SIMULATORS",
  `${BUSINESS.googleRating}★ RATED`,
  `${BUSINESS.instagramFollowers} FOLLOWERS`,
  "NEW CAIRO",
  `OPEN ${BUSINESS.openHour}:00 – 00:00`,
];

export interface NavSession {
  role: "customer" | "admin";
  name: string;
}

export default function Nav({ session }: { session: NavSession | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  const accountHref = session?.role === "admin" ? "/admin" : "/my-bookings";
  const accountLabel = session?.role === "admin" ? "Admin" : "My Bookings";

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="hidden md:block overflow-hidden border-b border-line bg-bg/95 text-[11px] tracking-[0.25em] text-ink-faint">
        <div className="flex animate-marquee whitespace-nowrap py-1.5">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="mx-6 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-accent" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`transition-colors duration-300 ${
          scrolled ? "bg-bg/90 backdrop-blur border-b border-line" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto max-w-7xl px-6 md:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center cursor-pointer">
            <Image
              src="/logo/apex-logo.png"
              alt="Apex Racing Simulator"
              width={350}
              height={100}
              priority
              className="h-7 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-ink-dim hover:text-ink transition-colors uppercase tracking-wide"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={session ? accountHref : "/login"}
              className="hidden sm:inline text-sm text-ink-dim hover:text-ink transition-colors uppercase tracking-wide"
            >
              {session ? accountLabel : "Log in"}
            </a>
            {session && (
              <button
                onClick={logout}
                className="hidden sm:inline text-sm text-ink-dim hover:text-ink transition-colors uppercase tracking-wide"
              >
                Log out
              </button>
            )}
            <a
              href="#book"
              className="hidden sm:inline-flex items-center rounded-md bg-accent px-5 py-2.5 text-sm text-display uppercase tracking-wide text-ink hover:bg-ink hover:text-bg transition-colors"
            >
              Book a slot
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              className="md:hidden text-ink p-2"
              aria-label="Toggle menu"
            >
              {open ? <IconX size={22} /> : <IconMenu2 size={22} />}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div className="md:hidden bg-bg border-b border-line px-6 py-4 flex flex-col gap-4">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-ink-dim hover:text-ink uppercase tracking-wide text-sm"
            >
              {l.label}
            </a>
          ))}
          <a
            href={session ? accountHref : "/login"}
            onClick={() => setOpen(false)}
            className="text-ink-dim hover:text-ink uppercase tracking-wide text-sm"
          >
            {session ? accountLabel : "Log in"}
          </a>
          {session && (
            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="text-left text-ink-dim hover:text-ink uppercase tracking-wide text-sm"
            >
              Log out
            </button>
          )}
          <a
            href="#book"
            onClick={() => setOpen(false)}
            className="rounded-md bg-accent px-5 py-3 text-center text-display uppercase tracking-wide text-ink"
          >
            Book a slot
          </a>
        </div>
      )}
    </header>
  );
}
