import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: "Token is required" },
                { status: 400 }
            );
        }

        // Find the verification token
        const [verificationToken] = await db
            .select()
            .from(verificationTokens)
            .where(eq(verificationTokens.token, token))
            .limit(1);

        if (!verificationToken) {
            return NextResponse.json(
                { error: "Invalid or expired verification link" },
                { status: 400 }
            );
        }

        // Check if token is expired
        if (new Date() > verificationToken.expires) {
            // Delete expired token
            await db
                .delete(verificationTokens)
                .where(eq(verificationTokens.token, token));

            return NextResponse.json(
                { error: "Verification link has expired. Please sign up again." },
                { status: 400 }
            );
        }

        // Update user's email verification status
        await db
            .update(users)
            .set({ emailVerified: new Date() })
            .where(eq(users.email, verificationToken.identifier));

        // Delete the used token
        await db
            .delete(verificationTokens)
            .where(
                and(
                    eq(verificationTokens.identifier, verificationToken.identifier),
                    eq(verificationTokens.token, token)
                )
            );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Email verification error:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
