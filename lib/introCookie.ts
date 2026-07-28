// Shared between the server layout (reads it to decide whether to render
// RacingIntro at all) and the component itself (writes it the instant the
// intro starts). Deliberately a plain, non-httpOnly, non-signed cookie —
// it's a UX flag, not auth state, and the client needs to write it directly.
// No Max-Age/Expires: a real session cookie, cleared when the browser quits.
export const INTRO_SEEN_COOKIE = "apex_intro_seen";
