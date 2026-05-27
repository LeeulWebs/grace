"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface UsersViewProps {
  token: string;
  currentUser: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
}

interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export function UsersView({ token, currentUser }: UsersViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: "add" | "edit";
    user: User | null;
  }>({ open: false, mode: "add", user: null });
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: "editor" as "admin" | "editor",
    isActive: true,
    newPassword: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setUsers(list);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAddDialog = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      role: "editor",
      isActive: true,
      newPassword: "",
    });
    setDialogState({ open: true, mode: "add", user: null });
  };

  const openEditDialog = (user: User) => {
    setFormData({
      username: user.username,
      password: "",
      fullName: user.fullName,
      role: user.role as "admin" | "editor",
      isActive: user.isActive,
      newPassword: "",
    });
    setDialogState({ open: true, mode: "edit", user });
  };

  const saveUser = async () => {
    setSaving(true);
    try {
      let res: Response;

      if (dialogState.mode === "add") {
        res = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            fullName: formData.fullName,
            role: formData.role,
          }),
        });
      } else {
        const body: Record<string, unknown> = {
          fullName: formData.fullName,
          role: formData.role,
          isActive: formData.isActive,
        };
        if (formData.newPassword) {
          body.password = formData.newPassword;
        }
        res = await fetch(`/api/admin/users/${dialogState.user!.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      }

      if (res.ok) {
        toast({
          title: "Success",
          description:
            dialogState.mode === "add"
              ? "User created successfully."
              : "User updated successfully.",
        });
        setDialogState({ open: false, mode: "add", user: null });
        fetchUsers();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to save user.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        toast({ title: "Deleted", description: "User deleted successfully." });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
    setDeleteTarget(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isSelf = (user: User) => user.id === currentUser.id;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Card className="border-slate-100">
          <CardContent className="p-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="mb-3 h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-brand-500" />
          <h2 className="text-sm font-medium text-slate-500">
            {users.length} User{users.length !== 1 ? "s" : ""}
          </h2>
        </div>
        <Button
          onClick={openAddDialog}
          className="bg-brand-500 text-white hover:bg-brand-600"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card className="border-slate-100">
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <UsersIcon className="h-12 w-12 text-slate-300" />
              <p className="mt-4 text-base font-medium text-slate-500">
                No users yet
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Click &ldquo;Add User&rdquo; to create the first admin user.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {users.map((user) => (
                      <motion.tr
                        key={user.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`border-b border-slate-50 transition-colors hover:bg-slate-50/50 ${
                          isSelf(user) ? "bg-brand-50/50" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white ${
                                isSelf(user)
                                  ? "bg-brand-500"
                                  : "bg-slate-400"
                              }`}
                            >
                              {user.username.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {user.username}
                            </span>
                            {isSelf(user) && (
                              <Badge className="border-brand-200 bg-brand-50 text-[10px] text-brand-700 hover:bg-brand-50">
                                You
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {user.fullName}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={
                              user.role === "admin"
                                ? "border-violet-200 bg-violet-50 text-[10px] font-medium text-violet-700 hover:bg-violet-50"
                                : "border-slate-200 bg-slate-50 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                            }
                          >
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {user.isActive ? (
                            <Badge className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 hover:bg-emerald-50">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="border-red-200 bg-red-50 text-[10px] text-red-700 hover:bg-red-50">
                              Inactive
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(user)}
                              className="h-8 border-slate-200 text-xs hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200"
                            >
                              <Pencil className="mr-1 h-3 w-3" />
                              Edit
                            </Button>
                            {!isSelf(user) && (
                              <AlertDialog
                                open={deleteTarget?.id === user.id}
                                onOpenChange={(open) =>
                                  !open && setDeleteTarget(null)
                                }
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                    onClick={() => setDeleteTarget(user)}
                                  >
                                    <Trash2 className="mr-1 h-3 w-3" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete User
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      <strong>{user.fullName}</strong>? This action
                                      cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUser(user)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState({ ...dialogState, open })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogState.mode === "add" ? "Create New User" : "Edit User"}
            </DialogTitle>
            <DialogDescription>
              {dialogState.mode === "add"
                ? "Add a new admin user to the system."
                : `Editing ${dialogState.user?.fullName || "user"}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {dialogState.mode === "add" && (
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="Enter username"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                }
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: value as "admin" | "editor",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dialogState.mode === "add" ? (
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Enter password"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                    disabled={isSelf(dialogState.user!)}
                  />
                </div>
                {isSelf(dialogState.user!) && (
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    You cannot deactivate your own account.
                  </p>
                )}
                <div className="space-y-2">
                  <Label>New Password (optional)</Label>
                  <Input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setDialogState({ open: false, mode: "add", user: null })
              }
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={saveUser}
              disabled={
                saving ||
                !formData.fullName.trim() ||
                (dialogState.mode === "add" &&
                  (!formData.username.trim() || !formData.password.trim()))
              }
              className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {dialogState.mode === "add" ? "Create User" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
