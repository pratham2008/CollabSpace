import { db } from "@/db";
import { users, projects, projectMembers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
    User, MapPin, Briefcase, Clock, Github, Linkedin, Globe,
    Calendar, Rocket, Users, ChevronRight, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Params = {
    id: string;
};

// Check if string is a valid UUID
function isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

async function getUser(id: string) {
    // First try by collabspaceId (always safe)
    const [userByHandle] = await db
        .select()
        .from(users)
        .where(eq(users.collabspaceId, id))
        .limit(1);

    if (userByHandle) return userByHandle;

    // Only try by ID if it looks like a valid UUID
    if (isValidUUID(id)) {
        const [userById] = await db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        return userById;
    }

    return null;
}

async function getUserProjects(userId: string) {
    // Get projects owned by user
    const ownedProjects = await db
        .select({
            id: projects.id,
            title: projects.title,
            description: projects.description,
            projectType: projects.projectType,
            status: projects.status,
            teamSizeCurrent: projects.teamSizeCurrent,
            teamSizeMax: projects.teamSizeMax,
        })
        .from(projects)
        .where(eq(projects.ownerId, userId))
        .orderBy(desc(projects.createdAt))
        .limit(6);

    // Get projects user is member of
    const memberProjects = await db
        .select({
            id: projects.id,
            title: projects.title,
            description: projects.description,
            projectType: projects.projectType,
            status: projects.status,
            teamSizeCurrent: projects.teamSizeCurrent,
            teamSizeMax: projects.teamSizeMax,
        })
        .from(projects)
        .innerJoin(projectMembers, eq(projectMembers.projectId, projects.id))
        .where(eq(projectMembers.userId, userId))
        .orderBy(desc(projects.createdAt))
        .limit(6);

    return { owned: ownedProjects, member: memberProjects };
}

export default async function PublicProfilePage({
    params,
}: {
    params: Promise<Params>;
}) {
    const { id } = await params;
    const user = await getUser(id);

    if (!user) {
        notFound();
    }

    const session = await auth();
    const isOwnProfile = session?.user?.id === user.id;
    const { owned, member } = await getUserProjects(user.id);

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
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            {/* Profile Header */}
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-6 sm:p-8 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-2 border-white/10 overflow-hidden bg-gradient-to-br from-sky-500/20 to-violet-500/20">
                            {user.image ? (
                                <Image src={user.image} alt={user.name || ""} fill className="object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <User className="h-12 w-12 text-slate-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-50">
                                    {user.firstName && user.lastName
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.name || "Anonymous"}
                                </h1>
                                {user.collabspaceId && (
                                    <p className="text-sky-400 text-sm mt-1">@{user.collabspaceId}</p>
                                )}
                            </div>

                            {isOwnProfile && (
                                <Link href="/app/profile/edit">
                                    <Button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10">
                                        Edit Profile
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-400">
                            {user.profession && (
                                <span className="flex items-center gap-1.5">
                                    <Briefcase className="h-4 w-4" />
                                    {user.profession}
                                </span>
                            )}
                            {user.location && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {user.location}
                                </span>
                            )}
                            {user.availabilityHours && (
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    {user.availabilityHours}h/week
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </span>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <p className="mt-4 text-slate-300/80 text-sm leading-relaxed">
                                {user.bio}
                            </p>
                        )}

                        {/* Links */}
                        <div className="flex gap-3 mt-4">
                            {user.githubUrl && (
                                <a
                                    href={user.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition"
                                >
                                    <Github className="h-4 w-4" />
                                </a>
                            )}
                            {user.linkedinUrl && (
                                <a
                                    href={user.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </a>
                            )}
                            {user.portfolioUrl && (
                                <a
                                    href={user.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition"
                                >
                                    <Globe className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
                    <h2 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-sky-400" />
                        Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill) => (
                            <span
                                key={skill}
                                className="rounded-lg bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 text-xs font-medium text-sky-300"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects Owned */}
            {owned.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                        <Rocket className="h-4 w-4 text-violet-400" />
                        Projects Created
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {owned.map((project) => (
                            <Link
                                key={project.id}
                                href={`/explore/${project.id}`}
                                className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className={`text-[10px] font-medium ${getTypeColor(project.projectType)}`}>
                                            {project.projectType}
                                        </span>
                                        <h3 className="font-medium text-slate-100 group-hover:text-white transition line-clamp-1">
                                            {project.title}
                                        </h3>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                                    {project.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                                    <Users className="h-3 w-3" />
                                    {project.teamSizeCurrent}/{project.teamSizeMax}
                                    <span className={`ml-auto px-1.5 py-0.5 rounded ${project.status === "open" ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-400"
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects Member Of */}
            {member.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-400" />
                        Contributing To
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {member.map((project) => (
                            <Link
                                key={project.id}
                                href={`/explore/${project.id}`}
                                className="group rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className={`text-[10px] font-medium ${getTypeColor(project.projectType)}`}>
                                            {project.projectType}
                                        </span>
                                        <h3 className="font-medium text-slate-100 group-hover:text-white transition line-clamp-1">
                                            {project.title}
                                        </h3>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                                </div>
                                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                                    {project.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {owned.length === 0 && member.length === 0 && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <Rocket className="mx-auto h-12 w-12 text-slate-600" />
                    <p className="mt-3 text-sm text-slate-400">
                        {isOwnProfile
                            ? "You haven't joined or created any projects yet."
                            : "This user hasn't joined or created any projects yet."}
                    </p>
                    {isOwnProfile && (
                        <Link
                            href="/app/projects/new"
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white"
                        >
                            <Rocket className="h-4 w-4" />
                            Create a Project
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
