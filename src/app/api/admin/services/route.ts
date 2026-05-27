import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    const services = await db.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Get services error:", error);
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
    const { name, icon, color, lightColor, borderColor, services } = body;

    if (!name || !icon || !color || !lightColor || !borderColor) {
      return NextResponse.json(
        { error: "name, icon, color, lightColor, and borderColor are required." },
        { status: 400 }
      );
    }

    const serviceCategory = await db.serviceCategory.create({
      data: {
        name: name.trim(),
        icon: icon.trim(),
        color: color.trim(),
        lightColor: lightColor.trim(),
        borderColor: borderColor.trim(),
        services: services ? JSON.stringify(services) : "[]",
      },
    });

    return NextResponse.json({ service: serviceCategory }, { status: 201 });
  } catch (error) {
    console.error("Create service error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
