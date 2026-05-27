"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Mail,
  MailOpen,
  Trash2,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Inbox,
  Phone,
} from "lucide-react";

interface MessagesViewProps {
  token: string;
}

interface Message {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export function MessagesView({ token }: MessagesViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setMessages(list);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const toggleRead = async (msg: Message) => {
    setActionLoading(msg.id);
    try {
      const res = await fetch(`/api/admin/messages/${msg.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isRead: !msg.isRead }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isRead: !m.isRead } : m))
        );
        toast({
          title: msg.isRead ? "Marked as Unread" : "Marked as Read",
          description: `Message from ${msg.fullName} updated.`,
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update message.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
        toast({ title: "Success", description: "All messages marked as read." });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to mark all as read.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (expandedId === id) setExpandedId(null);
        toast({ title: "Deleted", description: "Message deleted successfully." });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const filtered = messages.filter(
    (m) =>
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Card>
          <CardContent className="p-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="mb-3 h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="border-slate-200 bg-white pl-10"
            />
          </div>
          {unreadCount > 0 && (
            <Badge className="border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Messages List */}
      {filtered.length === 0 ? (
        <Card className="border-slate-100">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Inbox className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-base font-medium text-slate-500">
              {messages.length === 0
                ? "No messages yet"
                : "No messages match your search"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {messages.length === 0
                ? "Messages from the contact form will appear here."
                : "Try adjusting your search terms."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    !msg.isRead
                      ? "border-l-4 border-l-brand-500 border-slate-100 bg-brand-50/30"
                      : "border-slate-100 hover:border-slate-200"
                  } ${expandedId === msg.id ? "shadow-md" : "hover:shadow-sm"}`}
                  onClick={() =>
                    setExpandedId(expandedId === msg.id ? null : msg.id)
                  }
                >
                  <CardContent className="p-4">
                    {/* Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {!msg.isRead && (
                            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                          )}
                          <p
                            className={`truncate text-sm ${
                              !msg.isRead
                                ? "font-semibold text-slate-900"
                                : "font-medium text-slate-700"
                            }`}
                          >
                            {msg.fullName}
                          </p>
                          <span className="hidden truncate text-sm text-slate-400 sm:inline">
                            &mdash; {msg.email}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="sm:hidden">{msg.email}</span>
                          {msg.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {msg.phone}
                            </span>
                          )}
                          {msg.service && <span>{msg.service}</span>}
                          <span>{formatDate(msg.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <Badge
                          className={
                            msg.isRead
                              ? "border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 hover:bg-emerald-50"
                              : "border-orange-200 bg-orange-50 text-[10px] text-orange-700 hover:bg-orange-50"
                          }
                        >
                          {msg.isRead ? "Read" : "Unread"}
                        </Badge>
                        {expandedId === msg.id ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedId === msg.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 border-t border-slate-100 pt-4">
                            <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                              {msg.message}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRead(msg);
                                }}
                                disabled={actionLoading === msg.id}
                                className="border-slate-200 text-xs hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200"
                              >
                                {msg.isRead ? (
                                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                                ) : (
                                  <MailOpen className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                {msg.isRead ? "Mark Unread" : "Mark Read"}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => e.stopPropagation()}
                                    className="border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                  >
                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this message from{" "}
                                      <strong>{msg.fullName}</strong>? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMessage(msg.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Summary */}
      {!loading && messages.length > 0 && (
        <p className="text-center text-xs text-slate-400">
          Showing {filtered.length} of {messages.length} messages
        </p>
      )}
    </div>
  );
}
