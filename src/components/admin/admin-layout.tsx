"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Mail,
  Wrench,
  Settings,
  Users,
  LogOut,
  Menu,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";

import { DashboardView } from "./dashboard-view";
import { MessagesView } from "./messages-view";
import { ServicesView } from "./services-view";
import { SettingsView } from "./settings-view";
import { UsersView as UsersViewComponent } from "./users-view";

type Section = "dashboard" | "messages" | "services" | "settings" | "users";

interface AdminLayoutProps {
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
  onLogout: () => void;
  token: string;
}

interface NavItem {
  id: Section;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "services", label: "Services", icon: Wrench },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "users", label: "Users", icon: Users },
];

const sectionTitles: Record<Section, string> = {
  dashboard: "Dashboard",
  messages: "Messages",
  services: "Services",
  settings: "Settings",
  users: "User Management",
};

function SidebarNav({
  activeSection,
  onNavigate,
  unreadCount,
  onLogout,
  onBackToSite,
}: {
  activeSection: Section;
  onNavigate: (section: Section) => void;
  unreadCount: number;
  onLogout: () => void;
  onBackToSite: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <Image
          src="/logo.jpg"
          alt="Grace Holdings"
          width={36}
          height={36}
          className="rounded-lg object-contain"
        />
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold text-white">Grace</span>
          <span className="text-xs font-medium tracking-widest text-brand-400">
            HOLDINGS
          </span>
        </div>
      </div>

      {/* Nav Label */}
      <div className="px-5 pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Navigation
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-brand-500/15 text-brand-400 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <item.icon className={`h-4.5 w-4.5 ${isActive ? "text-brand-400" : ""}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "messages" && unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-brand-500/60" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-auto space-y-1 px-3 pb-5">
        <Separator className="mb-3 bg-slate-700/50" />
        <button
          onClick={onBackToSite}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Website
        </button>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function AdminLayout({ user, onLogout, token }: AdminLayoutProps) {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingUnread, setLoadingUnread] = useState(true);
  const { toast } = useToast();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setUnreadCount(list.filter((m: { isRead: boolean }) => !m.isRead).length);
      }
    } catch {
      // Silently fail for badge count
    } finally {
      setLoadingUnread(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const handleNavigate = (section: Section) => {
    setActiveSection(section);
    setMobileOpen(false);
    // Refresh unread count when navigating
    if (section === "dashboard" || section === "messages") {
      fetchUnreadCount();
    }
  };

  const handleBackToSite = () => {
    window.location.hash = "#/";
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardView
            token={token}
            onNavigate={(section) => handleNavigate(section as Section)}
          />
        );
      case "messages":
        return <MessagesView token={token} />;
      case "services":
        return <ServicesView token={token} />;
      case "settings":
        return <SettingsView token={token} />;
      case "users":
        return <UsersViewComponent token={token} currentUser={user} />;
      default:
        return <DashboardView token={token} />;
    }
  };

  const sidebarContent = (
    <SidebarNav
      activeSection={activeSection}
      onNavigate={handleNavigate}
      unreadCount={unreadCount}
      onLogout={onLogout}
      onBackToSite={handleBackToSite}
    />
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 bg-slate-900 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 bg-slate-900 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5 text-slate-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-slate-900 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                {sidebarContent}
              </SheetContent>
            </Sheet>

            {/* Section title */}
            <div className="flex items-center gap-2">
              {navItems.find((n) => n.id === activeSection) && (
                <>
                  {(() => {
                    const Icon = navItems.find((n) => n.id === activeSection)!.icon;
                    return <Icon className="h-5 w-5 text-brand-500" />;
                  })()}
                  <h1 className="text-base font-semibold text-slate-900">
                    {sectionTitles[activeSection]}
                  </h1>
                </>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">
                  {user.fullName}
                </span>
                <span className="text-[10px] font-medium uppercase text-slate-400">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
