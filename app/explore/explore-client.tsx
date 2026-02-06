"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Filter, X, Users, Clock,
    Sparkles, Rocket, User, ChevronRight, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Project = {
    id: string;
    title: string;
    description: string;
    projectType: string;
    skillsRequired: string[] | null;
    rolesNeeded: string[] | null;
    teamSizeMax: number | null;
    teamSizeCurrent: number | null;
    deadline: Date | null;
    commitmentLevel: string | null;
    status: string | null;
    createdAt: Date;
    ownerId: string;
    ownerName: string | null;
    ownerCollabspaceId: string | null;
    ownerImage: string | null;
};

type Filters = {
    q: string;
    type: string;
    skill: string;
};

const projectTypes = [
    { value: "all", label: "All Types", emoji: "🎯" },
    { value: "hackathon", label: "Hackathon", emoji: "⚡" },
    { value: "personal", label: "Personal", emoji: "💡" },
    { value: "startup", label: "Startup", emoji: "🚀" },
    { value: "open-source", label: "Open Source", emoji: "🌐" },
    { value: "research", label: "Research", emoji: "🔬" },
    { value: "college", label: "College", emoji: "🎓" },
];

export function ExploreClient({
    initialProjects,
    initialFilters,
}: {
    initialProjects: Project[];
    initialFilters: Filters;
}) {
    const router = useRouter();
    const [search, setSearch] = useState(initialFilters.q);
    const [type, setType] = useState(initialFilters.type);
    const [showFilters, setShowFilters] = useState(false);
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search
    const searchProjects = useCallback(async (query: string, projectType: string) => {
        setIsSearching(true);
        try {
            const params = new URLSearchParams();
            if (query) params.set("q", query);
            if (projectType && projectType !== "all") params.set("type", projectType);

            const res = await fetch(`/api/projects/search?${params.toString()}`);
            const data = await res.json();
            setProjects(data.projects || []);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Real-time search with debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            searchProjects(search, type);
        }, 300);

        return () => clearTimeout(timer);
    }, [search, type, searchProjects]);

    const clearFilters = () => {
        setSearch("");
        setType("all");
    };

    const getTimeRemaining = (deadline: Date | null) => {
        if (!deadline) return "Flexible";
        const now = new Date();
        const diff = new Date(deadline).getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return "Ended";
        if (days === 0) return "Today";
        if (days === 1) return "1 day";
        if (days < 7) return `${days}d`;
        if (days < 30) return `${Math.ceil(days / 7)}w`;
        return `${Math.ceil(days / 30)}mo`;
    };

    const getTypeStyle = (projectType: string) => {
        const styles: Record<string, { bg: string; border: string; text: string }> = {
            hackathon: { bg: "from-orange-500/20 to-red-500/10", border: "border-orange-500/30", text: "text-orange-200" },
            startup: { bg: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/30", text: "text-violet-200" },
            "open-source": { bg: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/30", text: "text-emerald-200" },
            research: { bg: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/30", text: "text-blue-200" },
            college: { bg: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/30", text: "text-amber-200" },
            personal: { bg: "from-pink-500/20 to-rose-500/10", border: "border-pink-500/30", text: "text-pink-200" },
        };
        return styles[projectType] || { bg: "from-slate-500/20 to-slate-600/10", border: "border-slate-500/30", text: "text-slate-200" };
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30">
                        <Sparkles className="h-5 w-5 text-violet-400" />
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-50">Explore Projects</h1>
                </div>
                <p className="text-sm text-slate-400 ml-[52px]">
                    Discover projects and find your next collaboration
                </p>
            </motion.div>

            {/* Search & Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-8"
            >
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-4 backdrop-blur-xl">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search projects by name, description, or skills..."
                                className="pl-11 pr-10"
                            />
                            {isSearching && (
                                <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
                            )}
                        </div>
                        <Button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`rounded-xl border px-4 transition ${showFilters
                                ? "border-violet-500/30 bg-violet-500/20 text-violet-200"
                                : "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                                }`}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Filters
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 border-t border-white/10 pt-4">
                                    <p className="text-xs font-medium text-slate-400 mb-3">Project Type</p>
                                    <div className="flex flex-wrap gap-2">
                                        {projectTypes.map((pt) => (
                                            <button
                                                key={pt.value}
                                                onClick={() => setType(pt.value)}
                                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm transition ${type === pt.value
                                                    ? "bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/30 text-violet-200"
                                                    : "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
                                                    }`}
                                            >
                                                <span>{pt.emoji}</span>
                                                {pt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {(search || type !== "all") && (
                                        <button
                                            onClick={clearFilters}
                                            className="mt-4 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-300 transition"
                                        >
                                            <X className="h-4 w-4" />
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Results Count */}
            {(search || type !== "all") && (
                <p className="mb-4 text-sm text-slate-400">
                    {projects.length} project{projects.length !== 1 ? "s" : ""} found
                </p>
            )}

            {/* Results */}
            {projects.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-12 text-center backdrop-blur-xl"
                >
                    <Rocket className="mx-auto h-16 w-16 text-slate-600" />
                    <h3 className="mt-4 text-lg font-medium text-slate-200">No projects found</h3>
                    <p className="mt-2 text-sm text-slate-400">
                        {search || type !== "all"
                            ? "Try adjusting your filters"
                            : "Be the first to create a project!"}
                    </p>
                    <Link
                        href="/app/projects/new"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                    >
                        <Rocket className="h-4 w-4" />
                        Create Project
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    key={`${search}-${type}`}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {projects.map((project) => {
                        const style = getTypeStyle(project.projectType);
                        return (
                            <motion.div key={project.id} variants={item}>
                                <Link
                                    href={`/explore/${project.id}`}
                                    className={`group block h-full rounded-2xl border ${style.border} bg-gradient-to-br ${style.bg} p-5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`rounded-lg px-2 py-0.5 text-[10px] font-medium bg-white/10 ${style.text}`}>
                                                    {project.projectType}
                                                </span>
                                                {project.commitmentLevel && (
                                                    <span className="text-[10px] text-slate-500">{project.commitmentLevel}</span>
                                                )}
                                            </div>
                                            <h3 className={`font-semibold ${style.text} group-hover:text-white transition line-clamp-1`}>
                                                {project.title}
                                            </h3>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-slate-300/80 line-clamp-2 mb-4">
                                        {project.description}
                                    </p>

                                    {/* Skills */}
                                    {project.skillsRequired && project.skillsRequired.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {project.skillsRequired.slice(0, 3).map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] text-slate-300"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {project.skillsRequired.length > 3 && (
                                                <span className="text-[10px] text-slate-500">
                                                    +{project.skillsRequired.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                router.push(`/profile/${project.ownerCollabspaceId || project.ownerId}`);
                                            }}
                                            className="flex items-center gap-2 hover:opacity-80 transition"
                                        >
                                            <div className="relative h-6 w-6 overflow-hidden rounded-full border border-white/10">
                                                {project.ownerImage ? (
                                                    <Image src={project.ownerImage} alt="" fill className="object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-white/10">
                                                        <User className="h-3 w-3 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-400 hover:text-sky-400 transition">
                                                @{project.ownerCollabspaceId || "user"}
                                            </span>
                                        </button>

                                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                {project.teamSizeCurrent}/{project.teamSizeMax}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {getTimeRemaining(project.deadline)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
