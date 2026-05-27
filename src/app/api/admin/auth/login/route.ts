import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
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

    // Any database error (missing tables, no DB file, etc.) → tell caller to run setup
    const msg = (error as Error).message || "";
    const stack = (error as Error).stack || "";
    const combined = msg + " " + stack;

    const isDbError =
      combined.includes("no such table") ||
      combined.includes("sqlite3") ||
      combined.includes("SQLITE_CANTOPEN") ||
      combined.includes("SQLITE_ERROR") ||
      combined.includes("Failed to open database") ||
      combined.includes("database is locked") ||
      combined.includes("Prisma") ||
      combined.includes("prisma") ||
      combined.includes("Cannot find module") ||
      combined.includes("ENOTDIR") ||
      combined.includes("ENOENT");

    if (isDbError) {
      return NextResponse.json(
        { error: "Database not initialized. Please click Initialize & Login below." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
