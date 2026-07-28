"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteProfileForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dob, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(returnTo);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <form onSubmit={submit} className="w-full max-w-sm rounded-lg border border-line bg-surface p-8">
        <p className="text-display text-accent text-sm tracking-[0.3em] uppercase mb-2">Apex</p>
        <h1 className="text-display text-2xl mb-2">One more thing</h1>
        <p className="text-sm text-ink-dim mb-6">
          We need a couple more details before you can book a slot.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-ink-dim uppercase tracking-wide mb-1.5">
              Date of birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-md border border-line bg-surface-2 px-4 py-3 text-ink outline-none focus:border-accent transition-colors"
            />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full rounded-md border border-line bg-surface-2 px-4 py-3 text-ink outline-none focus:border-accent transition-colors"
          />
        </div>
        {error && <p className="text-stop text-sm mt-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-md bg-accent py-3 text-display uppercase tracking-wide text-ink disabled:opacity-50 transition-opacity"
        >
          {loading ? "Saving…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
