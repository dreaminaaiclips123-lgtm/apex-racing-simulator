import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/userStore";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

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

  const user = await findUserByEmail(email);
  // Same generic message whether the email is unknown or the password is wrong —
  // don't tell an attacker which one they got right.
  const genericError = "Incorrect email or password.";
  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: genericError }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: genericError }, { status: 401 });
  }

  const token = createSessionToken({ userId: user.id, role: user.role });
  const needsProfile = user.role === "customer" && (!user.dob || !user.phone);
  const res = NextResponse.json({ ok: true, role: user.role, needsProfile });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
