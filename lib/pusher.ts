import Pusher from "pusher";
import PusherClient from "pusher-js";

// Server-side Pusher instance
export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
});

// Client-side Pusher instance (singleton)
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
    if (!pusherClientInstance) {
        pusherClientInstance = new PusherClient(
            process.env.NEXT_PUBLIC_PUSHER_KEY!,
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            }
        );
    }
    return pusherClientInstance;
}

// Channel naming conventions
export const getProjectChannelName = (projectId: string) => `project-${projectId}`;
export const getDirectChannelName = (userId1: string, userId2: string) => {
    // Sort IDs to ensure consistent channel name regardless of who initiates
    const sorted = [userId1, userId2].sort();
    return `dm-${sorted[0]}-${sorted[1]}`;
};

// Event names
export const CHAT_EVENTS = {
    NEW_MESSAGE: "new-message",
    MESSAGE_DELETED: "message-deleted",
    TYPING: "typing",
    MEMBER_JOINED: "member-joined",
    MEMBER_LEFT: "member-left",
} as const;
