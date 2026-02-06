"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { projects, projectMembers, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type CreateProjectResult = {
    success: boolean;
    error?: string;
    projectId?: string;
};

export async function createProjectAction(formData: FormData): Promise<CreateProjectResult> {
    const session = await auth();

    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    // Check if user's profile is complete enough
    const [user] = await db
        .select({ profileComplete: users.profileComplete, profileCompletion: users.profileCompletion })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    if (!user || (user.profileCompletion || 0) < 80) {
        return {
            success: false,
            error: "Complete your profile to at least 80% before creating a project"
        };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const projectType = formData.get("projectType") as string;
    const skillsRequired = formData.get("skillsRequired") as string;
    const rolesNeeded = formData.get("rolesNeeded") as string;
    const teamSizeMax = parseInt(formData.get("teamSizeMax") as string) || 5;
    const commitmentLevel = formData.get("commitmentLevel") as string;
    const deadlineStr = formData.get("deadline") as string;
    const githubUrl = formData.get("githubUrl") as string;
    const figmaUrl = formData.get("figmaUrl") as string;

    // Validation
    if (!title || !description || !projectType) {
        return { success: false, error: "Title, description, and project type are required" };
    }

    if (title.length < 5) {
        return { success: false, error: "Title must be at least 5 characters" };
    }

    if (description.length < 20) {
        return { success: false, error: "Description must be at least 20 characters" };
    }

    const skills = skillsRequired
        ? skillsRequired.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const roles = rolesNeeded
        ? rolesNeeded.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    const deadline = deadlineStr ? new Date(deadlineStr) : null;

    try {
        const [newProject] = await db
            .insert(projects)
            .values({
                ownerId: session.user.id,
                title,
                description,
                projectType,
                skillsRequired: skills,
                rolesNeeded: roles,
                teamSizeMax,
                teamSizeCurrent: 1, // Owner counts as 1
                commitmentLevel: commitmentLevel || "flexible",
                deadline,
                githubUrl: githubUrl || null,
                figmaUrl: figmaUrl || null,
                status: "open",
            })
            .returning({ id: projects.id });

        // Add owner as first project member
        await db.insert(projectMembers).values({
            projectId: newProject.id,
            userId: session.user.id,
            role: "Owner",
        });

        revalidatePath("/app");
        revalidatePath("/explore");

        return { success: true, projectId: newProject.id };
    } catch (error) {
        console.error("Create project error:", error);
        return { success: false, error: "Failed to create project" };
    }
}
