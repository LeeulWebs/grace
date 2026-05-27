import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/admin-auth";

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
    const serviceId = parseInt(id, 10);

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: "Invalid service ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, icon, color, lightColor, borderColor, services, sortOrder, isActive } = body;

    const serviceCategory = await db.serviceCategory.update({
      where: { id: serviceId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(icon !== undefined && { icon: icon.trim() }),
        ...(color !== undefined && { color: color.trim() }),
        ...(lightColor !== undefined && { lightColor: lightColor.trim() }),
        ...(borderColor !== undefined && { borderColor: borderColor.trim() }),
        ...(services !== undefined && { services: JSON.stringify(services) }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ service: serviceCategory });
  } catch (error) {
    console.error("Update service error:", error);
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
    const serviceId = parseInt(id, 10);

    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: "Invalid service ID." },
        { status: 400 }
      );
    }

    await db.serviceCategory.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete service error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
