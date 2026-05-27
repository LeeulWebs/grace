import crypto from "crypto";
import { db } from "@/lib/db";
import type { AdminUser } from "@prisma/client";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function generateToken(): string {
  return crypto.randomUUID();
}

interface SessionUser {
  user: AdminUser;
}

export async function getSession(
  request: Request
): Promise<SessionUser | null> {
  try {
    // Clean expired sessions
    await db.session.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return null;
    }

    // Find the session with user
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { id: session.id } });
      return null;
    }

    // Check if user is active
    if (!session.user.isActive) {
      return null;
    }

    // Extend session expiry by 7 days
    await db.session.update({
      where: { id: session.id },
      data: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user: session.user };
  } catch (error) {
    console.error("Session validation error:", error);
    return null;
  }
}
