"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, animate } from "motion/react";

const STORAGE_KEY = "apex-intro-seen";

const BOOT_LINES = [
  "APEX RACING SIMULATOR",
  "SYSTEMS BOOTING …",
  "4/4 RIGS ONLINE",
  "2 DRIFT BAYS ARMED",
  "IGNITION",
];

type Phase = "boot" | "tach" | "flare" | "flag" | "exit" | "done";

// Read once, no external change events to react to — the value can't
// change for the lifetime of this component.
function noopSubscribe() {
  return () => {};
}

function getIntroSeenSnapshot(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
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

// useSyncExternalStore (not useEffect+useState) so the real client-side
// value lands before first paint — no SSR/hydration mismatch, no flash.
function useIntroSeen(): boolean {
  return useSyncExternalStore(noopSubscribe, getIntroSeenSnapshot, () => false);
}

function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);
}

function Tachometer() {
  const [rpm, setRpm] = useState(0);
  const needleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controls = animate(0, 9200, {
      duration: 1.05,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setRpm(Math.round(v)),
    });
    if (needleRef.current) {
      needleRef.current.animate(
        [{ transform: "rotate(-95deg)" }, { transform: "rotate(78deg)" }],
        { duration: 1050, easing: "cubic-bezier(0.16,1,0.3,1)", fill: "forwards" }
      );
    }
    return () => controls.stop();
  }, []);

  const ticks = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="relative w-64 h-40 md:w-80 md:h-48">
      <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 130 32 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity={0.85}
        />
        {ticks.map((i) => {
          const angle = -95 + (i / 9) * 173;
          const rad = (angle * Math.PI) / 180;
          const x1 = 100 + 68 * Math.cos(rad);
          const y1 = 110 + 68 * Math.sin(rad);
          const x2 = 100 + 78 * Math.cos(rad);
          const y2 = 110 + 78 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i >= 7 ? "var(--color-accent)" : "var(--color-ink-dim)"}
              strokeWidth="2.5"
            />
          );
        })}
      </svg>
      <div
        ref={needleRef}
        className="absolute left-1/2 bottom-[8%] h-[58%] w-[3px] bg-ink origin-bottom"
        style={{ transform: "rotate(-95deg)", marginLeft: "-1.5px" }}
      >
        <div className="absolute -top-1 -left-[3px] w-2 h-2 rounded-full bg-accent" />
      </div>
      <div className="absolute bottom-[46%] left-1/2 -translate-x-1/2 text-center">
        <p className="text-display tabular text-3xl md:text-4xl text-ink leading-none">
          {rpm.toLocaleString()}
        </p>
        <p className="text-[10px] tracking-[0.3em] text-ink-dim mt-1">RPM</p>
      </div>
    </div>
  );
}

export default function IntroOverlay() {
  const seen = useIntroSeen();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("boot");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function finish() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    setPhase("exit");
    timers.current.push(setTimeout(() => setPhase("done"), 550));
  }

  useEffect(() => {
    if (seen) return;

    if (reducedMotion) {
      timers.current.push(setTimeout(finish, 500));
      return () => timers.current.forEach(clearTimeout);
    }

    const schedule: [Phase, number][] = [
      ["tach", 900],
      ["flare", 1950],
      ["flag", 2350],
    ];
    schedule.forEach(([p, ms]) => {
      timers.current.push(setTimeout(() => setPhase(p), ms));
    });
    timers.current.push(setTimeout(finish, 2900));

    return () => timers.current.forEach(clearTimeout);
  }, [seen, reducedMotion]);

  if (seen || phase === "done") return null;

  return (
    <motion.div
      className="fixed inset-0 z-100 bg-bg flex items-center justify-center cursor-pointer select-none"
      animate={{ y: phase === "exit" ? "-100%" : "0%" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onClick={finish}
      role="button"
      aria-label="Skip intro"
    >
      <div className="absolute inset-0 grain" />

          {reducedMotion ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-display text-2xl tracking-[0.2em] text-ink"
            >
              APEX — SYSTEMS ONLINE
            </motion.p>
          ) : (
            <>
              {phase === "boot" && (
                <div className="text-center px-6">
                  {BOOT_LINES.map((line, i) => (
                    <motion.p
                      key={line}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.14, duration: 0.35 }}
                      className={
                        i === 0
                          ? "text-display text-3xl md:text-5xl tracking-[0.08em] text-ink mb-4"
                          : "text-xs md:text-sm tracking-[0.3em] text-accent-2 uppercase"
                      }
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>
              )}

              {phase === "tach" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Tachometer />
                </motion.div>
              )}

              {phase === "flare" && (
                <div className="absolute inset-0 overflow-hidden">
                  {[0.32, 0.68].map((pos, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 h-40 w-40 -translate-y-1/2 rounded-full"
                      style={{
                        left: `${pos * 100}%`,
                        background:
                          "radial-gradient(circle, var(--color-ink) 0%, var(--color-accent-2) 35%, transparent 70%)",
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 8, opacity: [0, 0.9, 0] }}
                      transition={{ duration: 0.4, delay: i * 0.08, ease: "easeOut" }}
                    />
                  ))}
                </div>
              )}

              {phase === "flag" && (
                <motion.div
                  className="absolute inset-0 checker-strip"
                  initial={{ opacity: 0, scale: 1.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </>
          )}

          <p className="absolute bottom-6 right-6 text-[10px] tracking-[0.3em] text-ink-faint uppercase">
            Tap to skip
          </p>
    </motion.div>
  );
}
