import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/userStore";
import { verifyPassword, DUMMY_PASSWORD_HASH } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { checkRateLimit, clearRateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const password = typeof b.password === "string" ? b.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  // Keyed by email + IP together: an attacker spraying one password across
  // many emails from one IP still gets throttled by the IP half of the key,
  // while a typo-prone legitimate user isn't punished for other people's
  // attempts against the same email from other IPs.
  const rateLimitKey = `login:${email}:${clientIp(req)}`;
  const { limited, retryAfterMs } = await checkRateLimit(rateLimitKey);
  if (limited) {
    return NextResponse.json(
      { error: "Too many attempts — please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const user = await findUserByEmail(email);
  // Same generic message whether the email is unknown or the password is wrong —
  // don't tell an attacker which one they got right. Also run the same scrypt
  // verify either way (against a dummy hash when there's no real user) so the
  // two cases take the same amount of time — otherwise the "unknown email"
  // path returns near-instantly while "wrong password" pays the real scrypt
  // cost, letting an attacker time responses to enumerate valid emails.
  const genericError = "Incorrect email or password.";
  const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
  if (!user || !valid) {
    return NextResponse.json({ error: genericError }, { status: 401 });
  }

  await clearRateLimit(rateLimitKey);

  const token = createSessionToken({ userId: user.id, role: user.role });
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
