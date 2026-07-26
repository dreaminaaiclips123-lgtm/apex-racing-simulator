import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import type { BookingRecord } from "./booking";

const PATHNAME = "bookings/store.json";
const MAX_RETRIES = 5;

interface StoreData {
  bookings: BookingRecord[];
}

interface LoadedStore {
  data: StoreData;
  etag: string | null;
}

async function loadStore(): Promise<LoadedStore> {
  // useCache:false — booking data must be strongly consistent; a CDN-cached
  // read could show a slot as open moments after someone else took it.
  const result = await get(PATHNAME, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) {
    return { data: { bookings: [] }, etag: null };
  }
  const text = await new Response(result.stream).text();
  const data = JSON.parse(text) as StoreData;
  return { data, etag: result.blob.etag };
}

export async function readBookings(): Promise<BookingRecord[]> {
  const { data } = await loadStore();
  return data.bookings;
}

type MutateResult<T> = { bookings: BookingRecord[]; result: T } | { error: string };

/**
 * Read-modify-write against the shared Blob store using ETag compare-and-swap,
 * so two customers booking at the same instant can't both win the same rig.
 * `mutate` re-runs from scratch on every retry against the freshest data.
 */
export async function withBookingsTransaction<T>(
  mutate: (bookings: BookingRecord[]) => MutateResult<T>
): Promise<{ result: T } | { error: string }> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const { data, etag } = await loadStore();
    const outcome = mutate(data.bookings);
    if ("error" in outcome) return outcome;

    try {
      await put(PATHNAME, JSON.stringify({ bookings: outcome.bookings }), {
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
      if (isConflict) return { error: "This slot just got busy — please try another time." };
      throw err;
    }
  }
  return { error: "Could not save your booking — please try again." };
}
