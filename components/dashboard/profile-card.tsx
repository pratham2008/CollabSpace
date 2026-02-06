"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";

type Profile = {
  displayName: string;
  handle: string;
  profession?: string;
  location?: string;
  completion: number;
  skills: string[];
  incomplete: boolean;
  avatarUrl?: string | null;
};

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/20 to-violet-500/20">
              <User className="h-6 w-6 text-slate-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-base font-semibold text-slate-50">
              {profile.displayName}
            </p>
            {profile.incomplete ? (
              <Badge className="shrink-0 rounded-full border border-amber-300/30 bg-amber-300/10 text-[10px] text-amber-100">
                Incomplete
              </Badge>
            ) : (
              <Badge className="shrink-0 rounded-full border border-emerald-300/25 bg-emerald-300/10 text-[10px] text-emerald-100">
                Complete
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-300/80">@{profile.handle}</p>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        {profile.profession && (
          <p className="text-sm text-slate-200/90">{profile.profession}</p>
        )}
        {profile.location && (
          <p className="text-xs text-slate-300/70">{profile.location}</p>
        )}
      </div>

      {/* Completion */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300/80">Profile strength</span>
          <span className="text-slate-100">{profile.completion}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${profile.completion}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-400"
          />
        </div>
      </div>

      {/* Skills */}
      <div className="mt-4">
        <p className="text-xs font-medium text-slate-300/80">Top skills</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.skills.length > 0 ? (
            profile.skills.slice(0, 6).map((s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-slate-200/90"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400/60 italic">
              Add skills to help find projects
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Link
          href="/app/profile/edit"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
        >
          Edit profile
        </Link>
        <Link
          href="/explore"
          className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/10 text-sm font-semibold text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.18)] transition hover:bg-sky-500/15"
        >
          Explore
        </Link>
      </div>
    </motion.div>
  );
}
