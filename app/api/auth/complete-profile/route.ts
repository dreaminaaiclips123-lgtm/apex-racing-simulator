import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { withUsersTransaction, type UserRecord } from "@/lib/userStore";
import { isValidDob, isValidPhone } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const dob = typeof b.dob === "string" ? b.dob : "";
  const phone = typeof b.phone === "string" ? b.phone.trim().slice(0, 30) : "";

  if (!isValidDob(dob)) {
    return NextResponse.json({ error: "Enter a valid date of birth." }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number." }, { status: 400 });
  }

  const outcome = await withUsersTransaction<UserRecord>((users) => {
    const idx = users.findIndex((u) => u.id === session.userId);
    if (idx === -1) return { error: "Account not found." };
    const updated: UserRecord = { ...users[idx], dob, phone };
    const next = [...users];
    next[idx] = updated;
    return { users: next, result: updated };
  });

  if ("error" in outcome) {
    return NextResponse.json({ error: outcome.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
