import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { ExploreClient } from "./explore-client";

type SearchParams = {
  q?: string;
  type?: string;
  skill?: string;
};

async function getProjects(searchParams: SearchParams) {
  const { q, type, skill } = searchParams;

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

  // Filter in JS for initial load
  let filtered = allProjects;

  if (q) {
    const searchLower = q.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
    );
  }

  if (type && type !== "all") {
    filtered = filtered.filter((p) => p.projectType === type);
  }

  if (skill) {
    const skillLower = skill.toLowerCase();
    filtered = filtered.filter((p) =>
      p.skillsRequired?.some((s) => s.toLowerCase().includes(skillLower))
    );
  }

  return filtered;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const projectsList = await getProjects(params);

  return (
    <ExploreClient
      initialProjects={projectsList}
      initialFilters={{
        q: params.q || "",
        type: params.type || "all",
        skill: params.skill || "",
      }}
    />
  );
}