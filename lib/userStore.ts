import { get, put, BlobPreconditionFailedError } from "@vercel/blob";

const PATHNAME = "users/store.json";
const MAX_RETRIES = 5;

export type AuthProvider = "credentials" | "google" | "facebook";
export type UserRole = "customer" | "admin";

export interface UserRecord {
  id: string;
  email: string; // stored lowercase
  name: string;
  dob: string; // "YYYY-MM-DD" — empty until an OAuth signup completes their profile
  phone: string; // empty until an OAuth signup completes their profile
  passwordHash: string | null; // null for OAuth-only accounts
  provider: AuthProvider;
  providerAccountId: string | null;
  role: UserRole;
  createdAt: string;
}

interface StoreData {
  users: UserRecord[];
}

interface LoadedStore {
  data: StoreData;
  etag: string | null;
}

async function loadStore(): Promise<LoadedStore> {
  // useCache:false — auth reads (email lookup, session hydration) must be
  // strongly consistent, same reasoning as the bookings store.
  const result = await get(PATHNAME, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) {
    return { data: { users: [] }, etag: null };
  }
  const text = await new Response(result.stream).text();
  const data = JSON.parse(text) as StoreData;
  return { data, etag: result.blob.etag };
}

export async function readUsers(): Promise<UserRecord[]> {
  const { data } = await loadStore();
  return data.users;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const lower = email.toLowerCase();
  const users = await readUsers();
  return users.find((u) => u.email === lower) ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const users = await readUsers();
  return users.find((u) => u.id === id) ?? null;
}

type MutateResult<T> = { users: UserRecord[]; result: T } | { error: string };

/** Same ETag compare-and-swap pattern as lib/store.ts, applied to the user collection. */
export async function withUsersTransaction<T>(
  mutate: (users: UserRecord[]) => MutateResult<T>
): Promise<{ result: T } | { error: string }> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { data, etag } = await loadStore();
    const outcome = mutate(data.users);
    if ("error" in outcome) return outcome;

    try {
      await put(PATHNAME, JSON.stringify({ users: outcome.users }), {
        access: "private",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
        ...(etag ? { ifMatch: etag } : {}),
      });
      return { result: outcome.result };
    } catch (err) {
      const isConflict = err instanceof BlobPreconditionFailedError;
      if (isConflict && attempt < MAX_RETRIES - 1) continue;
      if (isConflict) return { error: "Please try again." };
      throw err;
    }
  }
  return { error: "Could not save — please try again." };
}
