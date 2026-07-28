import { NextRequest, NextResponse } from "next/server";
import { findOrCreateOAuthUser, OAUTH_STATE_COOKIE, OAUTH_RETURN_COOKIE, safeReturnTo } from "@/lib/oauth";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", req.url));
  }

  const redirectUri = new URL("/api/auth/google/callback", req.url).toString();

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
  const { access_token: accessToken } = (await tokenRes.json()) as { access_token?: string };
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!profileRes.ok) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
  const profile = (await profileRes.json()) as { sub: string; email?: string; name?: string };
  if (!profile.email) {
    return NextResponse.redirect(new URL("/login?error=oauth_no_email", req.url));
  }

  const user = await findOrCreateOAuthUser({
    provider: "google",
    providerAccountId: profile.sub,
    email: profile.email,
    name: profile.name ?? profile.email,
  });

  const needsProfile = !user.dob || !user.phone;
  const returnTo = safeReturnTo(req.cookies.get(OAUTH_RETURN_COOKIE)?.value ?? null);
  const destination = needsProfile
    ? `/complete-profile${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`
    : returnTo || "/my-bookings";

  const token = createSessionToken({ userId: user.id, role: user.role });
  const res = NextResponse.redirect(new URL(destination, req.url));
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  res.cookies.delete(OAUTH_STATE_COOKIE);
  res.cookies.delete(OAUTH_RETURN_COOKIE);
  return res;
}
