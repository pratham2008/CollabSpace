import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects, projectMembers, users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { ChatClient } from "./chat-client";

async function getUserProjects(userId: string) {
    // Get projects where user is owner or member
    const ownedProjects = await db
        .select({
            id: projects.id,
            title: projects.title,
            projectType: projects.projectType,
            createdAt: projects.createdAt,
        })
        .from(projects)
        .where(eq(projects.ownerId, userId));

    const memberProjects = await db
        .select({
            id: projects.id,
            title: projects.title,
            projectType: projects.projectType,
            createdAt: projects.createdAt,
        })
        .from(projectMembers)
        .innerJoin(projects, eq(projectMembers.projectId, projects.id))
        .where(eq(projectMembers.userId, userId));

    // Combine and deduplicate
    const allProjects = [...ownedProjects, ...memberProjects];
    const uniqueProjects = allProjects.filter(
        (project, index, self) =>
            index === self.findIndex((p) => p.id === project.id)
    );

    return uniqueProjects;
}

async function getCurrentUser(userId: string) {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            collabspaceId: users.collabspaceId,
            image: users.image,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return user;
}

export default async function ChatPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const [userProjects, currentUser] = await Promise.all([
        getUserProjects(session.user.id),
        getCurrentUser(session.user.id),
    ]);

    return (
        <ChatClient
            projects={userProjects}
            currentUser={currentUser}
        />
    );
}
