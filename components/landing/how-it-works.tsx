"use client";

import { motion } from "framer-motion";

const steps = [
  {
    n: "01",
    title: "Create a project",
    desc: "Add a title, goal, and the roles you need.",
  },
  {
    n: "02",
    title: "Discover matches",
    desc: "Browse projects and teams that fit your skills.",
  },
  {
    n: "03",
    title: "Request to join",
    desc: "Send a short request and share your proof of work.",
  },
  {
    n: "04",
    title: "Build & ship",
    desc: "Kickoff fast, stay aligned, and deliver together.",
  },
];

export function HowItWorks() {
  return (
    <section className="w-full py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium text-slate-400">How it works</p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Simple flow. Real collaboration.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-300/85">
            No noise. Just a clean path from idea to team to shipping.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: "easeOut" }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-to-tr from-sky-500/20 via-cyan-400/10 to-violet-500/15 blur-3xl" />

              <div className="relative flex items-start gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-slate-200">
                  {s.n}
                </div>

                <div>
                  <p className="text-base font-semibold text-slate-50">
                    {s.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-300/85">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
