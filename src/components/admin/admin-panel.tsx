"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminLogin } from "./admin-login";
import { AdminLayout } from "./admin-layout";

interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

export function AdminPanel() {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const verifyToken = useCallback(
    async (token: string) => {
      try {
        const res = await fetch("/api/admin/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            id: data.id || data.user?.id || "",
            username: data.username || data.user?.username || "",
            fullName: data.fullName || data.user?.fullName || "",
            role: data.role || data.user?.role || "editor",
          });
          setAuthToken(token);
          setVerified(true);
        } else {
          localStorage.removeItem("admin_token");
          setVerified(false);
        }
      } catch {
        setVerified(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("admin_token");
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setLoading(false);
      setVerified(false);
    }
  }, [verifyToken]);

  const handleLogin = (token: string) => {
    setAuthToken(token);
    setVerified(true);
    // Fetch user info after login
    verifyToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setAuthToken(null);
    setUser(null);
    setVerified(false);
    toast({
      title: "Logged Out",
      description: "You have been signed out.",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-slate-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {verified && authToken && user ? (
        <motion.div
          key="admin-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <AdminLayout
            user={user}
            onLogout={handleLogout}
            token={authToken}
          />
        </motion.div>
      ) : (
        <motion.div
          key="admin-login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="h-screen"
        >
          <AdminLogin onLogin={handleLogin} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
