import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/admin-auth";

export async function PATCH(
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
    const messageId = parseInt(id, 10);

    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: "Invalid message ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isRead } = body;

    if (typeof isRead !== "boolean") {
      return NextResponse.json(
        { error: "isRead must be a boolean." },
        { status: 400 }
      );
    }

    const message = await db.contactSubmission.update({
      where: { id: messageId },
      data: { isRead },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Update message error:", error);
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

    // Only admin role can delete messages
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Only admins can delete messages." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const messageId = parseInt(id, 10);

    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: "Invalid message ID." },
        { status: 400 }
      );
    }

    await db.contactSubmission.delete({
      where: { id: messageId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete message error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
