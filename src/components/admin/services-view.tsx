"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown,
  ChevronUp,
  Layers,
  GripVertical,
  X,
  Wrench,
} from "lucide-react";

interface ServicesViewProps {
  token: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  lightColor: string;
  borderColor: string;
  services: string[];
  order?: number;
}

export function ServicesView({ token }: ServicesViewProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    category: ServiceCategory | null;
    isNew: boolean;
  }>({ open: false, category: null, isNew: false });
  const [formData, setFormData] = useState({
    name: "",
    icon: "Wrench",
    color: "bg-brand-500",
    lightColor: "bg-brand-50 text-brand-700",
    borderColor: "border-brand-200",
    services: [""] as string[],
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];
        setCategories(list);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load services.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openNewCategory = () => {
    setFormData({
      name: "",
      icon: "Wrench",
      color: "bg-brand-500",
      lightColor: "bg-brand-50 text-brand-700",
      borderColor: "border-brand-200",
      services: [""],
    });
    setEditDialog({ open: true, category: null, isNew: true });
  };

  const openEditCategory = (cat: ServiceCategory) => {
    setFormData({
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      lightColor: cat.lightColor,
      borderColor: cat.borderColor,
      services: cat.services.length > 0 ? [...cat.services] : [""],
    });
    setEditDialog({ open: true, category: cat, isNew: false });
  };

  const saveCategory = async () => {
    setSaving(true);
    try {
      const filteredServices = formData.services.filter((s) => s.trim() !== "");
      const body = {
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
        lightColor: formData.lightColor,
        borderColor: formData.borderColor,
        services: filteredServices,
      };

      let res: Response;
      if (editDialog.isNew) {
        res = await fetch("/api/admin/services", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/admin/services/${editDialog.category!.id}`, {
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
          description: editDialog.isNew
            ? "Category created successfully."
            : "Category updated successfully.",
        });
        setEditDialog({ open: false, category: null, isNew: false });
        fetchCategories();
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to save category.",
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

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        if (expandedId === id) setExpandedId(null);
        toast({ title: "Deleted", description: "Category deleted successfully." });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive",
      });
    }
    setDeleteTarget(null);
  };

  const addServiceField = () => {
    setFormData((prev) => ({ ...prev, services: [...prev.services, ""] }));
  };

  const removeServiceField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const updateServiceField = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((s, i) => (i === index ? value : s)),
    }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-brand-500" />
          <h2 className="text-sm font-medium text-slate-500">
            {categories.length} Categor{categories.length === 1 ? "y" : "ies"}
          </h2>
        </div>
        <Button
          onClick={openNewCategory}
          className="bg-brand-500 text-white hover:bg-brand-600"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories */}
      {categories.length === 0 ? (
        <Card className="border-slate-100">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wrench className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-base font-medium text-slate-500">
              No service categories yet
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Click &ldquo;Add Category&rdquo; to create your first service category.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`border-slate-100 transition-all duration-200 ${
                    expandedId === cat.id
                      ? "shadow-md ring-1 ring-brand-500/20"
                      : "hover:shadow-sm hover:border-slate-200"
                  }`}
                >
                  <CardContent className="p-0">
                    {/* Category Header */}
                    <button
                      className="flex w-full items-center gap-3 p-4 text-left"
                      onClick={() =>
                        setExpandedId(expandedId === cat.id ? null : cat.id)
                      }
                    >
                      <GripVertical className="h-4 w-4 cursor-grab text-slate-300 hover:text-slate-500" />
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cat.lightColor}`}>
                        <span className="text-sm font-bold">{cat.icon.slice(0, 2)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {cat.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {cat.services.length} service{cat.services.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge className="border-slate-200 bg-slate-50 text-[10px] text-slate-600 hover:bg-slate-50">
                          {cat.icon}
                        </Badge>
                        <div
                          className={`ml-1 h-3 w-3 rounded-full ${cat.color.replace("bg-", "bg-").split(" ")[0]}`}
                          title={cat.color}
                        />
                        {expandedId === cat.id ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedId === cat.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-slate-100 p-4 pt-3">
                            {/* Service List */}
                            {cat.services.length > 0 ? (
                              <ul className="space-y-2">
                                {cat.services.map((svc, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                  >
                                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                                    <span className="flex-1">{svc}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-slate-400">
                                No services in this category.
                              </p>
                            )}

                            {/* Actions */}
                            <div className="mt-4 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditCategory(cat)}
                                className="border-slate-200 text-xs hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200"
                              >
                                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <AlertDialog
                                open={deleteTarget === cat.id}
                                onOpenChange={(open) =>
                                  !open && setDeleteTarget(null)
                                }
                              >
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                  >
                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      <strong>{cat.name}</strong> and all its services?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteCategory(cat.id)}
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

      {/* Edit / Create Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ ...editDialog, open })}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editDialog.isNew ? "Create Category" : "Edit Category"}
            </DialogTitle>
            <DialogDescription>
              {editDialog.isNew
                ? "Add a new service category with its services."
                : "Update the category details and services."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Construction"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Icon (Lucide name)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="e.g., Building2"
                />
              </div>
              <div className="space-y-2">
                <Label>Color Class</Label>
                <Input
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  placeholder="e.g., bg-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Light Color Class</Label>
                <Input
                  value={formData.lightColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      lightColor: e.target.value,
                    }))
                  }
                  placeholder="e.g., bg-brand-50 text-brand-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Border Color Class</Label>
                <Input
                  value={formData.borderColor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      borderColor: e.target.value,
                    }))
                  }
                  placeholder="e.g., border-brand-200"
                />
              </div>
            </div>

            {/* Services */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Services</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addServiceField}
                  className="text-xs text-brand-500 hover:text-brand-600"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Service
                </Button>
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {formData.services.map((svc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xs text-slate-500">
                      {idx + 1}
                    </span>
                    <Input
                      value={svc}
                      onChange={(e) =>
                        updateServiceField(idx, e.target.value)
                      }
                      placeholder={`Service ${idx + 1}`}
                      className="flex-1"
                    />
                    {formData.services.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeServiceField(idx)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditDialog({ open: false, category: null, isNew: false })
              }
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={saveCategory}
              disabled={saving || !formData.name.trim()}
              className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : editDialog.isNew ? "Create Category" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
