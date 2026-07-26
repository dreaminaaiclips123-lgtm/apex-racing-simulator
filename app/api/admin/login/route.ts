import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { ADMIN_COOKIE, expectedAdminToken } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const configured = process.env.ADMIN_PASSCODE;
  if (!configured) {
    return NextResponse.json({ error: "Admin access isn't configured yet." }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }
  const passcode = (body as { passcode?: unknown })?.passcode;
  if (typeof passcode !== "string" || passcode.length === 0) {
    return NextResponse.json({ error: "Enter the passcode." }, { status: 400 });
  }

  const a = Buffer.from(passcode);
  const b = Buffer.from(configured);
  const matches = a.length === b.length && timingSafeEqual(a, b);
  if (!matches) {
    return NextResponse.json({ error: "Wrong passcode." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, expectedAdminToken()!, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
