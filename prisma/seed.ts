import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if admin user already exists
  const existingUser = await prisma.adminUser.findUnique({
    where: { username: "user" },
  });

  if (existingUser) {
    console.log("✅ Admin user 'user' already exists, skipping.");
  } else {
    const hash = crypto.createHash("sha256").update("user").digest("hex");
    await prisma.adminUser.create({
      data: {
        username: "user",
        password: hash,
        fullName: "Super Admin",
        role: "superadmin",
        isActive: true,
      },
    });
    console.log("✅ Created admin user (username: 'user', password: 'user')");
  }

  // Seed default service categories
  const existingServices = await prisma.serviceCategory.count();
  if (existingServices > 0) {
    console.log(`✅ ${existingServices} service categories already exist, skipping.`);
  } else {
    await prisma.serviceCategory.createMany({
      data: [
        {
          name: "Construction",
          icon: "Building2",
          color: "bg-brand-500",
          lightColor: "bg-brand-50 text-brand-700",
          borderColor: "border-brand-200",
          services: JSON.stringify([
            "Building and facility maintenance and repair services",
            "Civil engineering and Construction of buildings & carpentry",
            "Nonresidential building construction services",
            "Permanent buildings and structures",
            "Structural building products",
          ]),
          sortOrder: 0,
        },
        {
          name: "Infrastructure",
          icon: "TrainTrack",
          color: "bg-emerald-700",
          lightColor: "bg-emerald-50 text-emerald-700",
          borderColor: "border-emerald-200",
          services: JSON.stringify([
            "Construction of roads and bridges",
            "Road construction materials",
            "Civil engineering",
            "Construction and maintenance support equipment",
          ]),
          sortOrder: 1,
        },
        {
          name: "Engineering Consultancy",
          icon: "ClipboardCheck",
          color: "bg-slate-700",
          lightColor: "bg-slate-100 text-slate-700",
          borderColor: "border-slate-200",
          services: JSON.stringify([
            "Architectural and engineering consultancy",
            "Construction Management",
            "Design and Construction Supervision of Architectural Engineering",
            "Design and Construction Supervision of Highway Engineering",
            "Design and Construction Supervision of Municipal Public Works",
            "Design and Construction Supervision of Railway Engineering",
            "Consulting engineering services with civil, mechanical, electrical and water engineering",
            "Geotechnical Materials Testing",
            "Hydrogeology services",
            "Professional engineering services",
            "Restructuring",
          ]),
          sortOrder: 2,
        },
        {
          name: "Energy & Water",
          icon: "Zap",
          color: "bg-brand-600",
          lightColor: "bg-brand-50 text-brand-700",
          borderColor: "border-brand-200",
          services: JSON.stringify([
            "Solar and Renewable energy",
            "Water collection, treatment and disposal activities",
            "Batteries and generators and kinetic power transmission",
            "Agents affecting water and electrolytes",
          ]),
          sortOrder: 3,
        },
        {
          name: "Supply & Procurement",
          icon: "Truck",
          color: "bg-emerald-600",
          lightColor: "bg-emerald-50 text-emerald-700",
          borderColor: "border-emerald-200",
          services: JSON.stringify([
            "Chemicals and chemical products",
            "Classroom and institutional furniture and fixtures",
            "Computer Equipment and Accessories",
            "Educational and reading materials",
            "Electrical equipment and components and supplies",
            "Electronic manufacturing machinery and equipment",
            "Hand tools & Hardware",
            "IT Spare parts & Office supplies",
            "Relief and Non-relief items",
          ]),
          sortOrder: 4,
        },
      ],
    });
    console.log("✅ Created 5 default service categories.");
  }

  // Seed default site settings
  const existingSettings = await prisma.siteSetting.count();
  if (existingSettings > 0) {
    console.log(`✅ ${existingSettings} site settings already exist, skipping.`);
  } else {
    await prisma.siteSetting.createMany({
      data: [
        { key: "hero_badge", value: "Uganda's Trusted Construction Partner" },
        { key: "hero_title", value: "Building Uganda's Future with Excellence" },
        { key: "hero_description", value: "From civil engineering and road construction to engineering consultancy and comprehensive procurement — Grace Holdings delivers world-class solutions across East Africa." },
        { key: "hero_image", value: "/hero-construction.jpg" },
        { key: "about_badge", value: "About Grace Holdings" },
        { key: "about_title", value: "A Legacy of Building Excellence in Uganda" },
        { key: "about_description", value: "Grace Holdings is one of Uganda's leading integrated construction, engineering, and procurement companies. Based in Kampala with a presence along Kasenge Road, Seguku, we have built a strong reputation for delivering high-quality projects across the nation." },
        { key: "about_image", value: "/about-building.jpg" },
        { key: "company_name", value: "Grace Holdings" },
        { key: "company_address", value: "P.O Box 71503, Kampala\nKasenge Road, Seguku\nKampala, Uganda" },
        { key: "company_phone", value: "+256 XXX XXX XXX" },
        { key: "company_email", value: "info@graceholdings.co.ug" },
        { key: "logo", value: "/logo.jpg" },
        { key: "stat_years", value: "15" },
        { key: "stat_projects", value: "200" },
        { key: "stat_engineers", value: "50" },
        { key: "stat_divisions", value: "5" },
        { key: "wcu_1_icon", value: "Shield" },
        { key: "wcu_1_title", value: "Quality Assurance" },
        { key: "wcu_1_description", value: "We maintain the highest standards of quality in every project, from materials to workmanship, ensuring lasting results." },
        { key: "wcu_2_icon", value: "Target" },
        { key: "wcu_2_title", value: "On-Time Delivery" },
        { key: "wcu_2_description", value: "Our streamlined project management ensures every milestone is met on schedule, keeping your projects on track." },
        { key: "wcu_3_icon", value: "Users" },
        { key: "wcu_3_title", value: "Expert Team" },
        { key: "wcu_3_description", value: "Our diverse team of qualified engineers, architects, and project managers bring decades of combined expertise." },
        { key: "wcu_4_icon", value: "Award" },
        { key: "wcu_4_title", value: "Comprehensive Solutions" },
        { key: "wcu_4_description", value: "From initial design to final construction and ongoing maintenance, we offer end-to-end solutions for every need." },
      ],
    });
    console.log("✅ Created 28 default site settings.");
  }

  console.log("🎉 Seeding complete!");
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error("❌ Seed error:", e);
  process.exit(1);
});
