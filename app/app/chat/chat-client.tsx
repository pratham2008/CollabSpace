"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare, Send, User, Hash, ChevronRight, Loader2,
    Users, ArrowLeft, Menu, X, Settings, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPusherClient, getProjectChannelName, CHAT_EVENTS } from "@/lib/pusher";
import { formatDistanceToNow } from "date-fns";

type Project = {
    id: string;
    title: string;
    projectType: string;
    createdAt: Date;
};

type CurrentUser = {
    id: string;
    name: string | null;
    collabspaceId: string | null;
    image: string | null;
};

type Message = {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    senderName: string | null;
    senderCollabspaceId: string | null;
    senderImage: string | null;
};

export function ChatClient({
    projects,
    currentUser,
}: {
    projects: Project[];
    currentUser: CurrentUser;
}) {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showMembers, setShowMembers] = useState(true);
    const [projectMembers, setProjectMembers] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    // Fetch messages when project changes
    useEffect(() => {
        if (!selectedProject) return;

        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/messages?projectId=${selectedProject.id}`);
                const data = await res.json();
                setMessages(data.messages || []);
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [selectedProject, scrollToBottom]);

    // Subscribe to Pusher channel
    useEffect(() => {
        if (!selectedProject) return;

        const pusher = getPusherClient();
        const channelName = getProjectChannelName(selectedProject.id);
        const channel = pusher.subscribe(channelName);

        channel.bind(CHAT_EVENTS.NEW_MESSAGE, (message: Message) => {
            setMessages((prev) => [...prev, message]);
            setTimeout(scrollToBottom, 100);
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(channelName);
        };
    }, [selectedProject, scrollToBottom]);

    // Send message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedProject || isSending) return;

        setIsSending(true);
        try {
            await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: selectedProject.id,
                    content: newMessage.trim(),
                }),
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            hackathon: "text-orange-400",
            startup: "text-violet-400",
            "open-source": "text-emerald-400",
            research: "text-blue-400",
            college: "text-amber-400",
            personal: "text-pink-400",
        };
        return colors[type] || "text-slate-400";
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-slate-950">
            {/* Left Sidebar - Projects */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 border-r border-white/10 bg-slate-900/50 flex flex-col overflow-hidden"
                    >
                        {/* Sidebar Header */}
                        <div className="p-4 border-b border-white/10">
                            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-sky-400" />
                                Team Chats
                            </h2>
                        </div>

                        {/* Projects List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {projects.length === 0 ? (
                                <div className="p-4 text-center">
                                    <p className="text-sm text-slate-400">No projects yet</p>
                                    <Link
                                        href="/explore"
                                        className="text-xs text-sky-400 hover:underline mt-1 inline-block"
                                    >
                                        Find projects to join
                                    </Link>
                                </div>
                            ) : (
                                projects.map((project) => (
                                    <button
                                        key={project.id}
                                        onClick={() => setSelectedProject(project)}
                                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${selectedProject?.id === project.id
                                                ? "bg-white/10 text-white"
                                                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                            }`}
                                    >
                                        <Hash className={`h-5 w-5 ${getTypeColor(project.projectType)}`} />
                                        <span className="flex-1 truncate text-sm font-medium">
                                            {project.title}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>

                        {/* User Footer */}
                        <div className="p-3 border-t border-white/10 bg-slate-900/80">
                            <div className="flex items-center gap-3">
                                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/10">
                                    {currentUser.image ? (
                                        <Image src={currentUser.image} alt="" fill className="object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                                            <User className="h-4 w-4 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-200 truncate">{currentUser.name}</p>
                                    <p className="text-xs text-slate-400 truncate">@{currentUser.collabspaceId}</p>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {!selectedProject ? (
                    // No project selected
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center max-w-md">
                            <MessageSquare className="h-16 w-16 mx-auto text-slate-600 mb-4" />
                            <h2 className="text-xl font-semibold text-slate-300 mb-2">Welcome to Team Chat</h2>
                            <p className="text-sm text-slate-400">
                                Select a project from the sidebar to start chatting with your team.
                            </p>
                            {projects.length === 0 && (
                                <Link
                                    href="/explore"
                                    className="inline-flex items-center gap-2 mt-4 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
                                >
                                    Find Projects <ChevronRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/30">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowSidebar(!showSidebar)}
                                    className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400"
                                >
                                    <Menu className="h-5 w-5" />
                                </button>
                                <Hash className={`h-5 w-5 ${getTypeColor(selectedProject.projectType)}`} />
                                <h2 className="font-semibold text-slate-100">{selectedProject.title}</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`/app/projects/${selectedProject.id}`}
                                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition"
                                >
                                    <ExternalLink className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() => setShowMembers(!showMembers)}
                                    className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 text-slate-400 transition"
                                >
                                    <Users className="h-4 w-4" />
                                    <span className="text-sm">Members</span>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <MessageSquare className="h-12 w-12 mx-auto text-slate-600 mb-3" />
                                        <p className="text-sm text-slate-400">No messages yet. Start the conversation!</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((message, index) => {
                                    const isOwnMessage = message.senderId === currentUser.id;
                                    const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex gap-3 ${showAvatar ? "mt-4" : "mt-0.5"}`}
                                        >
                                            {showAvatar ? (
                                                <Link href={`/profile/${message.senderCollabspaceId}`} className="shrink-0">
                                                    <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10">
                                                        {message.senderImage ? (
                                                            <Image src={message.senderImage} alt="" fill className="object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                                                                <User className="h-5 w-5 text-slate-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="w-10" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                {showAvatar && (
                                                    <div className="flex items-baseline gap-2 mb-0.5">
                                                        <Link
                                                            href={`/profile/${message.senderCollabspaceId}`}
                                                            className={`text-sm font-semibold hover:underline ${isOwnMessage ? "text-sky-400" : "text-slate-200"
                                                                }`}
                                                        >
                                                            {message.senderName}
                                                        </Link>
                                                        <span className="text-[10px] text-slate-500">
                                                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                )}
                                                <p className="text-sm text-slate-300 break-words whitespace-pre-wrap">
                                                    {message.content}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-4 border-t border-white/10 bg-slate-900/30">
                            <form onSubmit={handleSendMessage} className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={`Message #${selectedProject.title.toLowerCase()}`}
                                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                                />
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 text-slate-950 disabled:opacity-50"
                                >
                                    {isSending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </div>

            {/* Right Sidebar - Project Info (Desktop) */}
            <AnimatePresence>
                {selectedProject && showMembers && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 260, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hidden lg:flex flex-shrink-0 border-l border-white/10 bg-slate-900/50 flex-col overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-sm font-semibold text-slate-100">Project Info</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <h4 className="text-xs font-medium text-slate-400 uppercase mb-2">About</h4>
                                <p className="text-sm text-slate-300">{selectedProject.title}</p>
                                <span className={`inline-block mt-1 text-xs ${getTypeColor(selectedProject.projectType)}`}>
                                    {selectedProject.projectType}
                                </span>
                            </div>

                            <div>
                                <h4 className="text-xs font-medium text-slate-400 uppercase mb-2">Quick Links</h4>
                                <div className="space-y-2">
                                    <Link
                                        href={`/app/projects/${selectedProject.id}`}
                                        className="flex items-center gap-2 text-sm text-slate-300 hover:text-sky-400 transition"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Manage Project
                                    </Link>
                                    <Link
                                        href={`/explore/${selectedProject.id}`}
                                        className="flex items-center gap-2 text-sm text-slate-300 hover:text-sky-400 transition"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Public Page
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}
