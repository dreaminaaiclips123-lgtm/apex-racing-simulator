"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { IconFlagFilled } from "@tabler/icons-react";

// Bump this if the intro video is ever replaced — old sessions won't skip a new cut.
const SESSION_KEY = "apex-intro-played-v1";
const LOADING_TIMEOUT_MS = 4500;
const EXIT_DURATION_S = 0.7;

// Playback state machine only — whether we render at all is decided
// separately (and on every render) from `alreadyPlayed`, see the early
// return below. Keeping that check out of this state avoids a footgun:
// a useState lazy initializer only runs on the very first render, which for
// a server-rendered page is the SSR/hydration pass where session values
// aren't known yet — baking `alreadyPlayed` into the initial state would
// "lock in" a stale decision and could replay the video for a returning
// visitor while leaving the page scroll-locked forever.
type Phase = "loading" | "playing" | "exiting" | "done";

function noopSubscribe() {
  return () => {};
}

// sessionStorage (not localStorage): replays on a genuinely new browsing
// session/tab, but not on every in-app navigation within the same tab.
function getPlayedSnapshot(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeReducedMotion(callback: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

// useSyncExternalStore (not useEffect+useState) so the real client-side value
// lands before first paint — no SSR/hydration mismatch, no flash of content.
function useAlreadyPlayed(): boolean {
  return useSyncExternalStore(noopSubscribe, getPlayedSnapshot, () => false);
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);
}

export default function RacingIntro() {
  const alreadyPlayed = useAlreadyPlayed();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("loading");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  // Mirrors `phase` synchronously so timeout callbacks never act on a stale
  // closure value (setState's functional form can't help here since we need
  // to *read* the current phase to decide whether to act, not just update it).
  const phaseRef = useRef<Phase>("loading");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  function markPlayed() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
  }

  function finish() {
    if (phaseRef.current === "done" || phaseRef.current === "exiting") return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    markPlayed();
    phaseRef.current = "exiting";
    setPhase("exiting");
    timers.current.push(setTimeout(() => setPhase("done"), EXIT_DURATION_S * 1000));
  }

  // Schedules the timer for whichever opening state we're in. Purely a side
  // effect — never decides `phase` synchronously in here.
  useEffect(() => {
    if (alreadyPlayed || phase !== "loading") return;
    const delay = reducedMotion ? 1100 : LOADING_TIMEOUT_MS;
    const t = setTimeout(() => {
      if (phaseRef.current === "loading") finish();
    }, delay);
    timers.current.push(t);
    return () => timers.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyPlayed, reducedMotion, phase]);

  // Lock scroll for as long as the intro actually occupies the screen.
  useEffect(() => {
    const active = !alreadyPlayed && phase !== "done";
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [alreadyPlayed, phase]);

  // Escape skips, same as the visible Skip button.
  useEffect(() => {
    const active = !alreadyPlayed && (phase === "loading" || phase === "playing");
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finish();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyPlayed, phase]);

  // Re-checked every render (not just at mount) — see the Phase comment above.
  if (alreadyPlayed || phase === "done") return null;

  return (
    <motion.div
      className="fixed inset-0 z-100 bg-bg overflow-hidden"
      animate={
        phase === "exiting" ? { opacity: 0, scale: 1.06 } : { opacity: 1, scale: 1 }
      }
      transition={{ duration: EXIT_DURATION_S, ease: [0.16, 1, 0.3, 1] }}
    >
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
          className="h-full w-full object-cover"
          poster="/images/racing-intro-poster.webp"
          autoPlay
          muted
          playsInline
          preload="auto"
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

      {(phase === "loading" || phase === "playing") && (
        <button
          onClick={finish}
          aria-label="Skip intro"
          className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 rounded-md border border-ink/30 bg-bg/60 backdrop-blur px-4 py-2.5 text-xs uppercase tracking-[0.2em] text-ink hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent transition-colors"
        >
          Skip intro
        </button>
      )}
    </motion.div>
  );
}
