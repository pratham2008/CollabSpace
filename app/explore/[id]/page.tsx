import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects, users, projectMembers, joinRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ProjectDetailClient } from "./project-detail-client";

async function getProject(id: string) {
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
            ownerName: users.name,
            ownerCollabspaceId: users.collabspaceId,
            ownerImage: users.image,
            ownerBio: users.bio,
            ownerSkills: users.skills,
        })
        .from(projects)
        .innerJoin(users, eq(projects.ownerId, users.id))
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
            role: projectMembers.role,
        })
        .from(projectMembers)
        .innerJoin(users, eq(projectMembers.userId, users.id))
        .where(eq(projectMembers.projectId, projectId));

    return members;
}

async function getUserJoinStatus(projectId: string, userId: string | undefined) {
    if (!userId) return null;

    const [request] = await db
        .select({ status: joinRequests.status })
        .from(joinRequests)
        .where(
            and(
                eq(joinRequests.projectId, projectId),
                eq(joinRequests.userId, userId)
            )
        )
        .limit(1);

    return request?.status || null;
}

export default async function ProjectDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await auth();

    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    const members = await getProjectMembers(id);
    const joinStatus = await getUserJoinStatus(id, session?.user?.id);
    const isOwner = session?.user?.id === project.ownerId;
    const isMember = members.some((m) => m.id === session?.user?.id);

    return (
        <ProjectDetailClient
            project={project}
            members={members}
            joinStatus={joinStatus}
            isOwner={isOwner}
            isMember={isMember}
            isLoggedIn={!!session?.user}
        />
    );
}
