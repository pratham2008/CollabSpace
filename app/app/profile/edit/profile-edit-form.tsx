"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Check, X, User, Briefcase, MapPin, Clock, Code, Link as LinkIcon, Github, Linkedin, Globe, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileAction, checkCollabspaceIdAvailable, setPasswordAction } from "./actions";
import { filterSkills, SKILLS_LIST } from "@/lib/skills";

type User = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    collabspaceId: string | null;
    bio: string | null;
    profession: string | null;
    location: string | null;
    skills: string[] | null;
    availabilityHours: number | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    profileCompletion: number | null;
    passwordHash: string | null; // to check if user has password
};

export function ProfileEditForm({ user }: { user: User }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Controlled form state
    const [firstName, setFirstName] = useState(user.firstName || "");
    const [lastName, setLastName] = useState(user.lastName || "");
    const [collabspaceId, setCollabspaceId] = useState(user.collabspaceId || "");
    const [bio, setBio] = useState(user.bio || "");
    const [profession, setProfession] = useState(user.profession || "");
    const [location, setLocation] = useState(user.location || "");
    const [availabilityHours, setAvailabilityHours] = useState(user.availabilityHours?.toString() || "");
    const [githubUrl, setGithubUrl] = useState(user.githubUrl || "");
    const [linkedinUrl, setLinkedinUrl] = useState(user.linkedinUrl || "");
    const [portfolioUrl, setPortfolioUrl] = useState(user.portfolioUrl || "");

    // CollabSpace ID validation
    const [idCheckPending, setIdCheckPending] = useState(false);
    const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
    const originalId = useRef(user.collabspaceId);

    // Skills with autocomplete
    const [skills, setSkills] = useState<string[]>(user.skills || []);
    const [skillInput, setSkillInput] = useState("");
    const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Password section
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [hasSetPasswordInSession, setHasSetPasswordInSession] = useState(false); // Track if password was set THIS session
    const hasPassword = !!user.passwordHash || hasSetPasswordInSession;

    // Calculate profile completion (only required fields)
    const calculateCompletion = () => {
        let completed = 0;
        const total = 6; // Required fields: firstName, lastName, collabspaceId, bio, profession, location

        if (firstName) completed++;
        if (lastName) completed++;
        if (collabspaceId && collabspaceId.length >= 3) completed++;
        if (bio && bio.length >= 10) completed++;
        if (profession) completed++;
        if (location) completed++;

        return Math.round((completed / total) * 100);
    };

    const completion = calculateCompletion();

    // Real-time ID validation
    useEffect(() => {
        if (collabspaceId === originalId.current) {
            setIdAvailable(null);
            return;
        }

        if (collabspaceId.length < 3) {
            setIdAvailable(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIdCheckPending(true);
            const available = await checkCollabspaceIdAvailable(collabspaceId, user.id);
            setIdAvailable(available);
            setIdCheckPending(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [collabspaceId, user.id]);

    // Skills autocomplete
    useEffect(() => {
        if (skillInput.length > 0) {
            const filtered = filterSkills(skillInput, skills);
            setSkillSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSkillSuggestions([]);
            setShowSuggestions(false);
        }
    }, [skillInput, skills]);

    const addSkill = (skill: string) => {
        if (!skills.includes(skill)) {
            setSkills([...skills, skill]);
        }
        setSkillInput("");
        setShowSuggestions(false);
    };

    const removeSkill = (skill: string) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleSkillKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && skillInput.trim()) {
            e.preventDefault();
            // If there's a suggestion, use it; otherwise use raw input
            if (skillSuggestions.length > 0) {
                addSkill(skillSuggestions[0]);
            } else if (skillInput.trim().length >= 2) {
                addSkill(skillInput.trim());
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // Require password for OAuth users (hasPassword includes hasSetPasswordInSession)
        if (!hasPassword) {
            setError("Please set a password first before saving your profile. Scroll down to the Password section.");
            return;
        }

        // Validate ID availability
        if (collabspaceId !== originalId.current && idAvailable === false) {
            setError("This CollabSpace ID is already taken");
            return;
        }

        if (collabspaceId.length > 0 && collabspaceId.length < 3) {
            setError("CollabSpace ID must be at least 3 characters");
            return;
        }

        const formData = new FormData();
        formData.append("firstName", firstName);
        formData.append("lastName", lastName);
        formData.append("collabspaceId", collabspaceId);
        formData.append("bio", bio);
        formData.append("profession", profession);
        formData.append("location", location);
        formData.append("availabilityHours", availabilityHours);
        formData.append("skills", skills.join(","));
        formData.append("githubUrl", githubUrl);
        formData.append("linkedinUrl", linkedinUrl);
        formData.append("portfolioUrl", portfolioUrl);

        startTransition(async () => {
            const result = await updateProfileAction(formData);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/app");
                    router.refresh();
                }, 1500);
            } else {
                setError(result.error || "Something went wrong");
            }
        });
    };

    const handleSetPassword = async () => {
        setPasswordError(null);
        setPasswordSuccess(false);

        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError("Passwords don't match");
            return;
        }

        // If user already has password, require current password
        if (hasPassword && !currentPassword) {
            setPasswordError("Please enter your current password");
            return;
        }

        startTransition(async () => {
            const result = await setPasswordAction(newPassword, hasPassword && !hasSetPasswordInSession ? currentPassword : undefined);
            if (result.success) {
                setPasswordSuccess(true);
                setHasSetPasswordInSession(true); // Mark that password was set in this session
                setNewPassword("");
                setConfirmNewPassword("");
                setCurrentPassword("");
                setShowPasswordSection(false);
                setTimeout(() => setPasswordSuccess(false), 3000);
            } else {
                setPasswordError(result.error || "Failed to set password");
            }
        });
    };

    const professions = [
        "Student",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "UI/UX Designer",
        "Product Manager",
        "Data Scientist",
        "ML Engineer",
        "DevOps Engineer",
        "Mobile Developer",
        "Freelancer",
        "Other",
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Profile Completion Bar */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-sky-500/10 to-violet-500/10 p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-200">Profile Completion</span>
                    <span className={`text-sm font-semibold ${completion >= 80 ? 'text-emerald-400' : completion >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {completion}%
                    </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${completion >= 80 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' :
                            completion >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                'bg-gradient-to-r from-red-500 to-orange-500'
                            }`}
                        style={{ width: `${completion}%` }}
                    />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                    {completion >= 80
                        ? "✓ You can create and join projects!"
                        : `Fill required fields to reach 80%. Need ${80 - completion}% more.`}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Display (read-only) */}
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-sky-400" />
                        <h2 className="text-sm font-semibold text-slate-100">Account</h2>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">Email</label>
                        <div className="flex h-11 w-full items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-400">
                            {user.email}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">Your email cannot be changed</p>
                    </div>
                </section>

                {/* Basic Info Section */}
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <User className="h-4 w-4 text-sky-400" />
                        <h2 className="text-sm font-semibold text-slate-100">Basic Information</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-300">First name *</label>
                            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your first name" required disabled={isPending} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-300">Last name *</label>
                            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Your last name" required disabled={isPending} />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">CollabSpace ID *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">@</span>
                            <Input
                                value={collabspaceId}
                                onChange={(e) => setCollabspaceId(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                                placeholder="yourname"
                                className="pl-8 pr-10"
                                required
                                disabled={isPending}
                            />
                            {collabspaceId.length >= 3 && collabspaceId !== originalId.current && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {idCheckPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                    ) : idAvailable ? (
                                        <Check className="h-4 w-4 text-emerald-400" />
                                    ) : idAvailable === false ? (
                                        <X className="h-4 w-4 text-red-400" />
                                    ) : null}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400">
                            {collabspaceId.length > 0 && collabspaceId.length < 3
                                ? "Minimum 3 characters required"
                                : idAvailable === false
                                    ? "This ID is already taken"
                                    : "Letters, numbers, dots, underscores, hyphens only"}
                        </p>
                    </div>

                    <div className="mt-4">
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">Bio *</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell others about yourself, your interests, and what you're working on..."
                            className="flex min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            disabled={isPending}
                        />
                    </div>
                </section>

                {/* Professional Info */}
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-sky-400" />
                        <h2 className="text-sm font-semibold text-slate-100">Professional</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-300">Role / Profession *</label>
                            <select
                                value={profession}
                                onChange={(e) => setProfession(e.target.value)}
                                className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isPending}
                                required
                            >
                                <option value="" className="bg-slate-900">Select your role</option>
                                {professions.map((p) => (
                                    <option key={p} value={p} className="bg-slate-900">{p}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                                <MapPin className="h-3 w-3" /> Location *
                            </label>
                            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" disabled={isPending} required />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                            <Clock className="h-3 w-3" /> Hours available per week
                        </label>
                        <Input
                            type="number"
                            min={0}
                            max={60}
                            value={availabilityHours}
                            onChange={(e) => setAvailabilityHours(e.target.value)}
                            placeholder="e.g., 10"
                            disabled={isPending}
                        />
                    </div>
                </section>

                {/* Skills Section with Autocomplete */}
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl relative z-20">
                    <div className="mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4 text-sky-400" />
                        <h2 className="text-sm font-semibold text-slate-100">Skills</h2>
                        <span className="text-xs text-slate-400">(Optional)</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Add skills you know (programming languages, frameworks, tools). This helps project owners find you.</p>

                    <div className="relative">
                        <Input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            onFocus={() => skillInput.length > 0 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder="Type to search skills (e.g., React, Python)..."
                            disabled={isPending}
                        />

                        {/* Autocomplete dropdown */}
                        {showSuggestions && (
                            <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl py-2 shadow-xl max-h-48 overflow-y-auto">
                                {skillSuggestions.map((skill) => (
                                    <button
                                        key={skill}
                                        type="button"
                                        onClick={() => addSkill(skill)}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/10 transition"
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Selected skills */}
                    {skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 border border-sky-500/30 px-3 py-1 text-xs font-medium text-sky-300"
                                >
                                    {skill}
                                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400">
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                {/* Links Section */}
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-sky-400" />
                        <h2 className="text-sm font-semibold text-slate-100">Links</h2>
                        <span className="text-xs text-slate-400">(Optional)</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                                <Github className="h-3 w-3" /> GitHub
                            </label>
                            <Input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" disabled={isPending} />
                        </div>
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                                <Linkedin className="h-3 w-3" /> LinkedIn
                            </label>
                            <Input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" disabled={isPending} />
                        </div>
                        <div>
                            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                                <Globe className="h-3 w-3" /> Portfolio
                            </label>
                            <Input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://yourportfolio.com" disabled={isPending} />
                        </div>
                    </div>
                </section>

                {/* Error / Success */}
                {error && (
                    <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Profile updated! Redirecting...
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-3">
                    <Button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 py-6 text-slate-100 hover:bg-white/10"
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending || (collabspaceId !== originalId.current && idAvailable === false)}
                        className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 py-6 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.3)] disabled:opacity-50"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Profile"
                        )}
                    </Button>
                </div>
            </form>

            {/* Password Section (separate from main form) */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-sky-400" />
                        <h2 className="text-sm font-semibold text-slate-100">
                            {hasPassword ? "Change Password" : "Set Password"}
                        </h2>
                    </div>
                    {!showPasswordSection && (
                        <Button
                            type="button"
                            onClick={() => setShowPasswordSection(true)}
                            className="h-8 rounded-lg border border-white/10 bg-white/5 px-3 text-xs text-slate-300 hover:bg-white/10"
                        >
                            {hasPassword ? "Change" : "Set Password"}
                        </Button>
                    )}
                </div>

                {!hasPassword && !showPasswordSection && (
                    <p className="text-xs text-slate-400">
                        You signed up with Google. Set a password to also log in with email.
                    </p>
                )}

                {passwordSuccess && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Password {hasPassword ? "changed" : "set"} successfully!
                    </div>
                )}

                {showPasswordSection && (
                    <div className="space-y-4">
                        {hasPassword && (
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-300">Current Password</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    disabled={isPending}
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-300">
                                {hasPassword ? "New Password" : "Password"}
                            </label>
                            <div className="relative">
                                <Input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    disabled={isPending}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                >
                                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-300">Confirm Password</label>
                            <Input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="Confirm password"
                                disabled={isPending}
                            />
                            {confirmNewPassword && newPassword !== confirmNewPassword && (
                                <p className="mt-1 text-[11px] text-red-400">Passwords don&apos;t match</p>
                            )}
                        </div>

                        {passwordError && (
                            <p className="text-sm text-red-400">{passwordError}</p>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={() => {
                                    setShowPasswordSection(false);
                                    setNewPassword("");
                                    setConfirmNewPassword("");
                                    setCurrentPassword("");
                                    setPasswordError(null);
                                }}
                                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-5 text-slate-100 hover:bg-white/10"
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSetPassword}
                                disabled={isPending || !newPassword || newPassword !== confirmNewPassword || (hasPassword && !currentPassword)}
                                className="flex-1 rounded-xl bg-sky-500 py-5 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : hasPassword ? "Change Password" : "Set Password"}
                            </Button>
                        </div>
                    </div>
                )}
            </section>
        </motion.div>
    );
}
