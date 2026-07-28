import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { OAUTH_STATE_COOKIE, OAUTH_STATE_MAX_AGE, OAUTH_RETURN_COOKIE, safeReturnTo } from "@/lib/oauth";

export async function GET(req: NextRequest) {
  const clientId = process.env.FACEBOOK_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=facebook_not_configured", req.url));
  }

  const state = randomBytes(16).toString("hex");
  const returnTo = safeReturnTo(req.nextUrl.searchParams.get("returnTo"));
  const redirectUri = new URL("/api/auth/facebook/callback", req.url).toString();

  const authUrl = new URL("https://www.facebook.com/v19.0/dialog/oauth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("scope", "email,public_profile");

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_STATE_MAX_AGE,
  });
  if (returnTo) {
    res.cookies.set(OAUTH_RETURN_COOKIE, returnTo, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: OAUTH_STATE_MAX_AGE,
    });
  }
  return res;
}
