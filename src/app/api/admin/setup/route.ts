import { NextResponse } from "next/server";
import { db, ensureDatabase } from "@/lib/db";

/**
 * POST /api/admin/setup
 * Initializes the database using raw SQL (no Prisma CLI needed).
 * Seeds admin user, site settings, and service categories.
 */
export async function POST() {
  try {
    // Step 1: Create tables + admin user via raw SQL
    const ready = await ensureDatabase(db);
    if (!ready) {
      return NextResponse.json({ error: "Failed to create database tables." }, { status: 500 });
    }

    // Step 2: Seed site settings if empty
    try {
      if ((await db.siteSetting.count()) === 0) {
        await db.siteSetting.createMany({
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
    } catch (e) {
      console.error("[setup] Settings seed error:", e);
    }

    // Step 3: Seed service categories if empty
    try {
      if ((await db.serviceCategory.count()) === 0) {
        await db.serviceCategory.createMany({
          data: [
            { name: "Construction", icon: "Building2", color: "bg-brand-500", lightColor: "bg-brand-50 text-brand-700", borderColor: "border-brand-200", services: '["Building and facility maintenance","Civil engineering","Nonresidential building construction"]', sortOrder: 0 },
            { name: "Infrastructure", icon: "TrainTrack", color: "bg-emerald-700", lightColor: "bg-emerald-50 text-emerald-700", borderColor: "border-emerald-200", services: '["Construction of roads and bridges","Road construction materials","Civil engineering"]', sortOrder: 1 },
            { name: "Engineering Consultancy", icon: "ClipboardCheck", color: "bg-slate-700", lightColor: "bg-slate-100 text-slate-700", borderColor: "border-slate-200", services: '["Architectural and engineering consultancy","Construction Management"]', sortOrder: 2 },
            { name: "Energy & Water", icon: "Zap", color: "bg-brand-600", lightColor: "bg-brand-50 text-brand-700", borderColor: "border-brand-200", services: '["Solar and Renewable energy","Water collection and treatment"]', sortOrder: 3 },
            { name: "Supply & Procurement", icon: "Truck", color: "bg-emerald-600", lightColor: "bg-emerald-50 text-emerald-700", borderColor: "border-emerald-200", services: '["Chemicals and chemical products","Computer Equipment"]', sortOrder: 4 },
          ],
        });
        console.log("[setup] Service categories seeded.");
      }
    } catch (e) {
      console.error("[setup] Services seed error:", e);
    }

    return NextResponse.json({ success: true, message: "Database ready." });
  } catch (error) {
    console.error("[setup] Error:", error);
    return NextResponse.json({ error: "Setup failed." }, { status: 500 });
  }
}
