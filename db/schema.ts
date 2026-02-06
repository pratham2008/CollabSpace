import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// USERS
// ============================================================================
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    name: text("name"),
    image: text("image"),
    passwordHash: text("password_hash"),
    collabspaceId: text("collabspace_id").unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    bio: text("bio"),

    // Professional info
    profession: text("profession"), // student, working, freelancer, other
    educationLevel: text("education_level"),
    college: text("college"),
    course: text("course"),
    year: text("year"),
    experienceYears: integer("experience_years").default(0),

    // Location & availability
    location: text("location"),
    timezone: text("timezone"),
    availabilityHours: integer("availability_hours"), // hours per week

    // Skills (removed lookingFor - will be asked during project creation)
    skills: text("skills").array().default([]),

    // Links
    githubUrl: text("github_url"),
    linkedinUrl: text("linkedin_url"),
    portfolioUrl: text("portfolio_url"),

    // Status
    isNewUser: boolean("is_new_user").default(true), // for OAuth redirect logic
    profileComplete: boolean("profile_complete").default(false),
    profileCompletion: integer("profile_completion").default(0),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// ACCOUNTS (for OAuth - NextAuth)
// ============================================================================
export const accounts = pgTable("accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
});

// ============================================================================
// SESSIONS (NextAuth)
// ============================================================================
export const sessions = pgTable("sessions", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

// ============================================================================
// VERIFICATION TOKENS (for email verification - legacy link-based)
// ============================================================================
export const verificationTokens = pgTable("verification_tokens", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: timestamp("expires").notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
}));

// ============================================================================
// OTP TOKENS (for email OTP verification)
// ============================================================================
export const otpTokens = pgTable("otp_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    otp: text("otp").notNull(),
    type: text("type").notNull(), // "email_verification", "password_reset", "password_change"
    expires: timestamp("expires").notNull(),
    used: boolean("used").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});


// ============================================================================
// PROJECTS
// ============================================================================
export const projects = pgTable("projects", {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),

    title: text("title").notNull(),
    description: text("description").notNull(),
    projectType: text("project_type").notNull(), // hackathon, personal, startup, open-source, research, other

    skillsRequired: text("skills_required").array().default([]),
    rolesNeeded: text("roles_needed").array().default([]),

    teamSizeMax: integer("team_size_max").default(5),
    teamSizeCurrent: integer("team_size_current").default(1),

    deadline: timestamp("deadline"),
    commitmentLevel: text("commitment_level"), // part-time, full-time, flexible

    status: text("status").default("open"), // open, in-progress, completed, closed

    githubUrl: text("github_url"),
    figmaUrl: text("figma_url"),
    liveUrl: text("live_url"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// PROJECT MEMBERS
// ============================================================================
export const projectMembers = pgTable("project_members", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role"), // what they do in the project
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// ============================================================================
// JOIN REQUESTS
// ============================================================================
export const joinRequests = pgTable("join_requests", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    message: text("message"),
    status: text("status").default("pending"), // pending, accepted, rejected
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
});

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // join_request, request_accepted, request_rejected, new_message, project_update
    title: text("title").notNull(),
    message: text("message"),
    metadata: jsonb("metadata"), // extra data like projectId, requestId, etc.
    read: boolean("read").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// MESSAGES (for chat)
// ============================================================================
export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================================================
// RELATIONS
// ============================================================================
export const usersRelations = relations(users, ({ many }) => ({
    projects: many(projects),
    projectMemberships: many(projectMembers),
    joinRequests: many(joinRequests),
    notifications: many(notifications),
    messages: many(messages),
    accounts: many(accounts),
    sessions: many(sessions),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
    owner: one(users, {
        fields: [projects.ownerId],
        references: [users.id],
    }),
    members: many(projectMembers),
    joinRequests: many(joinRequests),
    messages: many(messages),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
    project: one(projects, {
        fields: [projectMembers.projectId],
        references: [projects.id],
    }),
    user: one(users, {
        fields: [projectMembers.userId],
        references: [users.id],
    }),
}));

export const joinRequestsRelations = relations(joinRequests, ({ one }) => ({
    project: one(projects, {
        fields: [joinRequests.projectId],
        references: [projects.id],
    }),
    user: one(users, {
        fields: [joinRequests.userId],
        references: [users.id],
    }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    project: one(projects, {
        fields: [messages.projectId],
        references: [projects.id],
    }),
    sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
    }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));
