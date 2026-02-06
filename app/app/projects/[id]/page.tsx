import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects, users, projectMembers, joinRequests } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { ProjectManageClient } from "./project-manage-client";

async function getProject(id: string, userId: string) {
    const [project] = await db
        .select({
            id: projects.id,
            title: projects.title,
            description: projects.description,
            projectType: projects.projectType,
            skillsRequired: projects.skillsRequired,
            rolesNeeded: projects.rolesNeeded,
            teamSizeMax: projects.teamSizeMax,
            teamSizeCurrent: projects.teamSizeCurrent,
            deadline: projects.deadline,
            commitmentLevel: projects.commitmentLevel,
            status: projects.status,
            githubUrl: projects.githubUrl,
            figmaUrl: projects.figmaUrl,
            liveUrl: projects.liveUrl,
            createdAt: projects.createdAt,
            ownerId: projects.ownerId,
        })
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

    return project;
}

async function getProjectMembers(projectId: string) {
    const members = await db
        .select({
            id: users.id,
            name: users.name,
            collabspaceId: users.collabspaceId,
            image: users.image,
            email: users.email,
            skills: users.skills,
            role: projectMembers.role,
            joinedAt: projectMembers.joinedAt,
        })
        .from(projectMembers)
        .innerJoin(users, eq(projectMembers.userId, users.id))
        .where(eq(projectMembers.projectId, projectId));

    return members;
}

async function getPendingRequests(projectId: string) {
    const requests = await db
        .select({
            id: joinRequests.id,
            userId: joinRequests.userId,
            message: joinRequests.message,
            status: joinRequests.status,
            createdAt: joinRequests.createdAt,
            userName: users.name,
            userCollabspaceId: users.collabspaceId,
            userImage: users.image,
            userSkills: users.skills,
            userBio: users.bio,
        })
        .from(joinRequests)
        .innerJoin(users, eq(joinRequests.userId, users.id))
        .where(
            and(
                eq(joinRequests.projectId, projectId),
                eq(joinRequests.status, "pending")
            )
        )
        .orderBy(desc(joinRequests.createdAt));

    return requests;
}

export default async function ProjectManagePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const project = await getProject(id, session.user.id);

    if (!project) {
        notFound();
    }

    // Check if user is owner or member
    const isOwner = project.ownerId === session.user.id;
    const members = await getProjectMembers(id);
    const isMember = members.some(m => m.id === session.user.id);

    if (!isOwner && !isMember) {
        // Redirect non-members to the explore page
        redirect(`/explore/${id}`);
    }

    const pendingRequests = isOwner ? await getPendingRequests(id) : [];

    return (
        <ProjectManageClient
            project={project}
            members={members}
            pendingRequests={pendingRequests}
            isOwner={isOwner}
            currentUserId={session.user.id}
        />
    );
}
