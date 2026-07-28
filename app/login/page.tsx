import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { OAUTH_PROVIDERS } from "@/lib/oauth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/my-bookings");
  }

  const { returnTo, error } = await searchParams;

  return (
    <LoginForm
      googleEnabled={OAUTH_PROVIDERS.google.enabled()}
      facebookEnabled={OAUTH_PROVIDERS.facebook.enabled()}
      returnTo={returnTo ?? null}
      oauthError={error ?? null}
    />
  );
}
