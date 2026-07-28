import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeReturnTo } from "@/lib/validation";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

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
