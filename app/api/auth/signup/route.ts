import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { findUserByEmail, withUsersTransaction, type UserRecord } from "@/lib/userStore";
import { hashPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { isValidDob, isValidEmail, isValidPhone } from "@/lib/validation";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 80) : "";
  const dob = typeof b.dob === "string" ? b.dob : "";
  const phone = typeof b.phone === "string" ? b.phone.trim().slice(0, 30) : "";
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const password = typeof b.password === "string" ? b.password : "";
  const agreedToTerms = b.agreedToTerms === true;

  if (!agreedToTerms) {
    return NextResponse.json(
      { error: "You must agree to the Terms of Service and Privacy Policy." },
      { status: 400 }
    );
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "Enter your name." }, { status: 400 });
  }
  if (!isValidDob(dob)) {
    return NextResponse.json({ error: "Enter a valid date of birth." }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  if (await findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const outcome = await withUsersTransaction<UserRecord>((users) => {
    if (users.some((u) => u.email === email)) {
      return { error: "An account with that email already exists." };
    }
    const user: UserRecord = {
      id: randomUUID(),
      email,
      name,
      dob,
      phone,
      passwordHash,
      role: "customer",
      createdAt: new Date().toISOString(),
    };
    return { users: [...users, user], result: user };
  });

  if ("error" in outcome) {
    return NextResponse.json({ error: outcome.error }, { status: 409 });
  }

  const token = createSessionToken({ userId: outcome.result.id, role: "customer" });
  const res = NextResponse.json({ ok: true, role: "customer" });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
