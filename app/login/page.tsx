import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeReturnTo } from "@/lib/validation";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Log In or Sign Up — Apex Racing Simulator",
  description: "Log in or create an account to book a racing simulator slot at Apex.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/my-bookings");
  }

  const { returnTo } = await searchParams;

  return <LoginForm returnTo={safeReturnTo(returnTo ?? null)} />;
}
