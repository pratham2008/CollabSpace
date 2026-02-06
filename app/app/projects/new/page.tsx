import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CreateProjectForm } from "./create-project-form";

export default async function NewProjectPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    // Check profile completion
    const [user] = await db
        .select({ profileCompletion: users.profileCompletion })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    const canCreate = (user?.profileCompletion || 0) >= 80;

    return (
        <div className="mx-auto max-w-2xl py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-slate-50">Create a Project</h1>
                <p className="mt-1 text-sm text-slate-300/80">
                    Share your idea and find collaborators to build with.
                </p>
            </div>

            {!canCreate ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6 text-center">
                    <p className="text-amber-200">
                        Your profile is {user?.profileCompletion || 0}% complete.
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                        Complete your profile to at least 80% to create projects.
                    </p>
                    <a
                        href="/app/profile/edit"
                        className="mt-4 inline-block rounded-xl bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 px-6 py-2.5 text-sm font-semibold text-slate-950"
                    >
                        Complete Profile
                    </a>
                </div>
            ) : (
                <CreateProjectForm />
            )}
        </div>
    );
}
