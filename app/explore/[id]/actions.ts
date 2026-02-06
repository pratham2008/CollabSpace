"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { joinRequests, projects, users, notifications } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendJoinRequestNotification } from "@/lib/email";

export type JoinRequestResult = {
    success: boolean;
    error?: string;
    message?: string;
};

export async function sendJoinRequestAction(
    projectId: string,
    message: string
): Promise<JoinRequestResult> {
    const session = await auth();

    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    // Check if user profile is complete enough
    const [user] = await db
        .select({
            profileCompletion: users.profileCompletion,
            firstName: users.firstName,
            lastName: users.lastName,
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    if (!user || (user.profileCompletion || 0) < 80) {
        return {
            success: false,
            error: "Complete your profile to at least 80% before joining projects"
        };
    }

    // Get project and owner
    const [project] = await db
        .select({
            id: projects.id,
            title: projects.title,
            ownerId: projects.ownerId,
            status: projects.status,
        })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

    if (!project) {
        return { success: false, error: "Project not found" };
    }

    if (project.status !== "open") {
        return { success: false, error: "This project is no longer accepting members" };
    }

    if (project.ownerId === session.user.id) {
        return { success: false, error: "You can't join your own project" };
    }

    // Check if already requested
    const existingRequest = await db
        .select({ id: joinRequests.id, status: joinRequests.status })
        .from(joinRequests)
        .where(
            and(
                eq(joinRequests.projectId, projectId),
                eq(joinRequests.userId, session.user.id)
            )
        )
        .limit(1);

    if (existingRequest.length > 0) {
        if (existingRequest[0].status === "pending") {
            return { success: false, error: "You've already requested to join this project" };
        }
        if (existingRequest[0].status === "accepted") {
            return { success: false, error: "You're already a member of this project" };
        }
    }

    try {
        // Create join request
        await db.insert(joinRequests).values({
            projectId,
            userId: session.user.id,
            message: message || null,
            status: "pending",
        });

        // Get owner email for notification
        const [owner] = await db
            .select({ email: users.email })
            .from(users)
            .where(eq(users.id, project.ownerId))
            .limit(1);

        // Create in-app notification for owner
        await db.insert(notifications).values({
            userId: project.ownerId,
            type: "join_request",
            title: "New join request",
            message: `${user.firstName} ${user.lastName} wants to join "${project.title}"`,
            metadata: { projectId, requesterId: session.user.id },
        });

        // Send email notification
        if (owner?.email) {
            await sendJoinRequestNotification(
                owner.email,
                project.title,
                `${user.firstName} ${user.lastName}`
            );
        }

        revalidatePath(`/explore/${projectId}`);

        return {
            success: true,
            message: "Join request sent! The project owner will review your request."
        };
    } catch (error) {
        console.error("Join request error:", error);
        return { success: false, error: "Failed to send join request" };
    }
}
