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
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.password !== hashedPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account disabled" }, { status: 403 });
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
    console.error("[login] Error:", error);

    // Catch any DB issue and tell the frontend to run setup
    const msg = ((error as Error).message || "") + " " + ((error as Error).stack || "");
    const isDbError =
      msg.includes("no such table") ||
      msg.includes("SQLITE") ||
      msg.includes("Prisma") ||
      msg.includes("prisma") ||
      msg.includes("ENOENT") ||
      msg.includes("Cannot find");

    if (isDbError) {
      return NextResponse.json(
        { error: "DATABASE_NOT_READY", setupRequired: true },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
