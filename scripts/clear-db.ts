import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("DATABASE_URL not found");
    process.exit(1);
}

const queryClient = neon(dbUrl);
const db = drizzle(queryClient);

async function clearDatabase() {
    console.log("🗑️  Clearing all data from database...\n");

    try {
        // Disable foreign key checks temporarily and truncate tables
        await db.execute(sql`TRUNCATE TABLE messages RESTART IDENTITY CASCADE`);
        console.log("✓ Cleared messages");

        await db.execute(sql`TRUNCATE TABLE notifications RESTART IDENTITY CASCADE`);
        console.log("✓ Cleared notifications");

        await db.execute(sql`TRUNCATE TABLE join_requests RESTART IDENTITY CASCADE`);
        console.log("✓ Cleared join_requests");

        await db.execute(sql`TRUNCATE TABLE project_members RESTART IDENTITY CASCADE`);
        console.log("✓ Cleared project_members");

        await db.execute(sql`TRUNCATE TABLE projects RESTART IDENTITY CASCADE`);
        console.log("✓ Cleared projects");

        await db.execute(sql`TRUNCATE TABLE verification_tokens RESTART IDENTITY CASCADE`);
        console.log("✓ Cleared verification_tokens");

        await db.execute(sql`TRUNCATE TABLE sessions RESTART IDENTITY CASCADE`);
        console.log("✓ Cleared sessions");

        await db.execute(sql`TRUNCATE TABLE accounts RESTART IDENTITY CASCADE`);
        console.log("✓ Cleared accounts");

        await db.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
        console.log("✓ Cleared users");

        console.log("\n✅ Database cleared successfully!");
    } catch (error) {
        console.error("Failed to clear database:", error);
        process.exit(1);
    }
}

clearDatabase();
