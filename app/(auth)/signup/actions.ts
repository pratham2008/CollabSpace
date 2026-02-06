"use server";

import { db } from "@/db";
import { users, otpTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateOTP, sendVerificationOTP } from "@/lib/email";
import { isValidCollabspaceId, slugifyCollabspaceId } from "@/lib/utils";

export type SignupResult = {
    success: boolean;
    error?: string;
    message?: string;
    email?: string;
};

export async function signupAction(formData: FormData): Promise<SignupResult> {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    let collabspaceId = formData.get("collabspaceId") as string;

    // Validation
    if (!email || !password || !confirmPassword || !firstName || !lastName || !collabspaceId) {
        return { success: false, error: "All fields are required" };
    }

    if (password !== confirmPassword) {
        return { success: false, error: "Passwords don't match" };
    }

    if (password.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" };
    }

    // Clean and validate CollabSpace ID
    collabspaceId = slugifyCollabspaceId(collabspaceId);
    if (!isValidCollabspaceId(collabspaceId)) {
        return { success: false, error: "Invalid CollabSpace ID. Use 3-30 characters: letters, numbers, dots, underscores, hyphens" };
    }

    try {
        // Check if email already exists
        const existingUser = await db
            .select({ id: users.id, emailVerified: users.emailVerified })
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if (existingUser.length > 0) {
            if (existingUser[0].emailVerified) {
                return { success: false, error: "An account with this email already exists. Please log in." };
            } else {
                // User exists but not verified - resend OTP
                const otp = generateOTP();
                const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                // Delete old OTPs for this email
                await db.delete(otpTokens).where(eq(otpTokens.email, email.toLowerCase()));

                // Create new OTP
                await db.insert(otpTokens).values({
                    email: email.toLowerCase(),
                    otp,
                    type: "email_verification",
                    expires,
                });

                await sendVerificationOTP(email, otp);

                return {
                    success: true,
                    message: "Verification code sent! Check your email.",
                    email: email.toLowerCase()
                };
            }
        }

        // Check if CollabSpace ID already taken
        const existingId = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.collabspaceId, collabspaceId))
            .limit(1);

        if (existingId.length > 0) {
            return { success: false, error: "This CollabSpace ID is already taken" };
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        await db.insert(users).values({
            email: email.toLowerCase(),
            passwordHash,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            collabspaceId,
            profileCompletion: 20, // Starting with basic info
            isNewUser: true,
        });

        // Generate OTP
        const otp = generateOTP();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await db.insert(otpTokens).values({
            email: email.toLowerCase(),
            otp,
            type: "email_verification",
            expires,
        });

        // Send OTP email
        await sendVerificationOTP(email, otp);

        return {
            success: true,
            message: "Account created! Check your email for the verification code.",
            email: email.toLowerCase()
        };
    } catch (error) {
        console.error("Signup error:", error);
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

export async function verifyOTPAction(email: string, otp: string): Promise<SignupResult> {
    if (!email || !otp) {
        return { success: false, error: "Email and OTP are required" };
    }

    try {
        // Find valid OTP
        const [validOtp] = await db
            .select()
            .from(otpTokens)
            .where(
                and(
                    eq(otpTokens.email, email.toLowerCase()),
                    eq(otpTokens.otp, otp),
                    eq(otpTokens.type, "email_verification"),
                    eq(otpTokens.used, false),
                    gt(otpTokens.expires, new Date())
                )
            )
            .limit(1);

        if (!validOtp) {
            return { success: false, error: "Invalid or expired verification code" };
        }

        // Mark OTP as used
        await db.update(otpTokens)
            .set({ used: true })
            .where(eq(otpTokens.id, validOtp.id));

        // Verify user email
        await db.update(users)
            .set({ emailVerified: new Date() })
            .where(eq(users.email, email.toLowerCase()));

        // Delete all OTPs for this email
        await db.delete(otpTokens).where(eq(otpTokens.email, email.toLowerCase()));

        return { success: true, message: "Email verified! You can now log in." };
    } catch (error) {
        console.error("OTP verification error:", error);
        return { success: false, error: "Verification failed. Please try again." };
    }
}

export async function resendOTPAction(email: string): Promise<SignupResult> {
    if (!email) {
        return { success: false, error: "Email is required" };
    }

    try {
        // Check if user exists
        const [user] = await db
            .select({ id: users.id, emailVerified: users.emailVerified })
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if (!user) {
            return { success: false, error: "No account found with this email" };
        }

        if (user.emailVerified) {
            return { success: false, error: "Email already verified. Please log in." };
        }

        // Delete old OTPs
        await db.delete(otpTokens).where(eq(otpTokens.email, email.toLowerCase()));

        // Generate new OTP
        const otp = generateOTP();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.insert(otpTokens).values({
            email: email.toLowerCase(),
            otp,
            type: "email_verification",
            expires,
        });

        await sendVerificationOTP(email, otp);

        return { success: true, message: "New verification code sent!" };
    } catch (error) {
        console.error("Resend OTP error:", error);
        return { success: false, error: "Failed to resend code. Please try again." };
    }
}

export async function checkCollabspaceIdAvailability(id: string): Promise<boolean> {
    const cleaned = slugifyCollabspaceId(id);

    if (!isValidCollabspaceId(cleaned)) {
        return false;
    }

    const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.collabspaceId, cleaned))
        .limit(1);

    return existing.length === 0;
}
