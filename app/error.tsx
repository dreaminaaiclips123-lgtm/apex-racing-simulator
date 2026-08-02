"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6 text-center">
      <div className="max-w-sm">
        <p className="text-display text-accent text-sm tracking-[0.3em] uppercase mb-2">Apex</p>
        <h1 className="text-display text-2xl text-ink mb-3">Something went wrong</h1>
        <p className="text-ink-dim text-sm mb-6">
          That didn't load right. Try again, or head back to the homepage.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-md bg-accent-btn px-5 py-2.5 text-sm text-display uppercase tracking-wide text-ink"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-md border border-line px-5 py-2.5 text-sm text-display uppercase tracking-wide text-ink-dim hover:text-ink"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
