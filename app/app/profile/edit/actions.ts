"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { slugifyCollabspaceId, isValidCollabspaceId } from "@/lib/utils";
import bcrypt from "bcryptjs";

export type ProfileUpdateResult = {
    success: boolean;
    error?: string;
};

// Calculate profile completion based on required fields only
function calculateRequiredFieldsCompletion(data: {
    firstName?: string;
    lastName?: string;
    collabspaceId?: string;
    bio?: string;
    profession?: string;
    location?: string;
}): number {
    let completed = 0;
    const total = 6;

    if (data.firstName) completed++;
    if (data.lastName) completed++;
    if (data.collabspaceId && data.collabspaceId.length >= 3) completed++;
    if (data.bio && data.bio.length >= 10) completed++;
    if (data.profession) completed++;
    if (data.location) completed++;

    return Math.round((completed / total) * 100);
}

export async function updateProfileAction(formData: FormData): Promise<ProfileUpdateResult> {
    const session = await auth();

    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const bio = formData.get("bio") as string;
    const profession = formData.get("profession") as string;
    const location = formData.get("location") as string;
    const skillsRaw = formData.get("skills") as string;
    const availabilityHours = parseInt(formData.get("availabilityHours") as string) || 0;
    const githubUrl = formData.get("githubUrl") as string;
    const linkedinUrl = formData.get("linkedinUrl") as string;
    const portfolioUrl = formData.get("portfolioUrl") as string;

    // Handle optional collabspace ID update
    let collabspaceId = formData.get("collabspaceId") as string;

    if (collabspaceId) {
        collabspaceId = slugifyCollabspaceId(collabspaceId);

        if (!isValidCollabspaceId(collabspaceId)) {
            return { success: false, error: "Invalid CollabSpace ID format" };
        }

        // Check if ID is taken by someone else
        const existing = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.collabspaceId, collabspaceId))
            .limit(1);

        if (existing.length > 0 && existing[0].id !== session.user.id) {
            return { success: false, error: "This CollabSpace ID is already taken" };
        }
    }

    // Parse skills from comma-separated string
    const skills = skillsRaw
        ? skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)
        : [];

    // Calculate profile completion based on required fields only
    const completion = calculateRequiredFieldsCompletion({
        firstName,
        lastName,
        collabspaceId,
        bio,
        profession,
        location,
    });
    const isComplete = completion >= 80;

    try {
        await db
            .update(users)
            .set({
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
                bio: bio || undefined,
                profession: profession || undefined,
                location: location || undefined,
                skills: skills.length > 0 ? skills : [],
                availabilityHours: availabilityHours || undefined,
                githubUrl: githubUrl || undefined,
                linkedinUrl: linkedinUrl || undefined,
                portfolioUrl: portfolioUrl || undefined,
                collabspaceId: collabspaceId || undefined,
                profileCompletion: completion,
                profileComplete: isComplete,
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        revalidatePath("/app");
        revalidatePath("/app/profile");
        revalidatePath("/app/profile/edit");

        return { success: true };
    } catch (error) {
        console.error("Profile update error:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

// Check if CollabSpace ID is available (excluding current user)
export async function checkCollabspaceIdAvailable(id: string, currentUserId: string): Promise<boolean> {
    if (!id || id.length < 3) return false;

    const cleaned = slugifyCollabspaceId(id);
    if (!isValidCollabspaceId(cleaned)) return false;

    const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(
            and(
                eq(users.collabspaceId, cleaned),
                ne(users.id, currentUserId)
            )
        )
        .limit(1);

    return existing.length === 0;
}

// Set or change password
export async function setPasswordAction(
    newPassword: string,
    currentPassword?: string
): Promise<ProfileUpdateResult> {
    const session = await auth();

    if (!session?.user) {
        return { success: false, error: "Not authenticated" };
    }

    if (!newPassword || newPassword.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" };
    }

    try {
        // Get current user to check if they have a password
        const [user] = await db
            .select({ passwordHash: users.passwordHash })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // If user already has a password, verify current password
        if (user.passwordHash) {
            if (!currentPassword) {
                return { success: false, error: "Current password is required" };
            }

            const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isValid) {
                return { success: false, error: "Current password is incorrect" };
            }
        }

        // Hash and set new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await db
            .update(users)
            .set({
                passwordHash: hashedPassword,
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id));

        return { success: true };
    } catch (error) {
        console.error("Password update error:", error);
        return { success: false, error: "Failed to update password" };
    }
}
