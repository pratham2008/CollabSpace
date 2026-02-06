"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, Trash2, X, Rocket, UserPlus, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string | null;
    metadata: Record<string, string> | null;
    read: boolean;
    createdAt: string;
};

export function NotificationsDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    // Fetch on mount and periodically
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // every 30s
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Mark single as read
    const markAsRead = async (id: string) => {
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId: id }),
        });
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // Mark all as read
    const markAllAsRead = async () => {
        setLoading(true);
        await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markAll: true }),
        });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        setLoading(false);
    };

    // Delete notification
    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
        setNotifications(prev => prev.filter(n => n.id !== id));
        setUnreadCount(prev => {
            const wasUnread = notifications.find(n => n.id === id && !n.read);
            return wasUnread ? Math.max(0, prev - 1) : prev;
        });
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "join_request":
                return <UserPlus className="h-4 w-4 text-sky-400" />;
            case "request_accepted":
                return <Check className="h-4 w-4 text-emerald-400" />;
            case "request_rejected":
                return <X className="h-4 w-4 text-red-400" />;
            case "new_message":
                return <MessageSquare className="h-4 w-4 text-violet-400" />;
            case "project_update":
                return <Rocket className="h-4 w-4 text-amber-400" />;
            default:
                return <AlertCircle className="h-4 w-4 text-slate-400" />;
        }
    };

    const getNotificationLink = (notification: Notification): string => {
        const metadata = notification.metadata as Record<string, string> | null;
        if (!metadata) return "#";

        if (metadata.projectId) {
            if (notification.type === "join_request" && metadata.requestId) {
                return `/app/projects/${metadata.projectId}/requests`;
            }
            return `/explore/${metadata.projectId}`;
        }
        return "#";
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
            >
                <Bell className="h-4 w-4 text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-slate-900/98 backdrop-blur-xl shadow-2xl z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                            <h3 className="font-semibold text-slate-100">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition disabled:opacity-50"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[360px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Bell className="h-10 w-10 text-slate-600 mb-2" />
                                    <p className="text-sm text-slate-400">No notifications yet</p>
                                    <p className="text-xs text-slate-500 mt-1">We&apos;ll notify you when something happens</p>
                                </div>
                            ) : (
                                <div className="py-1">
                                    {notifications.map((notification) => (
                                        <Link
                                            key={notification.id}
                                            href={getNotificationLink(notification)}
                                            onClick={() => !notification.read && markAsRead(notification.id)}
                                            className={`group flex items-start gap-3 px-4 py-3 transition hover:bg-white/5 ${!notification.read ? "bg-sky-500/5" : ""
                                                }`}
                                        >
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/5">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.read ? "text-slate-100 font-medium" : "text-slate-300"}`}>
                                                    {notification.title}
                                                </p>
                                                {notification.message && (
                                                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                                                        {notification.message}
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-slate-500 mt-1">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => deleteNotification(notification.id, e)}
                                                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-white/10 rounded"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 text-slate-500 hover:text-red-400" />
                                            </button>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="border-t border-white/10 px-4 py-2">
                                <Link
                                    href="/app/notifications"
                                    className="block text-center text-xs text-sky-400 hover:text-sky-300 transition"
                                >
                                    View all notifications
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
