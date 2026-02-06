"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Rec = {
  id: string;
  title: string;
  tags: string[];
  slots: string;
  timeline: string;
  owner: string;
};

export function RecommendedProjects({
  items,
  profileIncomplete,
}: {
  items: Rec[];
  profileIncomplete: boolean;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-50">
          Recommended projects
        </p>
        <Link
          href="/explore"
          className="text-xs text-slate-300/80 transition hover:text-slate-100"
        >
          View all
        </Link>
      </div>

      <p className="mt-1 text-sm text-slate-300/80">
        Quick picks based on your skills.
      </p>

      <div className="mt-4 space-y-3">
        {items.slice(0, 4).map((it, idx) => (
          <motion.div
            key={it.id}
            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.35, delay: idx * 0.04, ease: "easeOut" }}
            className="rounded-2xl border border-white/10 bg-black/20 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-100">{it.title}</p>
                <p className="mt-1 text-xs text-slate-300/70">
                  {it.owner} • {it.slots} • {it.timeline}
                </p>
              </div>

              {profileIncomplete ? (
                <span
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-200/70"
                  title="Complete your profile to request"
                >
                  Locked
                </span>
              ) : (
                <span className="rounded-full border border-sky-500/25 bg-sky-500/10 px-2 py-1 text-[10px] font-semibold text-sky-100">
                  Join
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {it.tags.slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-200/90"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-3">
              <Link
                href={`/projects/${it.id}`}
                className="text-xs text-slate-300/80 transition hover:text-slate-100"
              >
                View details →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
