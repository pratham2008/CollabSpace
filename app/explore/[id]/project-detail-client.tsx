"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    ArrowLeft, Calendar, Users, Clock, Github, Figma, Globe,
    Loader2, Check, Send, User, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendJoinRequestAction } from "./actions";

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
    githubUrl: string | null;
    figmaUrl: string | null;
    liveUrl: string | null;
    createdAt: Date;
    ownerId: string;
    ownerName: string | null;
    ownerCollabspaceId: string | null;
    ownerImage: string | null;
    ownerBio: string | null;
    ownerSkills: string[] | null;
};

type Member = {
    id: string;
    name: string | null;
    collabspaceId: string | null;
    image: string | null;
    role: string | null;
};

export function ProjectDetailClient({
    project,
    members,
    joinStatus,
    isOwner,
    isMember,
    isLoggedIn,
}: {
    project: Project;
    members: Member[];
    joinStatus: string | null;
    isOwner: boolean;
    isMember: boolean;
    isLoggedIn: boolean;
}) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState("");
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const handleJoinRequest = () => {
        startTransition(async () => {
            const res = await sendJoinRequestAction(project.id, message);
            if (res.success) {
                setResult({ success: true, message: res.message || "Request sent!" });
                setShowMessageBox(false);
            } else {
                setResult({ success: false, message: res.error || "Something went wrong" });
            }
        });
    };

    const getTimeRemaining = (deadline: Date | null) => {
        if (!deadline) return "Flexible timeline";
        const now = new Date();
        const diff = new Date(deadline).getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return "Deadline passed";
        if (days === 0) return "Due today";
        if (days === 1) return "1 day remaining";
        if (days < 7) return `${days} days remaining`;
        if (days < 30) return `${Math.ceil(days / 7)} weeks remaining`;
        return `${Math.ceil(days / 30)} months remaining`;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            hackathon: "bg-orange-500/20 text-orange-200 border-orange-500/30",
            startup: "bg-violet-500/20 text-violet-200 border-violet-500/30",
            "open-source": "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
            research: "bg-blue-500/20 text-blue-200 border-blue-500/30",
            college: "bg-amber-500/20 text-amber-200 border-amber-500/30",
            personal: "bg-pink-500/20 text-pink-200 border-pink-500/30",
        };
        return colors[type] || "bg-slate-500/20 text-slate-200 border-slate-500/30";
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 py-6">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to explore
            </button>

            {/* Main content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-6 lg:grid-cols-[1fr,320px]"
            >
                {/* Left: Project details */}
                <div className="space-y-6">
                    {/* Header */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-50">{project.title}</h1>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getTypeColor(project.projectType)}`}>
                                        {project.projectType}
                                    </span>
                                    {project.commitmentLevel && (
                                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                                            {project.commitmentLevel}
                                        </span>
                                    )}
                                    <span className={`rounded-full px-3 py-1 text-xs ${project.status === "open"
                                            ? "bg-emerald-500/20 text-emerald-200"
                                            : "bg-slate-500/20 text-slate-300"
                                        }`}>
                                        {project.status === "open" ? "Open for members" : project.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="mt-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {project.description}
                        </p>

                        {/* Stats */}
                        <div className="mt-6 flex flex-wrap gap-4 border-t border-white/10 pt-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Users className="h-4 w-4" />
                                <span>{project.teamSizeCurrent}/{project.teamSizeMax} members</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Clock className="h-4 w-4" />
                                <span>{getTimeRemaining(project.deadline)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Calendar className="h-4 w-4" />
                                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>

                        {/* Links */}
                        {(project.githubUrl || project.figmaUrl || project.liveUrl) && (
                            <div className="mt-4 flex flex-wrap gap-3 border-t border-white/10 pt-4">
                                {project.githubUrl && (
                                    <a
                                        href={project.githubUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 transition"
                                    >
                                        <Github className="h-4 w-4" />
                                        GitHub
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {project.figmaUrl && (
                                    <a
                                        href={project.figmaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 transition"
                                    >
                                        <Figma className="h-4 w-4" />
                                        Figma
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {project.liveUrl && (
                                    <a
                                        href={project.liveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 transition"
                                    >
                                        <Globe className="h-4 w-4" />
                                        Live Demo
                                        <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Skills & Roles */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <h2 className="text-sm font-semibold text-slate-100">Looking for</h2>

                        {project.skillsRequired && project.skillsRequired.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs text-slate-400 mb-2">Skills needed</p>
                                <div className="flex flex-wrap gap-2">
                                    {project.skillsRequired.map((skill) => (
                                        <span
                                            key={skill}
                                            className="rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs text-sky-200"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {project.rolesNeeded && project.rolesNeeded.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs text-slate-400 mb-2">Roles needed</p>
                                <div className="flex flex-wrap gap-2">
                                    {project.rolesNeeded.map((role) => (
                                        <span
                                            key={role}
                                            className="rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs text-violet-200"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Sidebar */}
                <div className="space-y-6">
                    {/* Join CTA */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                        {!isLoggedIn ? (
                            <div className="text-center">
                                <p className="text-sm text-slate-300">Want to join this project?</p>
                                <Link
                                    href="/login"
                                    className="mt-3 inline-block w-full rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 py-3 text-center text-sm font-semibold text-slate-950"
                                >
                                    Sign in to apply
                                </Link>
                            </div>
                        ) : isOwner ? (
                            <div className="text-center">
                                <p className="text-sm text-slate-300">You own this project</p>
                                <Link
                                    href={`/app/projects/${project.id}`}
                                    className="mt-3 inline-block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-medium text-slate-100 hover:bg-white/10"
                                >
                                    Manage Project
                                </Link>
                            </div>
                        ) : isMember ? (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-emerald-300">
                                    <Check className="h-5 w-5" />
                                    <span className="text-sm font-medium">You're a member</span>
                                </div>
                                <Link
                                    href={`/app/projects/${project.id}`}
                                    className="mt-3 inline-block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-medium text-slate-100 hover:bg-white/10"
                                >
                                    Go to Project
                                </Link>
                            </div>
                        ) : joinStatus === "pending" ? (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-amber-300">
                                    <Clock className="h-5 w-5" />
                                    <span className="text-sm font-medium">Request pending</span>
                                </div>
                                <p className="mt-2 text-xs text-slate-400">Waiting for owner approval</p>
                            </div>
                        ) : joinStatus === "rejected" ? (
                            <div className="text-center">
                                <p className="text-sm text-slate-400">Your previous request was declined</p>
                            </div>
                        ) : result?.success ? (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-emerald-300">
                                    <Check className="h-5 w-5" />
                                    <span className="text-sm font-medium">Request sent!</span>
                                </div>
                                <p className="mt-2 text-xs text-slate-400">{result.message}</p>
                            </div>
                        ) : (
                            <>
                                {!showMessageBox ? (
                                    <Button
                                        onClick={() => setShowMessageBox(true)}
                                        className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 py-6 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.3)]"
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        Request to Join
                                    </Button>
                                ) : (
                                    <div className="space-y-3">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Why do you want to join? (optional)"
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40 resize-none"
                                            rows={3}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => setShowMessageBox(false)}
                                                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-5 text-slate-100 hover:bg-white/10"
                                                disabled={isPending}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleJoinRequest}
                                                disabled={isPending}
                                                className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-5 text-slate-950 font-semibold"
                                            >
                                                {isPending ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Send"
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                {result && !result.success && (
                                    <p className="mt-3 text-xs text-red-300 text-center">{result.message}</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Owner */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                        <h3 className="text-xs font-medium text-slate-400">Project Owner</h3>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
                                {project.ownerImage ? (
                                    <Image
                                        src={project.ownerImage}
                                        alt={project.ownerName || ""}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-100">{project.ownerName}</p>
                                <p className="text-xs text-slate-400">@{project.ownerCollabspaceId}</p>
                            </div>
                        </div>
                        {project.ownerBio && (
                            <p className="mt-3 text-xs text-slate-300/80 line-clamp-2">{project.ownerBio}</p>
                        )}
                    </div>

                    {/* Team */}
                    {members.length > 0 && (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                            <h3 className="text-xs font-medium text-slate-400">Team ({members.length})</h3>
                            <div className="mt-3 space-y-3">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10">
                                            {member.image ? (
                                                <Image
                                                    src={member.image}
                                                    alt={member.name || ""}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/20 to-violet-500/20 text-xs text-slate-300">
                                                    {member.name?.charAt(0) || "?"}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-200">{member.name}</p>
                                            <p className="text-[10px] text-slate-400">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
