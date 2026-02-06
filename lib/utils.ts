import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a random verification token
export function generateToken() {
  return crypto.randomUUID();
}

// Calculate profile completion percentage
export function calculateProfileCompletion(user: {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  profession?: string | null;
  skills?: string[] | null;
  lookingFor?: string[] | null;
  avatarUrl?: string | null;
  location?: string | null;
  availabilityHours?: number | null;
}): number {
  let score = 0;
  const weights = {
    firstName: 10,
    lastName: 10,
    profession: 15,
    bio: 10,
    skills: 20,
    lookingFor: 15,
    avatarUrl: 5,
    location: 5,
    availabilityHours: 10,
  };

  if (user.firstName) score += weights.firstName;
  if (user.lastName) score += weights.lastName;
  if (user.profession) score += weights.profession;
  if (user.bio && user.bio.length > 10) score += weights.bio;
  if (user.skills && user.skills.length >= 3) score += weights.skills;
  if (user.lookingFor && user.lookingFor.length >= 1) score += weights.lookingFor;
  if (user.avatarUrl) score += weights.avatarUrl;
  if (user.location) score += weights.location;
  if (user.availabilityHours && user.availabilityHours > 0) score += weights.availabilityHours;

  return Math.min(100, score);
}

// Check if profile is considered "complete" (80%+ required for actions)
export function isProfileComplete(completionPercentage: number): boolean {
  return completionPercentage >= 80;
}

// Format relative time
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// Slugify CollabSpace ID
export function slugifyCollabspaceId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ".")
    .replace(/\.+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 30);
}

// Validate CollabSpace ID format
export function isValidCollabspaceId(id: string): boolean {
  return /^[a-z0-9][a-z0-9._]{2,29}$/.test(id) && !id.includes("..");
}
