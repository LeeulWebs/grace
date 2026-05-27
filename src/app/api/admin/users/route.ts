import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only admin role can access user list
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Only admins can view users." },
        { status: 403 }
      );
    }

    const users = await db.adminUser.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, password, fullName, role } = body;

    if (!username || !password || !fullName) {
      return NextResponse.json(
        { error: "Username, password, and fullName are required." },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.adminUser.findUnique({
      where: { username: username.trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);

    const user = await db.adminUser.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        fullName: fullName.trim(),
        role: role || "editor",
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
