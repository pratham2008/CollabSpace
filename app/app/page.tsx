import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, projects, projectMembers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { DashboardClient } from "./dashboard-client";

async function getUserData(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user;
}

async function getUserProjects(userId: string) {
  // Get projects user owns
  const ownedProjects = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      status: projects.status,
      projectType: projects.projectType,
      teamSizeCurrent: projects.teamSizeCurrent,
      teamSizeMax: projects.teamSizeMax,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(eq(projects.ownerId, userId))
    .orderBy(desc(projects.createdAt))
    .limit(10);

  // Get projects user is a member of
  const memberProjectsRaw = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      status: projects.status,
      projectType: projects.projectType,
      teamSizeCurrent: projects.teamSizeCurrent,
      teamSizeMax: projects.teamSizeMax,
      createdAt: projects.createdAt,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .innerJoin(projects, eq(projectMembers.projectId, projects.id))
    .where(eq(projectMembers.userId, userId))
    .orderBy(desc(projectMembers.joinedAt))
    .limit(10);

  // Combine with roles
  const owned = ownedProjects.map((p) => ({ ...p, role: "Owner" as const }));
  const member = memberProjectsRaw.map((p) => ({ ...p, role: p.role || "Member" }));

  // Combine and dedupe
  const allProjects = [...owned, ...member];
  const uniqueProjects = allProjects.filter(
    (project, index, self) =>
      index === self.findIndex((p) => p.id === project.id)
  );

  return uniqueProjects;
}

async function getRecommendedProjects(userId: string) {
  const openProjects = await db
    .select({
      id: projects.id,
      title: projects.title,
      description: projects.description,
      skillsRequired: projects.skillsRequired,
      teamSizeMax: projects.teamSizeMax,
      teamSizeCurrent: projects.teamSizeCurrent,
      deadline: projects.deadline,
      projectType: projects.projectType,
      ownerId: projects.ownerId,
      ownerName: users.name,
      ownerCollabspaceId: users.collabspaceId,
      ownerImage: users.image,
    })
    .from(projects)
    .innerJoin(users, eq(projects.ownerId, users.id))
    .where(eq(projects.status, "open"))
    .orderBy(desc(projects.createdAt))
    .limit(6);

  return openProjects.filter((p) => p.ownerId !== userId);
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await getUserData(session.user.id);

  if (!user) {
    redirect("/login");
  }

  const userProjects = await getUserProjects(user.id);
  const recommendedProjects = await getRecommendedProjects(user.id);

  return (
    <DashboardClient
      user={{
        id: user.id,
        name: user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.name || "New User",
        collabspaceId: user.collabspaceId || null,
        profession: user.profession || null,
        location: user.location || null,
        bio: user.bio || null,
        skills: user.skills || [],
        profileCompletion: user.profileCompletion || 0,
        profileComplete: user.profileComplete || false,
        image: user.image || null,
      }}
      projects={userProjects}
      recommended={recommendedProjects}
    />
  );
}
