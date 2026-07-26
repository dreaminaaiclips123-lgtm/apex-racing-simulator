"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-lg border border-line bg-surface p-8"
      >
        <p className="text-display text-accent text-sm tracking-[0.3em] uppercase mb-2">
          Apex / Staff
        </p>
        <h1 className="text-display text-2xl mb-6">Admin access</h1>
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          autoFocus
          className="w-full rounded-md border border-line bg-surface-2 px-4 py-3 text-ink outline-none focus:border-accent transition-colors"
        />
        {error && <p className="text-stop text-sm mt-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-md bg-accent py-3 text-display uppercase tracking-wide text-ink disabled:opacity-50 transition-opacity"
        >
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}
