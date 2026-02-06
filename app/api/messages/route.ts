import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { messages, users, projectMembers, projects } from "@/db/schema";
import { eq, and, desc, or } from "drizzle-orm";
import { pusherServer, getProjectChannelName, CHAT_EVENTS } from "@/lib/pusher";

// GET messages for a project
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const projectId = searchParams.get("projectId");
        const limit = parseInt(searchParams.get("limit") || "50");
        const before = searchParams.get("before"); // For pagination

        if (!projectId) {
            return NextResponse.json({ error: "Project ID required" }, { status: 400 });
        }

        // Verify user is owner or member of the project
        const [project] = await db
            .select({ ownerId: projects.ownerId })
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isOwner = project.ownerId === session.user.id;

        if (!isOwner) {
            const [membership] = await db
                .select()
                .from(projectMembers)
                .where(
                    and(
                        eq(projectMembers.projectId, projectId),
                        eq(projectMembers.userId, session.user.id)
                    )
                )
                .limit(1);

            if (!membership) {
                return NextResponse.json({ error: "Not a member" }, { status: 403 });
            }
        }

        // Fetch messages with sender info
        const projectMessages = await db
            .select({
                id: messages.id,
                content: messages.content,
                createdAt: messages.createdAt,
                senderId: messages.senderId,
                senderName: users.name,
                senderCollabspaceId: users.collabspaceId,
                senderImage: users.image,
            })
            .from(messages)
            .innerJoin(users, eq(messages.senderId, users.id))
            .where(eq(messages.projectId, projectId))
            .orderBy(desc(messages.createdAt))
            .limit(limit);

        // Reverse to show oldest first
        return NextResponse.json({ messages: projectMessages.reverse() });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

// POST a new message
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId, content } = await request.json();

        if (!projectId || !content?.trim()) {
            return NextResponse.json({ error: "Project ID and content required" }, { status: 400 });
        }

        // Verify user is owner or member
        const [project] = await db
            .select({ ownerId: projects.ownerId })
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const isOwner = project.ownerId === session.user.id;

        if (!isOwner) {
            const [membership] = await db
                .select()
                .from(projectMembers)
                .where(
                    and(
                        eq(projectMembers.projectId, projectId),
                        eq(projectMembers.userId, session.user.id)
                    )
                )
                .limit(1);

            if (!membership) {
                return NextResponse.json({ error: "Not a member" }, { status: 403 });
            }
        }

        // Get sender info
        const [sender] = await db
            .select({
                name: users.name,
                collabspaceId: users.collabspaceId,
                image: users.image,
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        // Insert message
        const [newMessage] = await db
            .insert(messages)
            .values({
                projectId,
                senderId: session.user.id,
                content: content.trim(),
            })
            .returning();

        // Prepare message for broadcast
        const messageWithSender = {
            id: newMessage.id,
            content: newMessage.content,
            createdAt: newMessage.createdAt,
            senderId: newMessage.senderId,
            senderName: sender?.name,
            senderCollabspaceId: sender?.collabspaceId,
            senderImage: sender?.image,
        };

        // Broadcast to project channel via Pusher
        await pusherServer.trigger(
            getProjectChannelName(projectId),
            CHAT_EVENTS.NEW_MESSAGE,
            messageWithSender
        );

        return NextResponse.json({ message: messageWithSender });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
