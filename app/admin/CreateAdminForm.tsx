"use client";

import { useState } from "react";

export default function CreateAdminForm({
  onDone,
  onCreated,
}: {
  onDone: () => void;
  onCreated?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSuccess(true);
      setName("");
      setEmail("");
      setPassword("");
      onCreated?.();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-line bg-surface-2 p-5 mb-8 grid gap-3 sm:grid-cols-4"
    >
      <label htmlFor="admin-name" className="sr-only">
        Name
      </label>
      <input
        id="admin-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        autoComplete="name"
        required
        className="rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent transition-colors"
      />
      <label htmlFor="admin-email" className="sr-only">
        Email
      </label>
      <input
        id="admin-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
        required
        className="rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent transition-colors"
      />
      <label htmlFor="admin-password" className="sr-only">
        Password
      </label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoComplete="new-password"
        required
        minLength={8}
        className="rounded-md border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent transition-colors"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-accent-btn px-4 py-2.5 text-xs text-display uppercase tracking-wide text-ink disabled:opacity-50 transition-opacity"
        >
          {loading ? "…" : "Create"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md border border-line px-3 py-2.5 text-xs text-ink-dim hover:text-ink uppercase tracking-wide"
        >
          Close
        </button>
      </div>
      {error && (
        <p role="alert" aria-live="assertive" className="text-stop text-xs sm:col-span-4">
          {error}
        </p>
      )}
      {success && <p className="text-go text-xs sm:col-span-4">Admin account created.</p>}
    </form>
  );
}
