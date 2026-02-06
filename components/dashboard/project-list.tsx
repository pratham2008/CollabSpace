"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type Project = {
  id: string;
  title: string;
  role: string;
  status: "forming" | "active" | "completed";
};

export function ProjectList({
  projects,
  profileIncomplete,
}: {
  projects: Project[];
  profileIncomplete: boolean;
}) {
  const statusLabel =
    (s: Project["status"]) =>
      s === "forming" ? "Forming" : s === "active" ? "Active" : "Completed";

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-50">Your projects</p>
          <p className="mt-1 text-sm text-slate-300/80">
            Owned and joined projects show up here.
          </p>
        </div>

        {profileIncomplete ? (
          <button
            type="button"
            disabled
            className="h-10 cursor-not-allowed rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200/60"
            title="Complete your profile to create projects"
          >
            Create project
          </button>
        ) : (
          <Link
            href="/app/projects/new"
            className="inline-flex h-10 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 px-4 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/15"
          >
            Create project
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4"
        >
          <p className="text-sm font-medium text-slate-100">
            No projects yet.
          </p>
          <p className="mt-1 text-sm text-slate-300/80">
            Explore public projects or create your own once your profile is
            complete.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/explore"
              className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              Explore projects
            </Link>
            {profileIncomplete ? (
              <button
                type="button"
                disabled
                className="h-10 cursor-not-allowed rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200/60"
                title="Complete your profile to create projects"
              >
                Create project
              </button>
            ) : (
              <Link
                href="/app/projects/new"
                className="inline-flex h-10 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 px-4 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/15"
              >
                Create project
              </Link>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="mt-5 space-y-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/app/projects/${p.id}`}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 transition hover:bg-black/30"
            >
              <div>
                <p className="text-sm font-medium text-slate-100">{p.title}</p>
                <p className="mt-1 text-xs text-slate-300/70">
                  Role: {p.role}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-slate-200/90">
                {statusLabel(p.status)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
