"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function ProfileCompletionBanner({ completion }: { completion: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-50">
            Complete your profile to unlock collaboration
          </p>
          <p className="mt-1 text-sm text-slate-300/80">
            You can browse everything, but joining/creating projects requires a
            complete profile.
          </p>
        </div>

        <Link
          href="/app/profile"
          className="inline-flex h-10 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 px-4 text-sm font-semibold text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.18)] transition hover:bg-sky-500/15"
        >
          Complete now
        </Link>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300/80">Progress</span>
          <span className="text-slate-100">{completion}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300/80">
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">
          Add availability
        </span>
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">
          Confirm skills
        </span>
        <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1">
          Choose project types
        </span>
      </div>
    </motion.div>
  );
}
