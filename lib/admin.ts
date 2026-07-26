import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "apex_admin_session";

export function expectedAdminToken(): string | null {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) return null;
  return createHash("sha256").update(`apex-admin:${passcode}`).digest("hex");
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  const expected = expectedAdminToken();
  if (!expected || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
