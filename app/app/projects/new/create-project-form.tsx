"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Check, Rocket, Users, Clock, Link as LinkIcon, Github, Figma, X, Code } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createProjectAction } from "./actions";
import { filterSkills } from "@/lib/skills";

export function CreateProjectForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Skills with autocomplete
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState("");
    const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Skills autocomplete logic
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
            if (skillSuggestions.length > 0) {
                addSkill(skillSuggestions[0]);
            } else if (skillInput.trim().length >= 2) {
                addSkill(skillInput.trim());
            }
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setError(null);
        setSuccess(false);

        // Add skills to form data
        formData.set("skillsRequired", skills.join(","));

        startTransition(async () => {
            const result = await createProjectAction(formData);
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

    const projectTypes = [
        { value: "hackathon", label: "Hackathon" },
        { value: "personal", label: "Personal Project" },
        { value: "startup", label: "Startup Idea" },
        { value: "open-source", label: "Open Source" },
        { value: "research", label: "Research" },
        { value: "college", label: "College Project" },
        { value: "other", label: "Other" },
    ];

    const commitmentLevels = [
        { value: "flexible", label: "Flexible" },
        { value: "part-time", label: "Part-time (5-15 hrs/week)" },
        { value: "full-time", label: "Full-time (30+ hrs/week)" },
    ];

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            action={handleSubmit}
            className="space-y-6"
        >
            {/* Basic Info */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-sky-400" />
                    <h2 className="text-sm font-semibold text-slate-100">Project Details</h2>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                        Project Title *
                    </label>
                    <Input
                        name="title"
                        placeholder="e.g., AI Resume Reviewer"
                        required
                        minLength={5}
                        disabled={isPending}
                    />
                </div>

                <div className="mt-4">
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        placeholder="Describe your project idea, what problem it solves, and what you're looking to build..."
                        className="flex min-h-[120px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400/60 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        required
                        minLength={20}
                        disabled={isPending}
                    />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">
                            Project Type *
                        </label>
                        <select
                            name="projectType"
                            className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
                            required
                            disabled={isPending}
                        >
                            <option value="" className="bg-slate-900">Select type</option>
                            {projectTypes.map((type) => (
                                <option key={type.value} value={type.value} className="bg-slate-900">
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">
                            Commitment Level
                        </label>
                        <select
                            name="commitmentLevel"
                            className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/50 hover:border-white/20 hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isPending}
                        >
                            {commitmentLevels.map((level) => (
                                <option key={level.value} value={level.value} className="bg-slate-900">
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            {/* Team Requirements */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl relative z-20">
                <div className="mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-sky-400" />
                    <h2 className="text-sm font-semibold text-slate-100">Team Requirements</h2>
                </div>

                {/* Skills with Autocomplete */}
                <div className="mb-4">
                    <div className="mb-1.5 flex items-center gap-2">
                        <Code className="h-3 w-3 text-slate-400" />
                        <label className="text-xs font-medium text-slate-300">
                            Skills Required
                        </label>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">Add the skills you need for your team (e.g., React, Python, Figma)</p>

                    <div className="relative">
                        <Input
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            onFocus={() => skillInput.length > 0 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            placeholder="Type to search skills..."
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
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-300">
                        Roles Needed (comma-separated)
                    </label>
                    <Input
                        name="rolesNeeded"
                        placeholder="Frontend Developer, Backend Developer, Designer..."
                        disabled={isPending}
                    />
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-300">
                            Team Size (max)
                        </label>
                        <Input
                            name="teamSizeMax"
                            type="number"
                            min={2}
                            max={20}
                            defaultValue={5}
                            disabled={isPending}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                            <Clock className="h-3 w-3" /> Deadline
                        </label>
                        <Input
                            name="deadline"
                            type="date"
                            disabled={isPending}
                        />
                    </div>
                </div>
            </section>

            {/* Links */}
            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                <div className="mb-4 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-sky-400" />
                    <h2 className="text-sm font-semibold text-slate-100">Project Links (optional)</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                            <Github className="h-3 w-3" /> GitHub Repository
                        </label>
                        <Input
                            name="githubUrl"
                            type="url"
                            placeholder="https://github.com/..."
                            disabled={isPending}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-300">
                            <Figma className="h-3 w-3" /> Figma / Design Link
                        </label>
                        <Input
                            name="figmaUrl"
                            type="url"
                            placeholder="https://figma.com/..."
                            disabled={isPending}
                        />
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
                    Project created! Redirecting...
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
                    disabled={isPending}
                    className="flex-1 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 py-6 text-sm font-semibold text-slate-950 shadow-[0_0_30px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.4)] disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        "Create Project"
                    )}
                </Button>
            </div>
        </motion.form>
    );
}
