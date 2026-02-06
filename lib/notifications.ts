import { db } from "@/db";
import { notifications } from "@/db/schema";

type NotificationType =
    | "join_request"
    | "request_accepted"
    | "request_rejected"
    | "new_message"
    | "project_update";

type NotificationData = {
    userId: string;
    type: NotificationType;
    title: string;
    message?: string;
    metadata?: Record<string, string>;
};

/**
 * Create a notification for a user
 */
export async function createNotification(data: NotificationData) {
    try {
        await db.insert(notifications).values({
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            metadata: data.metadata,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to create notification:", error);
        return { success: false, error };
    }
}

/**
 * Notify project owner of a new join request
 */
export async function notifyJoinRequest(
    ownerId: string,
    projectId: string,
    projectTitle: string,
    requesterName: string,
    requestId: string
) {
    return createNotification({
        userId: ownerId,
        type: "join_request",
        title: `${requesterName} wants to join "${projectTitle}"`,
        message: "Review their profile and respond to this request.",
        metadata: { projectId, requestId },
    });
}

/**
 * Notify user that their join request was accepted
 */
export async function notifyRequestAccepted(
    userId: string,
    projectId: string,
    projectTitle: string
) {
    return createNotification({
        userId,
        type: "request_accepted",
        title: `You're in! Joined "${projectTitle}"`,
        message: "You've been accepted to the team. Start collaborating!",
        metadata: { projectId },
    });
}

/**
 * Notify user that their join request was rejected
 */
export async function notifyRequestRejected(
    userId: string,
    projectId: string,
    projectTitle: string
) {
    return createNotification({
        userId,
        type: "request_rejected",
        title: `Request declined for "${projectTitle}"`,
        message: "Your join request was not accepted. Keep exploring other projects!",
        metadata: { projectId },
    });
}

/**
 * Notify project members of a new message
 */
export async function notifyNewMessage(
    memberIds: string[],
    projectId: string,
    projectTitle: string,
    senderName: string
) {
    const notifications = memberIds.map(userId =>
        createNotification({
            userId,
            type: "new_message",
            title: `New message in "${projectTitle}"`,
            message: `${senderName} sent a message.`,
            metadata: { projectId },
        })
    );
    return Promise.all(notifications);
}

/**
 * Notify project members of an update
 */
export async function notifyProjectUpdate(
    memberIds: string[],
    projectId: string,
    projectTitle: string,
    updateMessage: string
) {
    const notifications = memberIds.map(userId =>
        createNotification({
            userId,
            type: "project_update",
            title: `Update in "${projectTitle}"`,
            message: updateMessage,
            metadata: { projectId },
        })
    );
    return Promise.all(notifications);
}
