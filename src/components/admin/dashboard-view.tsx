"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, Bell, Layers, Users as UsersIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DashboardViewProps {
  token: string;
  onNavigate?: (section: string) => void;
}

interface DashboardStats {
  totalMessages: number;
  unreadMessages: number;
  totalCategories: number;
  totalUsers: number;
}

interface RecentMessage {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  isRead: boolean;
}

export function DashboardView({ token, onNavigate }: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    unreadMessages: 0,
    totalCategories: 0,
    totalUsers: 0,
  });
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [messagesRes, servicesRes, usersRes] = await Promise.allSettled([
        fetch("/api/admin/messages", { headers }).then((r) => r.json()),
        fetch("/api/admin/services", { headers }).then((r) => r.json()),
        fetch("/api/admin/users", { headers }).then((r) => r.json()),
      ]);

      const messages = messagesRes.status === "fulfilled" ? messagesRes.value : [];
      const services = servicesRes.status === "fulfilled" ? servicesRes.value : [];
      const users = usersRes.status === "fulfilled" ? usersRes.value : [];

      const messageList = Array.isArray(messages) ? messages : messages.data || [];
      const serviceList = Array.isArray(services) ? services : services.data || [];
      const userList = Array.isArray(users) ? users : users.data || [];

      setStats({
        totalMessages: messageList.length,
        unreadMessages: messageList.filter((m: { isRead: boolean }) => !m.isRead).length,
        totalCategories: serviceList.length,
        totalUsers: userList.length,
      });

      const sorted = [...messageList].sort(
        (a: RecentMessage, b: RecentMessage) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentMessages(sorted.slice(0, 5));
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: "Total Messages",
      value: stats.totalMessages,
      icon: Mail,
      color: "bg-brand-50 text-brand-500",
      badge: null,
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages,
      icon: Bell,
      color: "bg-orange-50 text-orange-500",
      badge: stats.unreadMessages > 0 ? stats.unreadMessages : null,
    },
    {
      title: "Service Categories",
      value: stats.totalCategories,
      icon: Layers,
      color: "bg-emerald-50 text-emerald-600",
      badge: null,
    },
    {
      title: "Active Users",
      value: stats.totalUsers,
      icon: UsersIcon,
      color: "bg-violet-50 text-violet-600",
      badge: null,
    },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
          >
            <Card className="group border-slate-100 shadow-sm transition-all duration-300 hover:border-brand-200 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{card.title}</p>
                    {loading ? (
                      <Skeleton className="mt-2 h-9 w-16" />
                    ) : (
                      <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
                    )}
                  </div>
                  <div className={`relative rounded-xl p-3 ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                    {card.badge !== null && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {card.badge}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">
              Recent Messages
            </CardTitle>
            {onNavigate && (
              <button
                onClick={() => onNavigate("messages")}
                className="flex items-center gap-1 text-sm font-medium text-brand-500 transition-colors hover:text-brand-600"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </CardHeader>
          <CardContent className="px-0 pb-2">
            {loading ? (
              <div className="space-y-3 px-6 pb-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentMessages.length === 0 ? (
              <div className="py-10 text-center">
                <Mail className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">No messages yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Name
                      </TableHead>
                      <TableHead className="px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email
                      </TableHead>
                      <TableHead className="px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </TableHead>
                      <TableHead className="px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMessages.map((msg) => (
                      <TableRow
                        key={msg.id}
                        className="border-slate-50 transition-colors hover:bg-slate-50/50"
                      >
                        <TableCell className="px-6 font-medium text-slate-900">
                          {msg.fullName}
                        </TableCell>
                        <TableCell className="px-6 text-sm text-slate-500">
                          {msg.email}
                        </TableCell>
                        <TableCell className="px-6 text-sm text-slate-500">
                          {formatDate(msg.createdAt)}
                        </TableCell>
                        <TableCell className="px-6">
                          {msg.isRead ? (
                            <Badge className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700 hover:bg-emerald-50">
                              Read
                            </Badge>
                          ) : (
                            <Badge className="border-orange-200 bg-orange-50 text-xs text-orange-700 hover:bg-orange-50">
                              Unread
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
