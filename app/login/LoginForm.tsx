"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconBrandFacebook, IconBrandGoogle } from "@tabler/icons-react";

type Mode = "login" | "signup" | "admin";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in isn't set up yet.",
  facebook_not_configured: "Facebook sign-in isn't set up yet.",
  oauth_failed: "Something went wrong signing in — please try again.",
  oauth_no_email: "That account didn't share an email with us — try a different sign-in method.",
};

export default function LoginForm({
  googleEnabled,
  facebookEnabled,
  returnTo,
  oauthError,
}: {
  googleEnabled: boolean;
  facebookEnabled: boolean;
  returnTo: string | null;
  oauthError: string | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    oauthError ? (OAUTH_ERROR_MESSAGES[oauthError] ?? "Something went wrong.") : null
  );

  const oauthHref = (provider: "google" | "facebook") =>
    `/api/auth/${provider}/start${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;

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
      if (data.role === "admin") {
        router.push("/admin");
      } else if (data.needsProfile) {
        router.push("/complete-profile");
      } else {
        router.push(returnTo || "/my-bookings");
      }
      router.refresh();
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
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, dob, phone, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(returnTo || "/my-bookings");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-line bg-surface-2 px-4 py-3 text-ink outline-none focus:border-accent transition-colors";

  if (mode === "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <form onSubmit={submitLogin} className="w-full max-w-sm rounded-lg border border-line bg-surface p-8">
          <p className="text-display text-accent text-sm tracking-[0.3em] uppercase mb-2">Apex Admin</p>
          <h1 className="text-display text-2xl mb-6">Staff sign in</h1>
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoFocus
              className={inputClass}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={inputClass}
            />
          </div>
          {error && <p className="text-stop text-sm mt-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-md bg-accent py-3 text-display uppercase tracking-wide text-ink disabled:opacity-50 transition-opacity"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className="mt-4 w-full text-center text-xs text-ink-faint hover:text-ink-dim uppercase tracking-wide"
          >
            Back to customer sign in
          </button>
        </form>
      </div>
    );
  }

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

        {(googleEnabled || facebookEnabled) && (
          <div className="space-y-2.5 mb-6">
            {googleEnabled && (
              <a
                href={oauthHref("google")}
                className="flex items-center justify-center gap-2 rounded-md border border-line py-3 text-sm text-ink hover:border-ink-dim transition-colors"
              >
                <IconBrandGoogle size={18} />
                Continue with Google
              </a>
            )}
            {facebookEnabled && (
              <a
                href={oauthHref("facebook")}
                className="flex items-center justify-center gap-2 rounded-md border border-line py-3 text-sm text-ink hover:border-ink-dim transition-colors"
              >
                <IconBrandFacebook size={18} />
                Continue with Facebook
              </a>
            )}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[11px] text-ink-faint uppercase tracking-wide">or</span>
              <div className="h-px flex-1 bg-line" />
            </div>
          </div>
        )}

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

          {error && <p className="text-stop text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-accent py-3 text-display uppercase tracking-wide text-ink disabled:opacity-50 transition-opacity"
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode("admin");
            setError(null);
          }}
          className="mt-6 w-full text-center text-[11px] text-ink-faint hover:text-ink-dim uppercase tracking-wide"
        >
          Apex Admin
        </button>
      </div>
    </div>
  );
}
