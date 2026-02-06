"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Settings, Users, MessageSquare, Clock, Check, X,
    User, Loader2, MoreHorizontal, UserMinus, Crown, ExternalLink,
    Github, Figma, Globe, Calendar, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveRequestAction, rejectRequestAction, removeMemberAction } from "./actions";

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
};

type Member = {
    id: string;
    name: string | null;
    collabspaceId: string | null;
    image: string | null;
    email: string | null;
    skills: string[] | null;
    role: string | null;
    joinedAt: Date | null;
};

type Request = {
    id: string;
    userId: string;
    message: string | null;
    status: string | null;
    createdAt: Date;
    userName: string | null;
    userCollabspaceId: string | null;
    userImage: string | null;
    userSkills: string[] | null;
    userBio: string | null;
};

type Tab = "overview" | "requests" | "team" | "chat";

export function ProjectManageClient({
    project,
    members,
    pendingRequests,
    isOwner,
    currentUserId,
}: {
    project: Project;
    members: Member[];
    pendingRequests: Request[];
    isOwner: boolean;
    currentUserId: string;
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [isPending, startTransition] = useTransition();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const tabs = [
        { id: "overview" as Tab, label: "Overview", icon: Settings },
        ...(isOwner ? [{ id: "requests" as Tab, label: `Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ""}`, icon: Clock }] : []),
        { id: "team" as Tab, label: "Team", icon: Users },
        { id: "chat" as Tab, label: "Chat", icon: MessageSquare },
    ];

    const handleApprove = (requestId: string) => {
        setProcessingId(requestId);
        startTransition(async () => {
            await approveRequestAction(requestId, project.id);
            router.refresh();
            setProcessingId(null);
        });
    };

    const handleReject = (requestId: string) => {
        setProcessingId(requestId);
        startTransition(async () => {
            await rejectRequestAction(requestId);
            router.refresh();
            setProcessingId(null);
        });
    };

    const handleRemoveMember = (memberId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;
        setProcessingId(memberId);
        startTransition(async () => {
            await removeMemberAction(memberId, project.id);
            router.refresh();
            setProcessingId(null);
        });
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
        <div className="mx-auto max-w-5xl space-y-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push("/app")}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                </button>
                <Link
                    href={`/explore/${project.id}`}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
                >
                    View Public Page
                    <ExternalLink className="h-3 w-3" />
                </Link>
            </div>

            {/* Project Title */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-xl font-semibold text-slate-50">{project.title}</h1>
                            {isOwner && (
                                <span className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-200">
                                    <Crown className="h-3 w-3" />
                                    Owner
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getTypeColor(project.projectType)}`}>
                                {project.projectType}
                            </span>
                            <span className={`rounded-full px-3 py-1 text-xs ${project.status === "open" ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-500/20 text-slate-300"}`}>
                                {project.status === "open" ? "Open" : project.status}
                            </span>
                            <span className="text-xs text-slate-400">
                                {members.length + 1}/{project.teamSizeMax} members
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-white/10 text-white"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "overview" && (
                        <OverviewTab project={project} />
                    )}
                    {activeTab === "requests" && isOwner && (
                        <RequestsTab
                            requests={pendingRequests}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            isPending={isPending}
                            processingId={processingId}
                        />
                    )}
                    {activeTab === "team" && (
                        <TeamTab
                            members={members}
                            project={project}
                            isOwner={isOwner}
                            currentUserId={currentUserId}
                            onRemove={handleRemoveMember}
                            isPending={isPending}
                            processingId={processingId}
                        />
                    )}
                    {activeTab === "chat" && (
                        <ChatTab projectId={project.id} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

// Overview Tab
function OverviewTab({ project }: { project: Project }) {
    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <h2 className="text-sm font-semibold text-slate-100 mb-3">Description</h2>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {project.description}
                </p>
            </div>

            <div className="space-y-6">
                {/* Links */}
                {(project.githubUrl || project.figmaUrl || project.liveUrl) && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <h2 className="text-sm font-semibold text-slate-100 mb-3">Project Links</h2>
                        <div className="flex flex-wrap gap-3">
                            {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 transition">
                                    <Github className="h-4 w-4" /> GitHub
                                </a>
                            )}
                            {project.figmaUrl && (
                                <a href={project.figmaUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 transition">
                                    <Figma className="h-4 w-4" /> Figma
                                </a>
                            )}
                            {project.liveUrl && (
                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10 transition">
                                    <Globe className="h-4 w-4" /> Live Demo
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Skills Required */}
                {project.skillsRequired && project.skillsRequired.length > 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                        <h2 className="text-sm font-semibold text-slate-100 mb-3">Skills Required</h2>
                        <div className="flex flex-wrap gap-2">
                            {project.skillsRequired.map((skill) => (
                                <span key={skill} className="rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs text-sky-200">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Project Info */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <h2 className="text-sm font-semibold text-slate-100 mb-3">Details</h2>
                    <div className="space-y-2 text-sm text-slate-300">
                        {project.deadline && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                            </div>
                        )}
                        {project.commitmentLevel && (
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span>Commitment: {project.commitmentLevel}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Requests Tab
function RequestsTab({
    requests,
    onApprove,
    onReject,
    isPending,
    processingId,
}: {
    requests: Request[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    isPending: boolean;
    processingId: string | null;
}) {
    if (requests.length === 0) {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
                <Clock className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-300">No pending requests</h3>
                <p className="text-sm text-slate-400 mt-1">New join requests will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requests.map((request) => (
                <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                    <div className="flex items-start gap-4">
                        <Link href={`/profile/${request.userCollabspaceId}`} className="shrink-0">
                            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
                                {request.userImage ? (
                                    <Image src={request.userImage} alt="" fill className="object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                                        <User className="h-6 w-6 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <Link href={`/profile/${request.userCollabspaceId}`} className="font-medium text-slate-100 hover:text-sky-400 transition">
                                        {request.userName}
                                    </Link>
                                    <p className="text-xs text-slate-400">@{request.userCollabspaceId}</p>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {new Date(request.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {request.message && (
                                <p className="mt-2 text-sm text-slate-300 bg-white/5 rounded-lg p-3">
                                    "{request.message}"
                                </p>
                            )}

                            {request.userSkills && request.userSkills.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {request.userSkills.slice(0, 5).map((skill) => (
                                        <span key={skill} className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">
                                            {skill}
                                        </span>
                                    ))}
                                    {request.userSkills.length > 5 && (
                                        <span className="text-[10px] text-slate-400">+{request.userSkills.length - 5}</span>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 flex gap-2">
                                <Button
                                    onClick={() => onApprove(request.id)}
                                    disabled={isPending && processingId === request.id}
                                    className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 text-xs text-emerald-200 hover:bg-emerald-500/30"
                                >
                                    {isPending && processingId === request.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Check className="h-4 w-4 mr-1" /> Approve
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => onReject(request.id)}
                                    disabled={isPending && processingId === request.id}
                                    className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-xs text-red-200 hover:bg-red-500/30"
                                >
                                    <X className="h-4 w-4 mr-1" /> Decline
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

// Team Tab
function TeamTab({
    members,
    project,
    isOwner,
    currentUserId,
    onRemove,
    isPending,
    processingId,
}: {
    members: Member[];
    project: Project;
    isOwner: boolean;
    currentUserId: string;
    onRemove: (id: string) => void;
    isPending: boolean;
    processingId: string | null;
}) {
    return (
        <div className="space-y-4">
            {/* Owner Card */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-amber-500/50">
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                            <Crown className="h-6 w-6 text-amber-400" />
                        </div>
                    </div>
                    <div>
                        <p className="font-medium text-slate-100">Project Owner</p>
                        <p className="text-xs text-slate-400">Full project control</p>
                    </div>
                </div>
            </div>

            {/* Members */}
            {members.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
                    <Users className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                    <h3 className="text-lg font-medium text-slate-300">No team members yet</h3>
                    <p className="text-sm text-slate-400 mt-1">Approved members will appear here</p>
                </div>
            ) : (
                members.map((member) => (
                    <div key={member.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <Link href={`/profile/${member.collabspaceId}`} className="shrink-0">
                                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
                                    {member.image ? (
                                        <Image src={member.image} alt="" fill className="object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                                            <User className="h-6 w-6 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <Link href={`/profile/${member.collabspaceId}`} className="font-medium text-slate-100 hover:text-sky-400 transition">
                                    {member.name}
                                </Link>
                                <p className="text-xs text-slate-400">@{member.collabspaceId} · {member.role || "Member"}</p>
                            </div>
                            {isOwner && member.id !== currentUserId && (
                                <Button
                                    onClick={() => onRemove(member.id)}
                                    disabled={isPending && processingId === member.id}
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 hover:bg-red-500/20"
                                >
                                    {isPending && processingId === member.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserMinus className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// Chat Tab (Placeholder - will be expanded)
function ChatTab({ projectId }: { projectId: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
            <div className="h-[500px] flex flex-col">
                {/* Chat messages area */}
                <div className="flex-1 p-6 flex items-center justify-center">
                    <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                        <h3 className="text-lg font-medium text-slate-300">Team Chat</h3>
                        <p className="text-sm text-slate-400 mt-1">Real-time chat coming soon!</p>
                        <p className="text-xs text-slate-500 mt-2">Your messages will be synced with Pusher</p>
                    </div>
                </div>

                {/* Message input */}
                <div className="border-t border-white/10 p-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                            disabled
                        />
                        <Button className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 text-slate-950" disabled>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
