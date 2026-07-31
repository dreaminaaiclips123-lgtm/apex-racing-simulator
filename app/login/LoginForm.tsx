"use client";

import { useState } from "react";
import Link from "next/link";

type Mode = "login" | "signup";

export default function LoginForm({ returnTo }: { returnTo: string | null }) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      // Same login form for everyone — an account registered with the admin
      // role lands on /admin, a regular customer lands on the homepage (or
      // returnTo). The server decides based on the stored role, not the UI.
      window.location.assign(data.role === "admin" ? "/admin" : returnTo || "/");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dob, phone, email, password, agreedToTerms }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      window.location.assign(returnTo || "/");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-line bg-surface-2 px-4 py-3 text-ink outline-none focus:border-accent transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-sm rounded-lg border border-line bg-surface p-8">
        <p className="text-display text-accent text-sm tracking-[0.3em] uppercase mb-2">Apex</p>
        <h1 className="text-display text-2xl mb-6">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>

        <div className="flex rounded-md border border-line overflow-hidden mb-6 text-sm">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 py-2.5 uppercase tracking-wide transition-colors ${
              mode === "login" ? "bg-accent text-ink" : "text-ink-dim hover:text-ink"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex-1 py-2.5 uppercase tracking-wide transition-colors ${
              mode === "signup" ? "bg-accent text-ink" : "text-ink-dim hover:text-ink"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={mode === "login" ? submitLogin : submitSignup} className="space-y-4">
          {mode === "signup" && (
            <>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className={inputClass}
              />
              <div>
                <label className="block text-xs text-ink-dim uppercase tracking-wide mb-1.5">
                  Date of birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={inputClass}
                />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                className={inputClass}
              />
            </>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={inputClass}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={inputClass}
          />
          {mode === "signup" && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={inputClass}
            />
          )}

          {mode === "signup" && (
            <label className="flex items-start gap-2.5 text-sm text-ink-dim">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
              />
              <span>
                I agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  Privacy Policy
                </Link>
              </span>
            </label>
          )}

          {error && <p className="text-stop text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || (mode === "signup" && !agreedToTerms)}
            className="w-full rounded-md bg-accent py-3 text-display uppercase tracking-wide text-ink disabled:opacity-50 transition-opacity"
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
