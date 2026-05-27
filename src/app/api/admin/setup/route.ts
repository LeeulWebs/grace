import { NextResponse } from "next/server";
import { execSync } from "child_process";
import crypto from "crypto";

/**
 * POST /api/admin/setup
 * Initializes the database (pushes schema + seeds admin user).
 * Should be called once after cloning the repo.
 */
export async function POST() {
  try {
    // 1. Push schema
    console.log("[setup] Pushing Prisma schema...");
    execSync("npx prisma db push --skip-generate 2>&1", {
      cwd: process.cwd(),
      stdio: "pipe",
      timeout: 60000,
    });
    console.log("[setup] Schema pushed.");

    // 2. Seed admin user using dynamic import to get a fresh Prisma client
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient({ log: [] });

    try {
      const count = await prisma.adminUser.count();
      if (count === 0) {
        const hash = crypto.createHash("sha256").update("user").digest("hex");
        await prisma.adminUser.create({
          data: {
            username: "user",
            password: hash,
            fullName: "Admin User",
            role: "admin",
            isActive: true,
          },
        });
        console.log("[setup] Admin user created.");
      }
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json({ success: true, message: "Database initialized." });
  } catch (error) {
    console.error("[setup] Error:", error);
    return NextResponse.json(
      { error: "Setup failed. Try running: bun run setup" },
      { status: 500 }
    );
  }
}
