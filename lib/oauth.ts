import { randomUUID } from "crypto";
import { withUsersTransaction, type UserRecord } from "@/lib/userStore";

export const OAUTH_STATE_COOKIE = "apex_oauth_state";
export const OAUTH_RETURN_COOKIE = "apex_oauth_return";
export const OAUTH_STATE_MAX_AGE = 300; // 5 minutes — just long enough for the redirect round trip

/** Only accept same-site relative paths — never redirect to an attacker-supplied external URL. */
export function safeReturnTo(value: string | null): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export const OAUTH_PROVIDERS = {
  google: {
    enabled: () => Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  },
  facebook: {
    enabled: () => Boolean(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET),
  },
} as const;

/**
 * Finds an existing account by email (Google/Facebook both return
 * provider-verified emails, so email is a safe join key here) or creates a
 * new customer account. An OAuth sign-in never overwrites an existing
 * account's provider — it just authenticates into whichever account owns
 * that email address, same as most "Sign in with Google" flows.
 */
export async function findOrCreateOAuthUser(params: {
  provider: "google" | "facebook";
  providerAccountId: string;
  email: string;
  name: string;
}): Promise<UserRecord> {
  const email = params.email.toLowerCase();
  const outcome = await withUsersTransaction<UserRecord>((users) => {
    const existing = users.find((u) => u.email === email);
    if (existing) return { users, result: existing };
    const user: UserRecord = {
      id: randomUUID(),
      email,
      name: params.name,
      dob: "",
      phone: "",
      passwordHash: null,
      provider: params.provider,
      providerAccountId: params.providerAccountId,
      role: "customer",
      createdAt: new Date().toISOString(),
    };
    return { users: [...users, user], result: user };
  });
  if ("error" in outcome) {
    throw new Error(outcome.error);
  }
  return outcome.result;
}
