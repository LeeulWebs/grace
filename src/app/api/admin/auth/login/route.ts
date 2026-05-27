import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/admin-auth";
import { execSync } from "child_process";
import crypto from "crypto";

let isInitializing = false;
let initPromise: Promise<void> | null = null;

async function ensureDbReady() {
  if (isInitializing && initPromise) {
    await initPromise;
    return;
  }
  if (!isInitializing) {
    isInitializing = true;
    initPromise = (async () => {
      try {
        // Try a simple query to see if tables exist
        await db.adminUser.count();
      } catch {
        console.log("[auth] Database tables missing. Initializing...");
        try {
          execSync("npx prisma db push --skip-generate 2>&1", {
            cwd: process.cwd(),
            stdio: "pipe",
            timeout: 60000,
          });
          console.log("[auth] Schema pushed.");
        } catch (e) {
          console.error("[auth] Schema push failed:", e);
        }
      }
      // Check if admin user exists
      try {
        const count = await db.adminUser.count();
        if (count === 0) {
          const hash = crypto.createHash("sha256").update("user").digest("hex");
          await db.adminUser.create({
            data: { username: "user", password: hash, fullName: "Admin User", role: "admin" },
          });
          console.log("[auth] Default admin user created.");
        }
      } catch (e) {
        console.error("[auth] Seed failed:", e);
      }
      isInitializing = false;
    })();
    await initPromise;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure database is ready before anything
    await ensureDbReady();

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await db.adminUser.findUnique({
      where: { username: username.trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.password !== hashedPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.session.create({
      data: { token, userId: user.id, expiresAt },
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
