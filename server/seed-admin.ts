import { db } from "./db";
import { users, canvasNodes } from "../shared/schema";
import { logger } from "./logger";
import { sql } from "drizzle-orm";

async function seed() {
    try {
        logger.info("Ensuring users table exists...", "seed");

        await db.execute(sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );
        `);

        logger.info("Seeding admin user...", "seed");

        const adminEmail = "admin@lifeos.com";
        const adminPassword = "admin321";

        const [adminUser] = await db.insert(users).values({
            username: adminEmail,
            password: adminPassword,
        }).onConflictDoUpdate({
            target: users.username,
            set: { password: adminPassword }
        }).returning();

        logger.info("Admin user seeded successfully", "seed");

        // Ensure default LifeOS block exists for admin
        const adminId = adminUser.id;
        const defaultBlockId = `node-lifeos-${adminId}`;

        await db.insert(canvasNodes).values({
            id: defaultBlockId,
            userId: adminId,
            type: "service",
            label: "LifeOS",
            x: 0,
            y: 0,
            data: {
                subBlocks: [],
            },
        }).onConflictDoNothing();

        logger.info("Admin LifeOS block seeded/verified", "seed");

        process.exit(0);
    } catch (error) {
        logger.error("Failed to seed admin user", "seed", error);
        process.exit(1);
    }
}

seed();
