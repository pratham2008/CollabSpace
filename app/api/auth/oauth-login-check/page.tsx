import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function OAuthLoginCheckPage() {
    const session = await auth();

    if (!session?.user) {
        // Not logged in, redirect to login
        redirect("/login");
    }

    // Check if user exists and is new (just created via OAuth)
    const [user] = await db
        .select({
            isNewUser: users.isNewUser,
            passwordHash: users.passwordHash,
            profileCompletion: users.profileCompletion,
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    if (!user) {
        redirect("/login");
    }

    // If this is a new user (just created via OAuth on supposed login)
    // We need to redirect appropriately
    if (user.isNewUser) {
        // New OAuth user - they need to set password and complete profile
        redirect("/app/profile/edit?setup=true");
    }

    // Existing user logging in - go to dashboard
    redirect("/app");
}
