import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProfileEditForm } from "./profile-edit-form";

async function getUserData(userId: string) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return user;
}

export default async function ProfileEditPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const user = await getUserData(session.user.id);

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="mx-auto max-w-2xl py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-slate-50">Edit Profile</h1>
                <p className="mt-1 text-sm text-slate-300/80">
                    Complete your profile to unlock all features. You need at least 80% to create or join projects.
                </p>
            </div>

            <ProfileEditForm user={user} />
        </div>
    );
}
