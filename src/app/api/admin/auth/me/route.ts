import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        username: session.user.username,
        fullName: session.user.fullName,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
