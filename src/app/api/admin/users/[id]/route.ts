import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/admin-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const targetUserId = parseInt(id, 10);

    if (isNaN(targetUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { fullName, role, isActive, password } = body;

    // Cannot deactivate self
    if (isActive === false && targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account." },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password !== undefined && password !== "") {
      updateData.password = hashPassword(password);
    }

    const user = await db.adminUser.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const targetUserId = parseInt(id, 10);

    if (isNaN(targetUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID." },
        { status: 400 }
      );
    }

    // Cannot delete self
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    // Delete user and their sessions (cascade will handle sessions)
    await db.adminUser.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
