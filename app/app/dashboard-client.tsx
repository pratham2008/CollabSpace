"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    User, MapPin, Briefcase, Plus, Rocket, Users, Clock,
    ArrowRight, Sparkles, Target, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

type UserData = {
    id: string;
    name: string;
    collabspaceId: string | null;
    profession: string | null;
    location: string | null;
    bio: string | null;
    skills: string[];
    profileCompletion: number;
    profileComplete: boolean;
    image: string | null;
};

type Project = {
    id: string;
    title: string;
    description: string | null;
    status: string | null;
    projectType: string;
    teamSizeCurrent: number | null;
    teamSizeMax: number | null;
    createdAt: Date;
    role: string;
};

type RecommendedProject = {
    id: string;
    title: string;
    description: string;
    skillsRequired: string[] | null;
    teamSizeMax: number | null;
    teamSizeCurrent: number | null;
    deadline: Date | null;
    projectType: string;
    ownerId: string;
    ownerName: string | null;
    ownerCollabspaceId: string | null;
    ownerImage: string | null;
};

export function DashboardClient({
    user,
    projects,
    recommended,
}: {
    user: UserData;
    projects: Project[];
    recommended: RecommendedProject[];
}) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            hackathon: "from-orange-500/20 to-red-500/20 border-orange-500/30",
            startup: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
            "open-source": "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
            research: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
            college: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
            personal: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
        };
        return colors[type] || "from-slate-500/20 to-slate-600/20 border-slate-500/30";
    };

    return (
        <div className="py-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-2xl font-semibold text-slate-50">
                    Welcome back, {user.name.split(" ")[0]}! 👋
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                    Here&apos;s what&apos;s happening with your projects
                </p>
            </motion.div>

            {/* Profile Completion Banner */}
            {!user.profileComplete && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 p-6"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/20">
                                <Target className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-100">Complete your profile</h3>
                                <p className="mt-0.5 text-sm text-slate-300/80">
                                    Your profile is {user.profileCompletion}% complete. Reach 80% to create or join projects.
                                </p>
                                <div className="mt-3 h-2 w-48 overflow-hidden rounded-full bg-white/10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${user.profileCompletion}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                                    />
                                </div>
                            </div>
                        </div>
                        <Link
                            href="/app/profile/edit"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                        >
                            <Sparkles className="h-4 w-4" />
                            Complete Profile
                        </Link>
                    </div>
                </motion.div>
            )}

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 lg:grid-cols-3"
            >
                {/* Left Column - Profile Card */}
                <motion.div variants={item} className="lg:col-span-1">
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-6 backdrop-blur-xl">
                        {/* Avatar & Name */}
                        <div className="flex flex-col items-center text-center">
                            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/10 bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                                {user.image ? (
                                    <Image src={user.image} alt={user.name} fill className="object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <User className="h-10 w-10 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <h2 className="mt-4 text-lg font-semibold text-slate-100">{user.name}</h2>
                            {user.collabspaceId && (
                                <p className="text-sm text-slate-400">@{user.collabspaceId}</p>
                            )}
                        </div>

                        {/* Info */}
                        <div className="mt-5 space-y-2">
                            {user.profession && (
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Briefcase className="h-4 w-4 text-sky-400" />
                                    {user.profession}
                                </div>
                            )}
                            {user.location && (
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                    {user.location}
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        {user.skills.length > 0 && (
                            <div className="mt-5">
                                <p className="text-xs font-medium text-slate-400 mb-2">Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {user.skills.slice(0, 6).map((skill) => (
                                        <span
                                            key={skill}
                                            className="rounded-full bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 text-[11px] text-sky-200"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex gap-2">
                            <Link
                                href="/app/profile/edit"
                                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-sm font-medium text-slate-100 transition hover:bg-white/10"
                            >
                                Edit Profile
                            </Link>
                            <Link
                                href="/explore"
                                className="flex-1 rounded-xl bg-gradient-to-r from-sky-500/20 to-violet-500/20 border border-sky-500/20 py-2.5 text-center text-sm font-medium text-sky-200 transition hover:from-sky-500/30 hover:to-violet-500/30"
                            >
                                Explore
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Middle & Right - Projects */}
                <motion.div variants={item} className="lg:col-span-2 space-y-6">
                    {/* Your Projects */}
                    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-6 backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                                    <Rocket className="h-5 w-5 text-sky-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-100">Your Projects</h3>
                                    <p className="text-xs text-slate-400">{projects.length} active</p>
                                </div>
                            </div>
                            {user.profileComplete && (
                                <Link
                                    href="/app/projects/new"
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition hover:shadow-[0_0_30px_rgba(56,189,248,0.4)]"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Project
                                </Link>
                            )}
                        </div>

                        {projects.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                                <Rocket className="mx-auto h-10 w-10 text-slate-500" />
                                <p className="mt-3 text-sm text-slate-400">No projects yet</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    {user.profileComplete
                                        ? "Create your first project or join an existing one"
                                        : "Complete your profile first to create projects"}
                                </p>
                                <div className="mt-4 flex justify-center gap-3">
                                    <Link
                                        href="/explore"
                                        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
                                    >
                                        Browse Projects
                                    </Link>
                                    {user.profileComplete && (
                                        <Link
                                            href="/app/projects/new"
                                            className="rounded-lg bg-sky-500/20 border border-sky-500/30 px-4 py-2 text-sm text-sky-200 transition hover:bg-sky-500/30"
                                        >
                                            Create Project
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {projects.slice(0, 4).map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/app/projects/${project.id}`}
                                        className={`group block rounded-xl border bg-gradient-to-r ${getTypeColor(project.projectType)} p-4 transition hover:scale-[1.01]`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium text-slate-100 group-hover:text-sky-200 transition">
                                                    {project.title}
                                                </h4>
                                                <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {project.teamSizeCurrent}/{project.teamSizeMax}
                                                    </span>
                                                    <span className="capitalize">{project.role}</span>
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] ${project.status === "open"
                                                            ? "bg-emerald-500/20 text-emerald-300"
                                                            : "bg-slate-500/20 text-slate-300"
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition" />
                                        </div>
                                    </Link>
                                ))}
                                {projects.length > 4 && (
                                    <Link
                                        href="/app/projects"
                                        className="block text-center text-sm text-sky-400 hover:text-sky-300 transition py-2"
                                    >
                                        View all {projects.length} projects →
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recommended Projects */}
                    {recommended.length > 0 && (
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-6 backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20">
                                    <Zap className="h-5 w-5 text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-100">Recommended for You</h3>
                                    <p className="text-xs text-slate-400">Projects looking for your skills</p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {recommended.slice(0, 4).map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/explore/${project.id}`}
                                        className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:bg-white/[0.06] hover:border-white/20"
                                    >
                                        <h4 className="font-medium text-slate-100 group-hover:text-violet-200 transition line-clamp-1">
                                            {project.title}
                                        </h4>
                                        <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                                            {project.description}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="relative h-5 w-5 overflow-hidden rounded-full border border-white/10">
                                                    {project.ownerImage ? (
                                                        <Image src={project.ownerImage} alt="" fill className="object-cover" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center bg-white/10 text-[8px] text-slate-300">
                                                            {project.ownerName?.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-slate-500">
                                                    @{project.ownerCollabspaceId || "user"}
                                                </span>
                                            </div>
                                            <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                                <Users className="h-3 w-3" />
                                                {project.teamSizeCurrent}/{project.teamSizeMax}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <Link
                                href="/explore"
                                className="mt-4 block text-center text-sm text-violet-400 hover:text-violet-300 transition"
                            >
                                Explore all projects →
                            </Link>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
