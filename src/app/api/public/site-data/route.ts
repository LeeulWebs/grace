import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get active service categories ordered by sort order
    const services = await db.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // Get all site settings as key-value map
    const settings = await db.siteSetting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    // Count unread messages
    const unreadMessages = await db.contactSubmission.count({
      where: { isRead: false },
    });

    return NextResponse.json({
      services,
      settings: settingsMap,
      unreadMessages,
    });
  } catch (error) {
    console.error("Get public site data error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
