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

  const clientId = process.env.FACEBOOK_CLIENT_ID;
  const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=facebook_not_configured", req.url));
  }

  const redirectUri = new URL("/api/auth/facebook/callback", req.url).toString();

  const tokenUrl = new URL("https://graph.facebook.com/v19.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", clientId);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("client_secret", clientSecret);
  tokenUrl.searchParams.set("code", code);

  const tokenRes = await fetch(tokenUrl);
  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
  const { access_token: accessToken } = (await tokenRes.json()) as { access_token?: string };
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }

  const profileUrl = new URL("https://graph.facebook.com/me");
  profileUrl.searchParams.set("fields", "id,name,email");
  profileUrl.searchParams.set("access_token", accessToken);

  const profileRes = await fetch(profileUrl);
  if (!profileRes.ok) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
  const profile = (await profileRes.json()) as { id: string; email?: string; name?: string };
  if (!profile.email) {
    return NextResponse.redirect(new URL("/login?error=oauth_no_email", req.url));
  }

  const user = await findOrCreateOAuthUser({
    provider: "facebook",
    providerAccountId: profile.id,
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
