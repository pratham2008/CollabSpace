import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
    }),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        verifyRequest: "/verify-email",
        error: "/auth-error",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required");
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                if (!user) {
                    throw new Error("No account found with this email. Please sign up first.");
                }

                if (!user.passwordHash) {
                    throw new Error("This account uses Google Sign-In. Please use 'Continue with Google'.");
                }

                if (!user.emailVerified) {
                    throw new Error("Please verify your email first. Check your inbox for the OTP.");
                }

                const isValidPassword = await bcrypt.compare(password, user.passwordHash);

                if (!isValidPassword) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.name || user.email,
                    image: user.image,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session, account }) {
            if (user) {
                token.id = user.id;

                // Check if this is a new OAuth user
                if (account?.provider === "google") {
                    const [existingUser] = await db
                        .select({ isNewUser: users.isNewUser })
                        .from(users)
                        .where(eq(users.id, user.id as string))
                        .limit(1);

                    token.isNewUser = existingUser?.isNewUser ?? true;
                }
            }

            // Handle session update (for profile changes)
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.isNewUser = token.isNewUser as boolean | undefined;

                // Fetch latest user data
                const [userData] = await db
                    .select({
                        collabspaceId: users.collabspaceId,
                        profileComplete: users.profileComplete,
                        profileCompletion: users.profileCompletion,
                        image: users.image,
                        isNewUser: users.isNewUser,
                        passwordHash: users.passwordHash,
                    })
                    .from(users)
                    .where(eq(users.id, token.id as string))
                    .limit(1);

                if (userData) {
                    session.user.collabspaceId = userData.collabspaceId ?? undefined;
                    session.user.profileComplete = userData.profileComplete ?? false;
                    session.user.profileCompletion = userData.profileCompletion ?? 0;
                    session.user.image = userData.image ?? undefined;
                    session.user.isNewUser = userData.isNewUser ?? false;
                    session.user.hasPassword = !!userData.passwordHash;
                }
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            // For credentials, already handled above
            if (account?.provider === "credentials") {
                return true;
            }

            // For Google OAuth - check if this is signup or login intent
            if (account?.provider === "google" && user.email) {
                // Check if user already exists
                const [existingUser] = await db
                    .select({ id: users.id })
                    .from(users)
                    .where(eq(users.email, user.email))
                    .limit(1);

                // If no existing user, this is a new signup - allowed
                if (!existingUser) {
                    return true;
                }

                // If user exists, they're logging in - allowed
                return true;
            }

            return true;
        },
        async redirect({ url, baseUrl }) {
            // If the url is a relative path, it's safe
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // If it's the same origin, allow it
            if (new URL(url).origin === baseUrl) return url;
            // Default to baseUrl
            return baseUrl;
        },
    },
    events: {
        async createUser({ user }) {
            // When a new OAuth user is created, mark as new user
            console.log("New user created via OAuth:", user.email);
        },
    },
});

// Type augmentation for session
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
            collabspaceId?: string;
            profileComplete?: boolean;
            profileCompletion?: number;
            isNewUser?: boolean;
            hasPassword?: boolean;
        };
    }
}
