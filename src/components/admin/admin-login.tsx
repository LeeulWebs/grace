"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, User } from "lucide-react";
import Image from "next/image";

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        onLogin(data.token);
      } else {
        toast({
          title: "Login Failed",
          description: data.error || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Connection Error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25px 25px, rgba(0,191,255,0.3) 2px, transparent 0)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-slate-700/50 bg-white/95 shadow-2xl backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center gap-4 pb-2 pt-8">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpg"
                alt="Grace Holdings"
                width={48}
                height={48}
                className="rounded-lg object-contain"
                priority
              />
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  Grace
                </span>
                <span className="text-sm font-medium tracking-widest text-brand-500">
                  HOLDINGS
                </span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <h2 className="text-lg font-semibold text-slate-900">
                Admin Panel
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Sign in to manage your website
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="border-slate-200 bg-slate-50 pl-10 transition-colors focus:border-brand-500 focus:ring-brand-500/20"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="border-slate-200 bg-slate-50 pl-10 transition-colors focus:border-brand-500 focus:ring-brand-500/20"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-brand-500 text-base font-semibold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            <div className="mt-6 border-t border-slate-100 pt-4 text-center">
              <p className="text-xs text-slate-400">
                Grace Holdings &mdash; Admin Management System
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
