"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Sparkles, Users } from "lucide-react";

type TabKey = "why" | "how" | "who";

type Item = {
  title: string;
  meta: string;
  status: "idle" | "active" | "done";
  match?: number; // only for HOW items
};

type CanvasState = {
  key: TabKey;
  label: string;
  title: string;
  desc: string;
  bullets: string[];
  mock: {
    header: string;
    sub: string;
    chips: string[];
    items: Item[];
  };
};

const AUTOPLAY_MS = 4200; // gives room for count animation (~1100ms) + readability

const sectionIn = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const swap = {
  initial: { opacity: 0, y: 10, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(10px)" },
};

// calm, premium “count up”
function CountUp({
  value,
  duration = 1.1,
  suffix = "%",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    setDisplay(0);
    startRef.current = null;

    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / (duration * 1000));

      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));

      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

export function ProjectCanvas() {
  const states: CanvasState[] = useMemo(
    () => [
      {
        key: "why",
        label: "Why",
        title: "Most student projects fail before they start.",
        desc: "Not because the idea is bad — but because the right people don’t find each other in time.",
        bullets: ["Roles stay missing", "Builders work alone", "Projects die early"],
        mock: {
          header: "Project: CollabSpace MVP",
          sub: "Roles needed",
          chips: ["Next.js", "UI/UX", "DB", "Auth"],
          items: [
            { title: "Frontend", meta: "missing", status: "active" },
            { title: "UI/UX", meta: "missing", status: "idle" },
            { title: "Backend", meta: "missing", status: "idle" },
          ],
        },
      },
      {
        key: "how",
        label: "How",
        title: "Match skills to projects — instantly.",
        desc: "Discover best-fit projects, request to join cleanly, and start shipping faster.",
        bullets: ["Browse by skill-fit", "Request in one shot", "Kickoff with clarity"],
        mock: {
          header: "Matching signal",
          sub: "Top matches",
          chips: ["Next.js", "Tailwind", "UI/UX", "TypeScript"],
          items: [
            { title: "Hackathon Team Finder", meta: "match", status: "done", match: 92 },
            { title: "College Event Portal", meta: "match", status: "active", match: 86 },
            { title: "Study Buddy Dashboard", meta: "match", status: "idle", match: 79 },
          ],
        },
      },
      {
        key: "who",
        label: "Who",
        title: "Built for students who build.",
        desc: "For hackathons, mini-projects, research teams, and clubs — if you ship, you belong here.",
        bullets: ["Dev + design", "Teams & clubs", "Builders shipping MVPs"],
        mock: {
          header: "Spaces you’ll see",
          sub: "Pick your lane",
          chips: ["Hackathon", "Mini-project", "Research", "Club"],
          items: [
            { title: "Hackathon sprint", meta: "teams forming", status: "done" },
            { title: "Mini-project", meta: "shipping weekly", status: "active" },
            { title: "Research", meta: "structured", status: "idle" },
          ],
        },
      },
    ],
    [],
  );

  const [active, setActive] = useState<TabKey>("why");

  const activeIndex = states.findIndex((s) => s.key === active);
  const current = states[activeIndex];

  // autoplay (no hover pause)
  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => {
        const i = states.findIndex((s) => s.key === prev);
        return states[(i + 1) % states.length].key;
      });
    }, AUTOPLAY_MS);

    return () => clearInterval(id);
  }, [states]);

  // MOFO Titles ...
  // - "CollabSpace, explained."
  // - "CollabSpace — the story."
  // - "CollabSpace in 3 steps."
  // - "A quick CollabSpace walkthrough."
  const topTitle = "The CollabSpace story.";

  return (
    <motion.section
      id="why"
      variants={sectionIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className="w-full py-10"
    >
      {/* wider container */}
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
        {/* single, clean heading line */}
        <div className="mb-5 text-center">
          <p className="text-sm font-medium text-slate-200/90">{topTitle}</p>
        </div>

        {/* glass container (shorter, wider) */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_80px_rgba(15,23,42,0.85)]">
          {/* background glow (fixed so it never “collapses” with bottom) */}
          <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-tr from-sky-500/18 via-cyan-400/10 to-violet-500/16 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-to-tr from-violet-500/14 via-cyan-400/8 to-sky-500/12 blur-3xl" />

          {/* tabs row */}
          <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="text-xs text-slate-300/80">
              Canvas •{" "}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                {current.label.toLowerCase()}
              </span>
            </div>

            <Tabs active={active} setActive={setActive} />
          </div>

          {/* content (extra bottom padding so WHO never feels cramped) */}
          <div className="relative grid gap-4 px-4 pb-5 pt-4 lg:grid-cols-[1.2fr,0.8fr]">
            {/* left: mock app */}
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
              {/* tiny window controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                  <span className="h-2 w-2 rounded-full bg-white/20" />
                </div>
                <div className="text-[11px] text-slate-300/60">demo</div>
              </div>

              <div className="mt-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.key}
                    variants={swap}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.26, ease: "easeOut" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-50">
                          {current.mock.header}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-300/70">
                          {current.mock.sub}
                        </p>
                      </div>

                      <MiniBadge tab={current.key} />
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {current.mock.chips.map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200/90"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {current.mock.items.map((it) => (
                        <motion.div
                          key={`${current.key}-${it.title}`}
                          layout
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <div className="flex items-center gap-2">
                            <StatusDot status={it.status} />
                            <p className="text-sm text-slate-100">{it.title}</p>
                          </div>

                          {/* right meta */}
                          <div className="text-right text-[11px] text-slate-300/80">
                            {current.key === "how" && typeof it.match === "number" ? (
                              <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5">
                                <CountUp
                                  value={it.match}
                                  duration={1.1}
                                  suffix="% match"
                                />
                              </span>
                            ) : (
                              <span>{it.meta}</span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* right: explanation */}
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.key}
                  variants={swap}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.26, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-2">
                    {current.key === "why" ? (
                      <motion.span
                        initial={{ rotate: -8, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        <Sparkles className="h-4 w-4 text-sky-300" />
                      </motion.span>
                    ) : current.key === "how" ? (
                      <motion.span
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                      </motion.span>
                    ) : (
                      <motion.span
                        initial={{ x: -6, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        <Users className="h-4 w-4 text-violet-200" />
                      </motion.span>
                    )}
                    <p className="text-xs font-medium text-slate-300/80">
                      {current.label}
                    </p>
                  </div>

                  <h3 className="mt-2 text-balance text-lg font-semibold tracking-tight text-slate-50">
                    {current.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300/85">{current.desc}</p>

                  <ul className="mt-3 space-y-1.5">
                    {current.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-sm text-slate-200/90"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* bottom stripe */}
          <div className="relative border-t border-white/10 px-4 py-3 text-[11px] text-slate-300/70">
            CollabSpace • discover • join • build
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Tabs({ active, setActive }: { active: TabKey; setActive: (k: TabKey) => void }) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "why", label: "Why" },
    { key: "how", label: "How" },
    { key: "who", label: "Who" },
  ];

  return (
    <div className="rounded-full border border-white/10 bg-black/25 p-1">
      <div className="flex items-center gap-1">
        {tabs.map((t) => {
          const isActive = active === t.key;

          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={[
                "relative rounded-full px-3.5 py-1 text-xs font-medium transition",
                isActive ? "text-slate-50" : "text-slate-300/80 hover:text-slate-100",
              ].join(" ")}
            >
              {/* small pill just behind text */}
              {isActive && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-y-0.5 inset-x-1 rounded-full bg-gradient-to-r from-sky-500/35 via-cyan-400/25 to-violet-500/30 shadow-[0_0_16px_rgba(56,189,248,0.12)]"
                  transition={{ type: "spring", stiffness: 520, damping: 38 }}
                />
              )}

              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniBadge({ tab }: { tab: TabKey }) {
  const label = tab === "why" ? "roles" : tab === "how" ? "matches" : "personas";
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-200/90">
      {label}
    </span>
  );
}

function StatusDot({ status }: { status: "idle" | "active" | "done" }) {
  const cls =
    status === "done"
      ? "bg-emerald-400/90"
      : status === "active"
      ? "bg-sky-400/90"
      : "bg-white/25";

  return <span className={`h-2 w-2 rounded-full ${cls}`} />;
}
