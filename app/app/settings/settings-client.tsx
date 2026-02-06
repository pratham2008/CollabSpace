"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    ArrowLeft, User, Mail, Shield, Key, Bell, Trash2,
    Check, X, Loader2, Lock, Eye, EyeOff, BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserData = {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    collabspaceId: string | null;
    image: string | null;
    hasPassword: boolean | null;
    createdAt: Date;
};

export function SettingsClient({ user }: { user: UserData }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Password change state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Notification preferences (local state for now)
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [projectUpdates, setProjectUpdates] = useState(true);
    const [chatMessages, setChatMessages] = useState(true);

    const handlePasswordChange = async () => {
        setPasswordError(null);

        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match");
            return;
        }

        startTransition(async () => {
            try {
                const res = await fetch("/api/user/password", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        currentPassword: user.hasPassword ? currentPassword : undefined,
                        newPassword,
                    }),
                });

                const data = await res.json();

                if (res.ok) {
                    setPasswordSuccess(true);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowPasswordSection(false);
                    setTimeout(() => setPasswordSuccess(false), 3000);
                } else {
                    setPasswordError(data.error || "Failed to update password");
                }
            } catch (error) {
                setPasswordError("An error occurred");
            }
        });
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6 py-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.push("/app")}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl font-semibold text-slate-50">Settings</h1>
                <p className="text-sm text-slate-400 mt-1">Manage your account settings and preferences</p>
            </motion.div>

            {/* Account Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
                <h2 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <User className="h-4 w-4 text-sky-400" />
                    Account
                </h2>

                <div className="space-y-4">
                    {/* Profile Info */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white/10">
                            {user.image ? (
                                <Image src={user.image} alt="" fill className="object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                                    <User className="h-7 w-7 text-slate-400" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-slate-100">{user.name}</p>
                            <p className="text-sm text-slate-400">@{user.collabspaceId}</p>
                        </div>
                        <Link
                            href="/app/profile/edit"
                            className="ml-auto rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10 transition"
                        >
                            Edit Profile
                        </Link>
                    </div>

                    {/* Email Verification Status */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="text-sm text-slate-200">{user.email}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {user.emailVerified ? (
                                        <>
                                            <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
                                            <span className="text-xs text-emerald-400">Verified</span>
                                        </>
                                    ) : (
                                        <>
                                            <X className="h-3.5 w-3.5 text-amber-400" />
                                            <span className="text-xs text-amber-400">Not verified</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        {!user.emailVerified && (
                            <Button className="rounded-lg bg-amber-500/20 border border-amber-500/30 px-4 py-2 text-xs text-amber-200 hover:bg-amber-500/30">
                                Verify Email
                            </Button>
                        )}
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        <Shield className="h-5 w-5 text-slate-400" />
                        <div>
                            <p className="text-sm text-slate-200">Member since</p>
                            <p className="text-xs text-slate-400">
                                {new Date(user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Password Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
                <h2 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <Key className="h-4 w-4 text-violet-400" />
                    Password
                </h2>

                {passwordSuccess && (
                    <div className="mb-4 p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-sm flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Password updated successfully!
                    </div>
                )}

                {!showPasswordSection ? (
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                            <Lock className="h-5 w-5 text-slate-400" />
                            <div>
                                <p className="text-sm text-slate-200">
                                    {user.hasPassword ? "Password is set" : "No password set"}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {user.hasPassword
                                        ? "Change your password anytime"
                                        : "Set a password for email login"
                                    }
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowPasswordSection(true)}
                            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
                        >
                            {user.hasPassword ? "Change Password" : "Set Password"}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {user.hasPassword && (
                            <div>
                                <label className="text-xs text-slate-400 mb-1.5 block">Current Password</label>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="rounded-xl border-white/10 bg-white/5 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-slate-400 mb-1.5 block">New Password</label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="rounded-xl border-white/10 bg-white/5 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 mb-1.5 block">Confirm New Password</label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="rounded-xl border-white/10 bg-white/5"
                            />
                        </div>

                        {passwordError && (
                            <p className="text-xs text-red-400">{passwordError}</p>
                        )}

                        <div className="flex gap-3">
                            <Button
                                onClick={() => {
                                    setShowPasswordSection(false);
                                    setCurrentPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                    setPasswordError(null);
                                }}
                                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-5 text-slate-300 hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handlePasswordChange}
                                disabled={isPending}
                                className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 py-5 text-slate-950 font-semibold"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Notifications Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
            >
                <h2 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-400" />
                    Notifications
                </h2>

                <div className="space-y-3">
                    <ToggleSetting
                        label="Email Notifications"
                        description="Receive email updates about your account"
                        checked={emailNotifications}
                        onChange={setEmailNotifications}
                    />
                    <ToggleSetting
                        label="Project Updates"
                        description="Get notified about project activity"
                        checked={projectUpdates}
                        onChange={setProjectUpdates}
                    />
                    <ToggleSetting
                        label="Chat Messages"
                        description="Receive notifications for new messages"
                        checked={chatMessages}
                        onChange={setChatMessages}
                    />
                </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 backdrop-blur-xl"
            >
                <h2 className="text-sm font-semibold text-red-300 mb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Danger Zone
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-xs text-red-300 hover:bg-red-500/30">
                    Delete Account
                </Button>
            </motion.div>
        </div>
    );
}

// Toggle Setting Component
function ToggleSetting({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
                <p className="text-sm text-slate-200">{label}</p>
                <p className="text-xs text-slate-400">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-sky-500" : "bg-slate-700"
                    }`}
            >
                <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"
                        }`}
                />
            </button>
        </div>
    );
}
