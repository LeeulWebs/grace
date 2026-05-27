"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  HardHat,
  Wrench,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Shield,
  Target,
  Users,
  Award,
  Sun,
  Droplets,
  Zap,
  Hammer,
  Truck,
  Ruler,
  ClipboardCheck,
  FlaskConical,
  TrainTrack,
  Landmark,
  ArrowUp,
  Menu,
  X,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

/* ──────────────────────────── DATA ──────────────────────────── */

const serviceCategories = [
  {
    id: "construction",
    label: "Construction",
    icon: Building2,
    color: "bg-brand-500",
    lightColor: "bg-brand-50 text-brand-700",
    borderColor: "border-brand-200",
    services: [
      "Building and facility maintenance and repair services",
      "Civil engineering and Construction of buildings & carpentry",
      "Nonresidential building construction services",
      "Permanent buildings and structures",
      "Structural building products",
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    icon: TrainTrack,
    color: "bg-emerald-700",
    lightColor: "bg-emerald-50 text-emerald-700",
    borderColor: "border-emerald-200",
    services: [
      "Construction of roads and bridges",
      "Road construction materials",
      "Civil engineering",
      "Construction and maintenance support equipment",
    ],
  },
  {
    id: "consultancy",
    label: "Engineering Consultancy",
    icon: ClipboardCheck,
    color: "bg-slate-700",
    lightColor: "bg-slate-100 text-slate-700",
    borderColor: "border-slate-200",
    services: [
      "Architectural and engineering consultancy",
      "Construction Management",
      "Design and Construction Supervision of Architectural Engineering",
      "Design and Construction Supervision of Highway Engineering (including Expressway and traffic engineering)",
      "Design and Construction Supervision of Municipal Public Works",
      "Design and Construction Supervision of Railway Engineering",
      "Consulting engineering services with civil, mechanical, electrical and water engineering",
      "Geotechnical Materials Testing",
      "Hydrogeology services",
      "Professional engineering services",
      "Restructuring",
    ],
  },
  {
    id: "energy",
    label: "Energy & Water",
    icon: Zap,
    color: "bg-brand-600",
    lightColor: "bg-brand-50 text-brand-700",
    borderColor: "border-brand-200",
    services: [
      "Solar and Renewable energy",
      "Water collection, treatment and disposal activities",
      "Batteries and generators and kinetic power transmission",
      "Agents affecting water and electrolytes",
    ],
  },
  {
    id: "supply",
    label: "Supply & Procurement",
    icon: Truck,
    color: "bg-emerald-600",
    lightColor: "bg-emerald-50 text-emerald-700",
    borderColor: "border-emerald-200",
    services: [
      "Chemicals and chemical products",
      "Classroom and institutional furniture and fixtures",
      "Computer Equipment and Accessories",
      "Educational and reading materials",
      "Electrical equipment and components and supplies",
      "Electronic manufacturing machinery and equipment",
      "Hand tools & Hardware",
      "IT Spare parts & Office supplies",
      "Relief and Non-relief items",
    ],
  },
];

const stats = [
  { value: 15, suffix: "+", label: "Years of Experience" },
  { value: 200, suffix: "+", label: "Projects Completed" },
  { value: 50, suffix: "+", label: "Expert Engineers" },
  { value: 5, suffix: "", label: "Service Divisions" },
];

const whyChooseUs = [
  {
    icon: Shield,
    title: "Quality Assurance",
    description:
      "We maintain the highest standards of quality in every project, from materials to workmanship, ensuring lasting results.",
  },
  {
    icon: Target,
    title: "On-Time Delivery",
    description:
      "Our streamlined project management ensures every milestone is met on schedule, keeping your projects on track.",
  },
  {
    icon: Users,
    title: "Expert Team",
    description:
      "Our diverse team of qualified engineers, architects, and project managers bring decades of combined expertise.",
  },
  {
    icon: Award,
    title: "Comprehensive Solutions",
    description:
      "From initial design to final construction and ongoing maintenance, we offer end-to-end solutions for every need.",
  },
];

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#why-us" },
  { label: "Contact", href: "#contact" },
];

/* ──────────────────── ANIMATED COUNTER ────────────────────── */

