"use server";

import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects, projectMembers, joinRequests, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { createNotification } from "@/lib/notifications";

// Approve a join request
export async function approveRequestAction(requestId: string, projectId: string) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify user is project owner
        const [project] = await db
            .select({ ownerId: projects.ownerId, title: projects.title })
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        if (!project || project.ownerId !== session.user.id) {
            return { success: false, error: "Not authorized" };
        }

        // Get request details
        const [request] = await db
            .select({
                userId: joinRequests.userId,
                status: joinRequests.status,
            })
            .from(joinRequests)
            .where(eq(joinRequests.id, requestId))
            .limit(1);

        if (!request || request.status !== "pending") {
            return { success: false, error: "Request not found or already processed" };
        }

        // Update request status
        await db
            .update(joinRequests)
            .set({ status: "accepted", resolvedAt: new Date() })
            .where(eq(joinRequests.id, requestId));

        // Add user as project member
        await db.insert(projectMembers).values({
            projectId,
            userId: request.userId,
            role: "member",
        });

        // Update team size
        await db
            .update(projects)
            .set({ teamSizeCurrent: sql`${projects.teamSizeCurrent} + 1` })
            .where(eq(projects.id, projectId));

        // Send notification to user
        await createNotification({
            userId: request.userId,
            type: "request_accepted",
            title: "Request Accepted! 🎉",
            message: `Your request to join "${project.title}" has been approved!`,
            metadata: { projectId },
        });

        return { success: true };
    } catch (error) {
        console.error("Error approving request:", error);
        return { success: false, error: "Failed to approve request" };
    }
}

// Reject a join request
export async function rejectRequestAction(requestId: string) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        // Get request and project details
        const [request] = await db
            .select({
                userId: joinRequests.userId,
                projectId: joinRequests.projectId,
                status: joinRequests.status,
            })
            .from(joinRequests)
            .where(eq(joinRequests.id, requestId))
            .limit(1);

        if (!request || request.status !== "pending") {
            return { success: false, error: "Request not found or already processed" };
        }

        // Verify user is project owner
        const [project] = await db
            .select({ ownerId: projects.ownerId, title: projects.title })
            .from(projects)
            .where(eq(projects.id, request.projectId))
            .limit(1);

        if (!project || project.ownerId !== session.user.id) {
            return { success: false, error: "Not authorized" };
        }

        // Update request status
        await db
            .update(joinRequests)
            .set({ status: "rejected", resolvedAt: new Date() })
            .where(eq(joinRequests.id, requestId));

        // Send notification to user
        await createNotification({
            userId: request.userId,
            type: "request_rejected",
            title: "Request Declined",
            message: `Your request to join "${project.title}" was not accepted.`,
            metadata: { projectId: request.projectId },
        });

        return { success: true };
    } catch (error) {
        console.error("Error rejecting request:", error);
        return { success: false, error: "Failed to reject request" };
    }
}

// Remove a member from project
export async function removeMemberAction(memberId: string, projectId: string) {
    try {
        const session = await auth();
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify user is project owner
        const [project] = await db
            .select({ ownerId: projects.ownerId, title: projects.title })
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        if (!project || project.ownerId !== session.user.id) {
            return { success: false, error: "Not authorized" };
        }

        // Can't remove yourself or the owner
        if (memberId === session.user.id || memberId === project.ownerId) {
            return { success: false, error: "Cannot remove owner" };
        }

        // Remove from project members
        await db
            .delete(projectMembers)
            .where(
                and(
                    eq(projectMembers.projectId, projectId),
                    eq(projectMembers.userId, memberId)
                )
            );

        // Update team size
        await db
            .update(projects)
            .set({ teamSizeCurrent: sql`GREATEST(${projects.teamSizeCurrent} - 1, 1)` })
            .where(eq(projects.id, projectId));

        // Send notification to removed user
        await createNotification({
            userId: memberId,
            type: "project_update",
            title: "Removed from Project",
            message: `You have been removed from "${project.title}".`,
            metadata: { projectId },
        });

        return { success: true };
    } catch (error) {
        console.error("Error removing member:", error);
        return { success: false, error: "Failed to remove member" };
    }
}
