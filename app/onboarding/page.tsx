import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function OnboardingPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Check user's status
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

    // New OAuth users need to set up password and complete profile
    if (user.isNewUser || !user.passwordHash) {
        redirect("/app/profile/edit?setup=true");
    }

    // User is set up, go to dashboard
    redirect("/app");
}
