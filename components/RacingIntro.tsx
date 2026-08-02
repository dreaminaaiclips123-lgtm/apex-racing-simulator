"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { IconFlagFilled } from "@tabler/icons-react";
import { INTRO_SEEN_COOKIE, INTRO_SEEN_MAX_AGE_S } from "@/lib/introCookie";

const LOADING_TIMEOUT_MS = 4500;
const EXIT_DURATION_S = 0.7;

// The root layout only mounts this component at all when the server-side
// cookie check says the intro hasn't been seen in the last 24h — see
// app/layout.tsx. That means this component itself never needs to ask "have
// I already played?"; it can assume the answer is no the moment it mounts.
type Phase = "loading" | "playing" | "exiting" | "done";

// Also treated as "skip the heavy video" when the visitor has Data Saver on
// or a slow connection — a multi-MB autoplay video is a real, measured cost
// (0.8-1MB+ before a slow-4G visitor could even finish downloading it) that
// data-saver users have explicitly opted out of.
function getReducedMotionSnapshot(): boolean {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const conn = nav.connection;
  const slowConnection =
    !!conn?.saveData || conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || slowConnection;
}

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

// useSyncExternalStore (not useEffect+useState) so the real client-side value
// lands before first paint — no SSR/hydration mismatch, no flash of content.
function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);
}

function markIntroSeen() {
  // 24h Max-Age (not a bare session cookie): a session cookie's real
  // lifetime is at the mercy of each browser's tab-restore/"continue where
  // you left off" behavior, which made this look "stuck forever seen" or
  // "randomly resets" depending on the browser — a fixed 24h window is
  // predictable and testable regardless of browser quirks.
  document.cookie = `${INTRO_SEEN_COOKIE}=1; path=/; max-age=${INTRO_SEEN_MAX_AGE_S}`;
}

export default function RacingIntro() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("loading");
  const videoRef = useRef<HTMLVideoElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Mirrors `phase` synchronously so timeout callbacks never act on a stale
  // closure value (setState's functional form can't help here since we need
  // to *read* the current phase to decide whether to act, not just update it).
  const phaseRef = useRef<Phase>("loading");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Mark this session as "seen" the instant we mount — a refresh mid-intro
  // shouldn't replay it either.
  useEffect(() => {
    markIntroSeen();
  }, []);

  function finish() {
    if (phaseRef.current === "done" || phaseRef.current === "exiting") return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    phaseRef.current = "exiting";
    setPhase("exiting");
    timers.current.push(setTimeout(() => setPhase("done"), EXIT_DURATION_S * 1000));
  }

  // A real user gesture can always start playback, regardless of whatever
  // autoplay policy blocked the automatic attempt — so a tap while still
  // "loading" tries to force the video to actually start, rather than
  // skipping it outright. The video is pointer-events-none, so a tap never
  // reaches any native play button the browser might have drawn over it;
  // this is the only way a blocked-autoplay visitor can ever get it moving.
  function handleTap() {
    if (reducedMotion || phaseRef.current === "playing") {
      finish();
      return;
    }
    if (phaseRef.current === "loading") {
      videoRef.current?.play().catch(() => {});
    }
  }

  // Schedules the timer for whichever opening state we're in. Purely a side
  // effect — never decides `phase` synchronously in here.
  useEffect(() => {
    if (phase !== "loading") return;
    const delay = reducedMotion ? 1100 : LOADING_TIMEOUT_MS;
    const t = setTimeout(() => {
      if (phaseRef.current === "loading") finish();
    }, delay);
    timers.current.push(t);
    return () => timers.current.forEach(clearTimeout);
  }, [reducedMotion, phase]);

  // Belt-and-suspenders autoplay: the declarative autoPlay/muted attributes
  // should be enough, but some browsers only honor autoplay reliably when
  // `.muted` is also set imperatively before an explicit `.play()` call.
  useEffect(() => {
    if (reducedMotion || phase === "done") return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {
      // Autoplay was blocked for some reason — the loading-timeout guard
      // above will still move the visitor on to the homepage.
    });
  }, [reducedMotion, phase]);

  // Lock scroll for as long as the intro actually occupies the screen.
  useEffect(() => {
    if (phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // Escape skips, as a hidden accessibility fallback.
  useEffect(() => {
    if (phase !== "loading" && phase !== "playing") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finish();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <motion.div
      className="fixed inset-0 z-100 bg-bg overflow-hidden"
      // Tap anywhere: forces playback if autoplay got blocked (a real user
      // gesture is always allowed to start a video, no exceptions), or skips
      // if it's already playing. Escape remains a hidden keyboard fallback,
      // but touchscreens have no Escape key at all.
      onClick={handleTap}
      animate={
        phase === "exiting" ? { opacity: 0, scale: 1.06 } : { opacity: 1, scale: 1 }
      }
      transition={{ duration: EXIT_DURATION_S, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Real focusable control, not just the hidden Escape-key fallback —
          a keyboard or screen-reader visitor had no discoverable way to skip
          this before. stopPropagation so it doesn't also trigger handleTap
          on the overlay behind it. */}
      {!reducedMotion && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            finish();
          }}
          className="absolute bottom-6 right-6 z-10 rounded-md border border-line bg-bg/60 px-4 py-2 text-xs uppercase tracking-wide text-ink-dim backdrop-blur hover:text-ink hover:border-ink transition-colors"
        >
          Skip intro
        </button>
      )}
      {reducedMotion ? (
        <motion.div
          className="h-full w-full flex flex-col items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <IconFlagFilled size={40} className="text-accent" />
          <p className="text-display text-2xl tracking-[0.2em] text-ink">APEX</p>
          <p className="text-xs tracking-[0.35em] text-ink-dim uppercase">Racing Simulator</p>
        </motion.div>
      ) : (
        <video
          ref={videoRef}
          className="apex-intro-video h-full w-full object-cover pointer-events-none"
          poster="/images/racing-intro-poster.webp"
          autoPlay
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
          onPlaying={() => setPhase((p) => (p === "loading" ? "playing" : p))}
          onEnded={finish}
          onError={finish}
        >
          {/* Replace these five files under public/ to swap the intro cut. */}
          <source media="(max-width: 768px)" src="/videos/racing-intro-mobile.webm" type="video/webm" />
          <source media="(max-width: 768px)" src="/videos/racing-intro-mobile.mp4" type="video/mp4" />
          <source src="/videos/racing-intro-desktop.webm" type="video/webm" />
          <source src="/videos/racing-intro-desktop.mp4" type="video/mp4" />
        </video>
      )}
    </motion.div>
  );
}
