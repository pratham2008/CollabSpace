"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

type Persona = {
  label: string;
  skills: string[];
  projects: {
    title: string;
    tag: string;
    stack: string;
    lookingFor: string;
    match: number;
  }[];
};

const container: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const cardAnim = {
  initial: { opacity: 0, y: 10, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(6px)" },
};

export function MatchSimulator() {
  const personas: Persona[] = useMemo(
    () => [
      {
        label: "Frontend builder",
        skills: ["Next.js", "Tailwind", "UI/UX", "TypeScript", "Figma"],
        projects: [
          {
            title: "Hackathon Team Finder",
            tag: "Hackathon",
            stack: "Next.js · Node · PostgreSQL",
            lookingFor: "UI/UX + Frontend",
            match: 92,
          },
          {
            title: "College Event Portal",
            tag: "Mini-project",
            stack: "Next.js · Prisma · Postgres",
            lookingFor: "Frontend",
            match: 86,
          },
          {
            title: "Study Buddy Dashboard",
            tag: "Research",
            stack: "Next.js · Python API",
            lookingFor: "Frontend + UI polish",
            match: 79,
          },
        ],
      },
      {
        label: "Backend builder",
        skills: ["Node.js", "PostgreSQL", "Prisma", "Auth", "REST APIs"],
        projects: [
          {
            title: "CollabSpace MVP",
            tag: "Startup",
            stack: "Next.js · Prisma · Postgres",
            lookingFor: "Backend + DB design",
            match: 90,
          },
          {
            title: "Attendance + Analytics",
            tag: "Mini-project",
            stack: "Node · Postgres · Charts",
            lookingFor: "Backend + DB queries",
            match: 84,
          },
          {
            title: "Project Submission System",
            tag: "College",
            stack: "Node · RBAC · Storage",
            lookingFor: "Auth + backend",
            match: 78,
          },
        ],
      },
      {
        label: "Rapid MVP",
        skills: ["Firebase", "Next.js", "UI/UX", "Auth", "Deploy"],
        projects: [
          {
            title: "Campus Marketplace",
            tag: "Mini-project",
            stack: "Next.js · Firebase",
            lookingFor: "MVP builder",
            match: 88,
          },
          {
            title: "Lost & Found",
            tag: "College",
            stack: "Next.js · Firebase · Uploads",
            lookingFor: "Frontend + Firebase",
            match: 83,
          },
          {
            title: "Hackathon Pitch Deck Site",
            tag: "Hackathon",
            stack: "Next.js · UI",
            lookingFor: "Frontend polish",
            match: 76,
          },
        ],
      },
      {
        label: "ML + apps",
        skills: ["Python", "APIs", "Data", "UI/UX", "Next.js"],
        projects: [
          {
            title: "AI Resume Reviewer",
            tag: "Hackathon",
            stack: "Next.js · Python · RAG",
            lookingFor: "Python + API",
            match: 87,
          },
          {
            title: "Study Planner",
            tag: "Mini-project",
            stack: "Next.js · Python",
            lookingFor: "ML logic + integration",
            match: 81,
          },
          {
            title: "Notes Summarizer",
            tag: "Research",
            stack: "Next.js · Python · NLP",
            lookingFor: "NLP + API",
            match: 77,
          },
        ],
      },
    ],
    [],
  );

  const [index, setIndex] = useState(0);
  const active = personas[index];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % personas.length);
    }, 3200);
    return () => clearInterval(id);
  }, [personas.length]);

  return (
    <motion.section
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      className="w-full py-14"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="text-xs font-medium text-slate-400">
            A quick look at what CollabSpace does
          </p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Match skills to projects — instantly.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-300/85">
            A calm demo that cycles through common student roles and shows the
            kind of projects you’d discover.
          </p>
        </div>

        {/* Glass panel */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-[0_0_80px_rgba(15,23,42,0.85)]">
          {/* subtle glow */}
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-tr from-sky-500/30 via-cyan-400/15 to-violet-500/25 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr,1.2fr]">
            {/* Left: persona + skills */}
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300/80">Current persona</p>
                <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-200">
                  autoplay
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-lg font-semibold text-slate-50">
                  {active.label}
                </p>
                <span className="text-xs text-slate-400">
                  • finding best-fit projects
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {active.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/90"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between text-[11px] text-slate-300/80">
                  <span>Matching signal</span>
                  <span className="text-sky-200">stable</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    key={index}
                    initial={{ width: "15%" }}
                    animate={{ width: `${70 + (index % 3) * 10}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400"
                  />
                </div>
              </div>
            </div>

            {/* Right: matched projects */}
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-slate-300/80">Top matches</p>

              <div className="mt-3 space-y-3">
                <AnimatePresence mode="wait">
                  <motion.div key={index} className="space-y-3">
                    {active.projects.map((p) => (
                      <motion.div
                        key={p.title}
                        variants={cardAnim}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-50">
                              {p.title}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-300/80">
                              {p.stack}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                              {p.match}% match
                            </span>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {p.tag}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-[11px] text-slate-300/80">
                            Looking for:{" "}
                            <span className="text-slate-100">
                              {p.lookingFor}
                            </span>
                          </p>
                          <span className="text-[10px] text-sky-200">
                            View →
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* footer note */}
          <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-slate-300/80">
            <span>Autoplay demo • real matching comes after login</span>
            <span className="text-sky-200">
              CollabSpace • discover • join • build
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
