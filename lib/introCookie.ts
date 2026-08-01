// Shared between the server layout (reads it to decide whether to render
// RacingIntro at all) and the component itself (writes it the instant the
// intro starts). Deliberately a plain, non-httpOnly, non-signed cookie —
// it's a UX flag, not auth state, and the client needs to write it directly.
// Fixed 24h Max-Age — not a bare session cookie. A session cookie's actual
// lifetime depends on each browser's tab-restore behavior, which made the
// intro look permanently gone in some browsers and reset on every restart
// in others. 24h is predictable regardless of browser quirks.
export const INTRO_SEEN_COOKIE = "apex_intro_seen";
export const INTRO_SEEN_MAX_AGE_S = 60 * 60 * 24;
