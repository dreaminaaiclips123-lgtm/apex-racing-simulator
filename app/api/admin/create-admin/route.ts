import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/session";
import { findUserByEmail, withUsersTransaction, type UserRecord } from "@/lib/userStore";
import { hashPassword } from "@/lib/password";
import { isValidEmail } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 80) : "";
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  const password = typeof b.password === "string" ? b.password : "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Enter a name." }, { status: 400 });
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
      dob: "",
      phone: "",
      passwordHash,
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    return { users: [...users, user], result: user };
  });

  if ("error" in outcome) {
    return NextResponse.json({ error: outcome.error }, { status: 409 });
  }

  return NextResponse.json({ ok: true });
}
