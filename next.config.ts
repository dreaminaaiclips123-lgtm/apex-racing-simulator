import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Baseline security headers on every response — none were set
        // before (verified live: only Vercel's own strict-transport-security
        // was present), leaving the login/booking/admin pages framable by
        // any origin with no clickjacking defense at all.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "media-src 'self'",
              "font-src 'self' data:",
              "connect-src 'self'",
              // The location section embeds a Google Maps iframe — without an
              // explicit frame-src, CSP falls back to default-src 'self' and
              // silently blocks it (this actually broke the map after the
              // headers were first added).
              "frame-src https://www.google.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
      {
        // public/ assets aren't content-hashed like /_next/static/, so they
        // never got real caching — every repeat visit re-validated the
        // multi-MB intro video/poster with the origin instead of using the
        // browser's own disk cache. Not `immutable` — these files do get
        // replaced in place by filename (e.g. swapping the intro cut), and a
        // full year of immutable caching burned real debugging time on a
        // stale-image bug earlier in this project. One day + revalidate is a
        // real win with much lower staleness risk.
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
