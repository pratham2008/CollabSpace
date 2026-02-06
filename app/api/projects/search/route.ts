import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { eq, desc, or, ilike } from "drizzle-orm";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || "";
    const type = searchParams.get("type") || "";

    try {
        // Fetch all open projects
        const allProjects = await db
            .select({
                id: projects.id,
                title: projects.title,
                description: projects.description,
                projectType: projects.projectType,
                skillsRequired: projects.skillsRequired,
                rolesNeeded: projects.rolesNeeded,
                teamSizeMax: projects.teamSizeMax,
                teamSizeCurrent: projects.teamSizeCurrent,
                deadline: projects.deadline,
                commitmentLevel: projects.commitmentLevel,
                status: projects.status,
                createdAt: projects.createdAt,
                ownerId: projects.ownerId,
                ownerName: users.name,
                ownerCollabspaceId: users.collabspaceId,
                ownerImage: users.image,
            })
            .from(projects)
            .innerJoin(users, eq(projects.ownerId, users.id))
            .where(eq(projects.status, "open"))
            .orderBy(desc(projects.createdAt))
            .limit(50);

        // Filter in memory for flexibility
        let filtered = allProjects;

        if (q) {
            const searchLower = q.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.title.toLowerCase().includes(searchLower) ||
                    p.description.toLowerCase().includes(searchLower) ||
                    p.skillsRequired?.some((s) => s.toLowerCase().includes(searchLower))
            );
        }

        if (type && type !== "all") {
            filtered = filtered.filter((p) => p.projectType === type);
        }

        return NextResponse.json({ projects: filtered });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ projects: [], error: "Search failed" }, { status: 500 });
    }
}
