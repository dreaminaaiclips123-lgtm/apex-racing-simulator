import type { Metadata } from "next";
import { Rajdhani, Titillium_Web } from "next/font/google";
import RacingIntro from "@/components/RacingIntro";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { BUSINESS } from "@/lib/constants";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/userStore";
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
  openGraph: {
    title: BUSINESS.name,
    description: BUSINESS.tagline,
    url: BUSINESS.instagramUrl,
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user = session ? await findUserById(session.userId) : null;
  const navSession = user ? { role: user.role, name: user.name } : null;

  return (
    <html
      lang="en"
      className={`${rajdhani.variable} ${titillium.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg">
        <RacingIntro />
        <Nav session={navSession} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
