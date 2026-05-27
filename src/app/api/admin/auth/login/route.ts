import { NextRequest, NextResponse } from "next/server";
import { db, ensureDatabase } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    // Ensure DB is ready (creates tables + admin user if needed — uses raw SQL, no CLI)
    const ready = await ensureDatabase(db);
    if (!ready) {
      return NextResponse.json(
        { error: "DATABASE_NOT_READY", setupRequired: true },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required." }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);

    const user = await db.adminUser.findUnique({
      where: { username: username.trim() },
    });

    if (!user || user.password !== hashedPassword) {
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
      user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
    });
  } catch (error) {
    console.error("[login] Error:", error);
    return NextResponse.json(
      { error: "DATABASE_NOT_READY", setupRequired: true },
      { status: 503 }
    );
  }
}
