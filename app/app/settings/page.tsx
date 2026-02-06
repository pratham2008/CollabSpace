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
            hasPassword: users.hasPassword,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return user;
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
