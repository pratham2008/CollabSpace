"use client";

import { motion } from "framer-motion";

const personas = [
  "Frontend devs",
  "Backend devs",
  "UI/UX designers",
  "Hackathon teams",
  "College clubs",
  "Builders shipping MVPs",
];

export function WhoItsFor() {
  return (
    <section className="w-full py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium text-slate-400">Who it&apos;s for</p>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
            Built for students who build.
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-300/85">
            Whether you’re joining a project or starting one — CollabSpace keeps
            it clean and focused.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="flex flex-wrap items-center justify-center gap-2">
            {personas.map((p) => (
              <span
                key={p}
                className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-medium text-slate-200"
              >
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
