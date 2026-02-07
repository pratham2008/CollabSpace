import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./settings-client";

async function getUser(userId: string) {
    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            emailVerified: users.emailVerified,
            collabspaceId: users.collabspaceId,
            image: users.image,
            passwordHash: users.passwordHash,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    // Convert passwordHash to hasPassword boolean for the client
    return user ? {
        ...user,
        hasPassword: !!user.passwordHash,
        passwordHash: undefined, // Don't send to client
    } : null;
}

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const user = await getUser(session.user.id);

    if (!user) {
        redirect("/login");
    }

    return <SettingsClient user={user} />;
}
