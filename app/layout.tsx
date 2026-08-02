import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Rajdhani, Titillium_Web } from "next/font/google";
import RacingIntro from "@/components/RacingIntro";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { BUSINESS } from "@/lib/constants";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/userStore";
import { INTRO_SEEN_COOKIE } from "@/lib/introCookie";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const titillium = Titillium_Web({
  variable: "--font-titillium",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://apex-racing-simulator.vercel.app"),
  title: `${BUSINESS.name} — ${BUSINESS.tagline}`,
  description:
    "Book a 30-minute or 1-hour slot on Apex's 4 pro racing rigs in New Cairo. F1, Drift, Highway or Race — instant booking, no phone tag.",
  keywords: [
    "racing simulator Cairo",
    "sim racing New Cairo",
    "drift simulator Egypt",
    "Apex Racing Simulator",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: BUSINESS.name,
    description: BUSINESS.tagline,
    url: "/",
    siteName: BUSINESS.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BUSINESS.name,
    description: BUSINESS.tagline,
  },
};

// Deliberately omits aggregateRating — Google requires a real reviewCount
// alongside ratingValue, and we only have the rating itself, not a review
// count we can stand behind. Fabricating one would be worse than omitting it.
const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: BUSINESS.name,
  description: BUSINESS.tagline,
  url: "https://apex-racing-simulator.vercel.app",
  telephone: BUSINESS.phoneTel,
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.addressShort,
    addressLocality: BUSINESS.city,
    addressCountry: "EG",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: `${String(BUSINESS.openHour).padStart(2, "0")}:00`,
    closes: `${String(BUSINESS.closeHour % 24).padStart(2, "0")}:00`,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user = session ? await findUserById(session.userId) : null;
  const navSession = user ? { role: user.role, name: user.name } : null;

  const cookieStore = await cookies();
  const introSeen = cookieStore.get(INTRO_SEEN_COOKIE)?.value === "1";

  return (
    <html
      lang="en"
      className={`${rajdhani.variable} ${titillium.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd) }}
        />
        {/* Gated server-side (not just client-side sessionStorage): the server
            must never emit the video/poster markup for a returning-within-
            session visitor, or the browser paints the poster natively before
            hydration can hide it — that's the "flash" bug on subpage loads. */}
        {!introSeen && <RacingIntro />}
        <Nav session={navSession} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
