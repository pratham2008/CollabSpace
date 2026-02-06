import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ exists: false });
        }

        const [user] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        return NextResponse.json({ exists: !!user });
    } catch (error) {
        console.error("Check user error:", error);
        return NextResponse.json({ exists: false, error: "Failed to check user" }, { status: 500 });
    }
}
