import { NextResponse } from "next/server";
import { execSync } from "child_process";
import crypto from "crypto";

/**
 * POST /api/admin/setup
 * Initializes the database (pushes schema + seeds admin user).
 * Called automatically by the login page when it detects an uninit'd DB.
 */
export async function POST() {
  try {
    // 1. Push schema — try npx first, fallback to bunx
    console.log("[setup] Pushing Prisma schema...");
    let schemaOk = false;
    for (const cmd of [
      "npx prisma db push --skip-generate 2>&1",
      "bunx prisma db push --skip-generate 2>&1",
    ]) {
      try {
        execSync(cmd, {
          cwd: process.cwd(),
          stdio: "pipe",
          timeout: 60000,
        });
        schemaOk = true;
        console.log("[setup] Schema pushed.");
        break;
      } catch {
        console.log(`[setup] ${cmd.split(" ")[0]} failed, trying next...`);
      }
    }

    if (!schemaOk) {
      return NextResponse.json(
        { error: "Could not push schema. Run: bun run setup" },
        { status: 500 }
      );
    }

    // 2. Seed admin user using dynamic import to get a fresh Prisma client
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient({ log: [] });

    try {
      const count = await prisma.adminUser.count();
      if (count === 0) {
        const hash = crypto.createHash("sha256").update("user").digest("hex");
        await prisma.adminUser.create({
          data: {
            username: "user",
            password: hash,
            fullName: "Admin User",
            role: "admin",
            isActive: true,
          },
        });
        console.log("[setup] Admin user created.");
      }

      // Also seed site settings and services if empty
      const settingCount = await prisma.siteSetting.count();
      if (settingCount === 0) {
        await prisma.siteSetting.createMany({
          data: [
            { key: "hero_badge", value: "Uganda's Trusted Construction Partner" },
            { key: "hero_title", value: "Building Uganda's Future with Excellence" },
            { key: "hero_description", value: "From civil engineering and road construction to engineering consultancy and comprehensive procurement — Grace Holdings delivers world-class solutions across East Africa." },
            { key: "hero_image", value: "/hero-construction.jpg" },
            { key: "about_badge", value: "About Grace Holdings" },
            { key: "about_title", value: "A Legacy of Building Excellence in Uganda" },
            { key: "about_description", value: "Grace Holdings is one of Uganda's leading integrated construction, engineering, and procurement companies." },
            { key: "about_image", value: "/about-building.jpg" },
            { key: "company_name", value: "Grace Holdings" },
            { key: "company_address", value: "P.O Box 71503, Kampala, Uganda" },
            { key: "company_phone", value: "+256 XXX XXX XXX" },
            { key: "company_email", value: "info@graceholdings.co.ug" },
            { key: "logo", value: "/logo.jpg" },
            { key: "stat_years", value: "15" },
            { key: "stat_projects", value: "200" },
            { key: "stat_engineers", value: "50" },
            { key: "stat_divisions", value: "5" },
          ],
        });
        console.log("[setup] Site settings seeded.");
      }

      const serviceCount = await prisma.serviceCategory.count();
      if (serviceCount === 0) {
        await prisma.serviceCategory.createMany({
          data: [
            { name: "Construction", icon: "Building2", color: "bg-brand-500", lightColor: "bg-brand-50 text-brand-700", borderColor: "border-brand-200", services: '["Building and facility maintenance","Civil engineering","Nonresidential building construction","Permanent buildings and structures","Structural building products"]', sortOrder: 0 },
            { name: "Infrastructure", icon: "TrainTrack", color: "bg-emerald-700", lightColor: "bg-emerald-50 text-emerald-700", borderColor: "border-emerald-200", services: '["Construction of roads and bridges","Road construction materials","Civil engineering","Construction and maintenance support equipment"]', sortOrder: 1 },
            { name: "Engineering Consultancy", icon: "ClipboardCheck", color: "bg-slate-700", lightColor: "bg-slate-100 text-slate-700", borderColor: "border-slate-200", services: '["Architectural and engineering consultancy","Construction Management","Design and Construction Supervision"]', sortOrder: 2 },
            { name: "Energy & Water", icon: "Zap", color: "bg-brand-600", lightColor: "bg-brand-50 text-brand-700", borderColor: "border-brand-200", services: '["Solar and Renewable energy","Water collection, treatment and disposal","Batteries and generators","Electrical equipment and supplies"]', sortOrder: 3 },
            { name: "Supply & Procurement", icon: "Truck", color: "bg-emerald-600", lightColor: "bg-emerald-50 text-emerald-700", borderColor: "border-emerald-200", services: '["Chemicals and chemical products","Classroom and institutional furniture","Computer Equipment and Accessories","Educational and reading materials"]', sortOrder: 4 },
          ],
        });
        console.log("[setup] Service categories seeded.");
      }
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json({ success: true, message: "Database initialized." });
  } catch (error) {
    console.error("[setup] Error:", error);
    return NextResponse.json(
      { error: "Setup failed. Run this in your terminal: bun run setup" },
      { status: 500 }
    );
  }
}