function AnimatedCounter({
  target,
  suffix,
  inView,
}: {
  target: number;
  suffix: string;
  inView: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const stepTime = Math.max(Math.floor(duration / target), 20);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

/* ──────────────────── SECTION WRAPPER ────────────────────── */

function Section({
  id,
  children,
  className = "",
  dark = false,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id={id}
      ref={ref}
      className={`py-20 md:py-28 ${dark ? "bg-slate-900 text-white" : "bg-white text-slate-900"} ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {children}
      </motion.div>
    </section>
  );
}

/* ──────────────────── SECTION HEADER ────────────────────── */

function SectionHeader({
  subtitle,
  title,
  description,
  dark = false,
  center = true,
}: {
  subtitle: string;
  title: string;
  description?: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <div className={`mb-16 ${center ? "text-center" : ""}`}>
      <Badge
        className={`mb-4 px-4 py-1 text-xs font-semibold uppercase tracking-widest ${
          dark
            ? "bg-brand-500/20 text-brand-300 hover:bg-brand-500/20"
            : "bg-brand-50 text-brand-700 hover:bg-brand-50"
        }`}
      >
        {subtitle}
      </Badge>
      <h2
        className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
      <div className="section-divider mx-auto mt-4" />
      {description && (
        <p
          className={`mx-auto mt-6 max-w-2xl text-lg ${
            dark ? "text-slate-300" : "text-slate-500"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* ──────────────── LOGO COMPONENT ────────────────── */

function Logo({ scrolled = false, size = "default" }: { scrolled?: boolean; size?: "default" | "large" | "footer" }) {
  const imgSize = size === "large" ? 44 : size === "footer" ? 36 : 36;
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.jpg"
        alt="Grace Holdings Logo"
        width={imgSize}
        height={imgSize}
        className="object-contain"
        priority
      />
      <div className="flex flex-col leading-none">
        <span
          className={`text-xl font-bold tracking-tight ${
            scrolled ? "text-slate-900" : "text-white"
          } ${size === "footer" ? "text-lg" : ""}`}
        >
          Grace
        </span>
        <span
          className={`text-sm font-medium tracking-wide ${
            scrolled ? "text-brand-500" : "text-brand-300"
          } ${size === "footer" ? "text-xs" : ""}`}
        >
          HOLDINGS
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────── MAIN PAGE ────────────────────────── */

export default function GraceHoldingsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("construction");
  const statsRef = useRef<HTMLDivElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-100px" });
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      service: formData.get("service") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        toast({
          title: "Message Sent!",
          description: result.message,
        });
        form.reset();
      } else {
        toast({
          title: "Error",
          description: result.error || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ───────── NAVIGATION ───────── */}
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 shadow-lg backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#home");
            }}
          >
            <Logo scrolled={scrolled} />
          </a>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className={`text-sm font-medium transition-colors hover:text-brand-400 ${
                  scrolled ? "text-slate-700" : "text-white/90"
                }`}
              >
                {link.label}
              </a>
            ))}
            <Button
              size="sm"
              className="bg-brand-500 text-white hover:bg-brand-600"
              onClick={() => handleNavClick("#contact")}
            >
              Get a Quote
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className={scrolled ? "h-6 w-6 text-slate-900" : "h-6 w-6 text-white"} />
            ) : (
              <Menu className={scrolled ? "h-6 w-6 text-slate-900" : "h-6 w-6 text-white"} />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-white shadow-xl md:hidden"
            >
              <div className="space-y-1 px-4 py-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                  >
                    {link.label}
                  </a>
                ))}
                <Button
                  className="mt-2 w-full bg-brand-500 text-white hover:bg-brand-600"
                  onClick={() => handleNavClick("#contact")}
                >
                  Get a Quote
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ───────── HERO SECTION ───────── */}
      <section
        id="home"
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-construction.jpg')" }}
        />
        {/* Overlay */}
        <div className="hero-overlay absolute inset-0" />
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Badge className="mb-6 bg-brand-500/20 px-4 py-1.5 text-brand-300 hover:bg-brand-500/20">
              Uganda&apos;s Trusted Construction Partner
            </Badge>
            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Building Uganda&apos;s{" "}
              <span className="text-brand-300">Future</span> with
              Excellence
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              From civil engineering and road construction to engineering
              consultancy and comprehensive procurement &mdash; Grace Holdings
              delivers world-class solutions across East Africa.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-brand-500 px-8 text-base font-semibold text-white hover:bg-brand-600"
                onClick={() => handleNavClick("#services")}
              >
                Explore Our Services
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                onClick={() => handleNavClick("#contact")}
              >
                Contact Us Today
              </Button>
            </div>
          </motion.div>

          {/* Quick stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8"
          >
            {[
              { icon: HardHat, text: "Construction" },
              { icon: Ruler, text: "Consultancy" },
              { icon: Truck, text: "Procurement" },
              { icon: Sun, text: "Energy" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex flex-col items-center gap-2 rounded-xl bg-white/5 p-4 backdrop-blur-sm"
              >
                <item.icon className="h-6 w-6 text-brand-300" />
                <span className="text-sm font-medium text-white/80">
                  {item.text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────── ABOUT SECTION ───────── */}
      <Section id="about">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src="/about-building.jpg"
                alt="Modern building representing Grace Holdings"
                className="h-[400px] w-full object-cover lg:h-[500px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-6 -right-4 rounded-xl bg-brand-500 p-6 text-white shadow-xl sm:-right-8">
              <div className="text-3xl font-bold">15+</div>
              <div className="text-sm font-medium text-brand-100">
                Years of Trusted
                <br />
                Service
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <div>
            <Badge className="mb-4 bg-brand-50 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-brand-700 hover:bg-brand-50">
              About Grace Holdings
            </Badge>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              A Legacy of Building
              <br />
              <span className="text-brand-500">Excellence in Uganda</span>
            </h2>
            <div className="section-divider mt-4" />
            <p className="mt-6 text-lg leading-relaxed text-slate-500">
              Grace Holdings is one of Uganda&apos;s leading integrated construction,
              engineering, and procurement companies. Based in Kampala with a
              presence along Kasenge Road, Seguku, we have built a strong
              reputation for delivering high-quality projects across the nation.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-500">
              Our expertise spans civil engineering, building construction, road
              and bridge infrastructure, professional engineering consultancy,
              renewable energy solutions, and comprehensive supply and
              procurement services. We serve both public and private sector
              clients with dedication and professionalism.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: CheckCircle2, text: "Licensed & Certified" },
                { icon: CheckCircle2, text: "Quality Materials" },
                { icon: CheckCircle2, text: "Expert Engineers" },
                { icon: CheckCircle2, text: "Nationwide Reach" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2">
                  <item.icon className="h-5 w-5 flex-shrink-0 text-brand-500" />
                  <span className="text-sm font-medium text-slate-700">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
            <Button
              className="mt-8 bg-brand-500 text-white hover:bg-brand-600"
              onClick={() => handleNavClick("#services")}
            >
              View Our Services
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* ───────── SERVICES SECTION ───────── */}
      <Section id="services" dark>
        <SectionHeader
          subtitle="What We Do"
          title="Our Services"
          description="Grace Holdings offers a comprehensive range of construction, engineering, and procurement services to meet every project need."
          dark
        />

        {/* Service Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mx-auto mb-10 flex h-auto w-full max-w-4xl flex-wrap justify-center gap-2 bg-slate-800 p-2">
            {serviceCategories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium data-[state=active]:bg-brand-500 data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <cat.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {serviceCategories.map((cat) => (
            <TabsContent key={cat.id} value={cat.id}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cat.services.map((service, idx) => (
                  <motion.div
                    key={service}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                  >
                    <Card className="service-card cursor-pointer border-slate-700 bg-slate-800 hover:border-brand-500/50">
                      <CardContent className="flex items-start gap-3 p-5">
                        <div
                          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${cat.lightColor}`}
                        >
                          <cat.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-100">
                            {service}
                          </h3>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Section>

      {/* ───────── STATS SECTION ───────── */}
      <section ref={statsRef} className="relative overflow-hidden bg-brand-500 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-white sm:text-5xl">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  inView={statsInView}
                />
              </div>
              <div className="mt-2 text-sm font-medium text-brand-100">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── WHY CHOOSE US ───────── */}
      <Section id="why-us">
        <SectionHeader
          subtitle="Why Choose Us"
          title="The Grace Holdings Advantage"
          description="We combine local expertise with international standards to deliver projects that exceed expectations."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyChooseUs.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Card className="service-card h-full border-slate-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                    <item.icon className="h-6 w-6 text-brand-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ───────── CONTACT SECTION ───────── */}
      <Section id="contact" dark className="relative">
        {/* Decorative top border */}
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-brand-700 via-brand-300 to-brand-700" />

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div>
            <SectionHeader
              subtitle="Get in Touch"
              title="Contact Us"
              description="Ready to start your next project? Get in touch with our team today."
              dark
              center={false}
            />
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/20">
                  <MapPin className="h-5 w-5 text-brand-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Our Office</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">
                    P.O Box 71503, Kampala
                    <br />
                    Kasenge Road, Seguku
                    <br />
                    Kampala, Uganda
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/20">
                  <Phone className="h-5 w-5 text-brand-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Phone</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    +256 XXX XXX XXX
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/20">
                  <Mail className="h-5 w-5 text-brand-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    info@graceholdings.co.ug
                  </p>
                </div>
              </div>
            </div>

            {/* Service area icons */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {[
                { icon: Building2, label: "Construction" },
                { icon: Ruler, label: "Engineering" },
                { icon: Sun, label: "Renewable" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 rounded-xl bg-slate-800 p-4"
                >
                  <item.icon className="h-6 w-6 text-brand-300" />
                  <span className="text-xs font-medium text-slate-400">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="border-slate-700 bg-slate-800 shadow-2xl">
              <CardContent className="p-6 sm:p-8">
                <h3 className="mb-6 text-xl font-bold text-white">
                  Send Us a Message
                </h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Full Name
                      </label>
                      <Input
                        required
                        name="fullName"
                        placeholder="John Doe"
                        className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400 focus:border-brand-400 focus:ring-brand-400"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Email Address
                      </label>
                      <Input
                        required
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400 focus:border-brand-400 focus:ring-brand-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Phone Number
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="+256 XXX XXX XXX"
                      className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400 focus:border-brand-400 focus:ring-brand-400"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Service Interested In
                    </label>
                    <div className="relative">
                      <select
                        name="service"
                        className="h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-brand-400 focus:ring-brand-400 focus:outline-none"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select a service
                        </option>
                        <option>Building Construction</option>
                        <option>Road & Bridge Construction</option>
                        <option>Civil Engineering</option>
                        <option>Engineering Consultancy</option>
                        <option>Solar & Renewable Energy</option>
                        <option>Water Treatment</option>
                        <option>Supply & Procurement</option>
                        <option>Facility Maintenance</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Message
                    </label>
                    <Textarea
                      required
                      name="message"
                      placeholder="Tell us about your project..."
                      rows={4}
                      className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400 focus:border-brand-400 focus:ring-brand-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-500 py-6 text-base font-semibold text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* ───────── FOOTER ───────── */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Company */}
            <div className="lg:col-span-1">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick("#home");
                }}
              >
                <Logo size="footer" />
              </a>
              <p className="mt-4 text-sm leading-relaxed">
                Uganda&apos;s trusted partner for construction, engineering
                consultancy, and procurement services. Building the future with
                excellence.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Quick Links
              </h3>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(link.href);
                      }}
                      className="text-sm transition-colors hover:text-brand-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Services
              </h3>
              <ul className="space-y-3">
                {serviceCategories.map((cat) => (
                  <li key={cat.id}>
                    <a
                      href="#services"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(cat.id);
                        handleNavClick("#services");
                      }}
                      className="text-sm transition-colors hover:text-brand-300"
                    >
                      {cat.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                Contact Info
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-400" />
                  <span className="text-sm">
                    P.O Box 71503, Kampala
                    <br />
                    Kasenge Road, Seguku
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0 text-brand-400" />
                  <span className="text-sm">info@graceholdings.co.ug</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0 text-brand-400" />
                  <span className="text-sm">+256 XXX XXX XXX</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Grace Holdings. All rights
              reserved.
            </p>
            <p className="text-xs text-slate-500">
              Kampala, Uganda &mdash; Building Excellence
            </p>
          </div>
        </div>
      </footer>

      {/* ───────── SCROLL TO TOP ───────── */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition-colors hover:bg-brand-600"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
