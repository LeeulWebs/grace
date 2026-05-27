"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  RotateCcw,
  Upload,
  ImageIcon,
  Phone,
  Mail,
  MapPin,
  Building2,
  BarChart3,
  Star,
  Loader2,
} from "lucide-react";

interface SettingsViewProps {
  token: string;
}

interface SiteSettings {
  heroImage?: string;
  aboutImage?: string;
  logo?: string;
  companyName?: string;
  address?: string;
  phone?: string;
  email?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroDescription?: string;
  aboutBadge?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  yearsExperience?: number;
  projectsCompleted?: number;
  expertEngineers?: number;
  serviceDivisions?: number;
  whyChooseUs?: {
    icon: string;
    title: string;
    description: string;
  }[];
}

const defaultSettings: SiteSettings = {
  heroImage: "",
  aboutImage: "",
  logo: "",
  companyName: "Grace Holdings",
  address: "P.O Box 71503, Kampala\nKasenge Road, Seguku\nKampala, Uganda",
  phone: "+256 XXX XXX XXX",
  email: "info@graceholdings.co.ug",
  heroBadge: "Uganda's Trusted Construction Partner",
  heroTitle: "Building Uganda's Future with Excellence",
  heroDescription:
    "From civil engineering and road construction to engineering consultancy and comprehensive procurement — Grace Holdings delivers world-class solutions across East Africa.",
  aboutBadge: "About Grace Holdings",
  aboutTitle: "A Legacy of Building Excellence in Uganda",
  aboutDescription:
    "Grace Holdings is one of Uganda's leading integrated construction, engineering, and procurement companies.",
  yearsExperience: 15,
  projectsCompleted: 200,
  expertEngineers: 50,
  serviceDivisions: 5,
  whyChooseUs: [
    {
      icon: "Shield",
      title: "Quality Assurance",
      description:
        "We maintain the highest standards of quality in every project, from materials to workmanship, ensuring lasting results.",
    },
    {
      icon: "Target",
      title: "On-Time Delivery",
      description:
        "Our streamlined project management ensures every milestone is met on schedule, keeping your projects on track.",
    },
    {
      icon: "Users",
      title: "Expert Team",
      description:
        "Our diverse team of qualified engineers, architects, and project managers bring decades of combined expertise.",
    },
    {
      icon: "Award",
      title: "Comprehensive Solutions",
      description:
        "From initial design to final construction and ongoing maintenance, we offer end-to-end solutions for every need.",
    },
  ],
};

export function SettingsView({ token }: SettingsViewProps) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [originalSettings, setOriginalSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const merged = { ...defaultSettings, ...data };
        setSettings(merged);
        setOriginalSettings(merged);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (section: string) => {
    setSaving(section);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setOriginalSettings({ ...settings });
        toast({
          title: "Settings Saved",
          description: `${section} settings updated successfully.`,
        });
      } else {
        const err = await res.json();
        toast({
          title: "Error",
          description: err.error || "Failed to save settings.",
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
      setSaving(null);
    }
  };

  const resetToDefaults = () => {
    setSettings({ ...defaultSettings });
    toast({
      title: "Reset",
      description: "Settings have been reset to defaults. Click Save to apply.",
    });
  };

  const uploadImage = async (
    file: File,
    field: "heroImage" | "aboutImage" | "logo"
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", field);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setSettings((prev) => ({ ...prev, [field]: data.url }));
          toast({
            title: "Upload Success",
            description: "Image uploaded successfully.",
          });
        }
      } else {
        toast({
          title: "Upload Failed",
          description: "Could not upload image.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not upload image.",
        variant: "destructive",
      });
    }
  };

  const updateSetting = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateWhyChooseUs = (
    index: number,
    field: "icon" | "title" | "description",
    value: string
  ) => {
    setSettings((prev) => {
      const updated = [...(prev.whyChooseUs || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, whyChooseUs: updated };
    });
  };

  const hasChanges = (section: string): boolean => {
    const current = JSON.stringify(settings);
    const original = JSON.stringify(originalSettings);
    return current !== original;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          size="sm"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      <Tabs defaultValue="images" className="w-full">
        <TabsList className="w-full justify-start bg-slate-100 p-1">
          <TabsTrigger
            value="images"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Phone className="mr-2 h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger
            value="hero"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Building2 className="mr-2 h-4 w-4" />
            Hero
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <MapPin className="mr-2 h-4 w-4" />
            About
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger
            value="whyus"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Star className="mr-2 h-4 w-4" />
            Why Us
          </TabsTrigger>
        </TabsList>

        {/* Images Tab */}
        <TabsContent value="images">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {(
                [
                  { key: "heroImage" as const, label: "Hero Image" },
                  { key: "aboutImage" as const, label: "About Image" },
                  { key: "logo" as const, label: "Company Logo" },
                ] as const
              ).map((item) => (
                <Card key={item.key} className="border-slate-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-700">
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-3 flex h-36 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50">
                      {settings[item.key] ? (
                        <img
                          src={settings[item.key]}
                          alt={item.label}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <ImageIcon className="h-8 w-8" />
                          <span className="text-xs">No image uploaded</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={(el) => {
                        fileInputRefs.current[item.key] = el;
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImage(file, item.key);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-200 text-xs hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200"
                      onClick={() =>
                        fileInputRefs.current[item.key]?.click()
                      }
                    >
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      Upload Image
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => saveSettings("Images")}
                disabled={saving === "Images" || !hasChanges("Images")}
                className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                size="sm"
              >
                {saving === "Images" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Images
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-slate-100">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={settings.companyName || ""}
                    onChange={(e) => updateSetting("companyName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Textarea
                    value={settings.address || ""}
                    onChange={(e) => updateSetting("address", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={settings.phone || ""}
                      onChange={(e) => updateSetting("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={settings.email || ""}
                      onChange={(e) => updateSetting("email", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => saveSettings("Contact")}
                disabled={saving === "Contact" || !hasChanges("Contact")}
                className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                size="sm"
              >
                {saving === "Contact" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Contact Info
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Hero Tab */}
        <TabsContent value="hero">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-slate-100">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label>Hero Badge Text</Label>
                  <Input
                    value={settings.heroBadge || ""}
                    onChange={(e) => updateSetting("heroBadge", e.target.value)}
                    placeholder="e.g., Uganda's Trusted Construction Partner"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Title</Label>
                  <Input
                    value={settings.heroTitle || ""}
                    onChange={(e) => updateSetting("heroTitle", e.target.value)}
                    placeholder="e.g., Building Uganda's Future with Excellence"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Description</Label>
                  <Textarea
                    value={settings.heroDescription || ""}
                    onChange={(e) =>
                      updateSetting("heroDescription", e.target.value)
                    }
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => saveSettings("Hero")}
                disabled={saving === "Hero" || !hasChanges("Hero")}
                className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                size="sm"
              >
                {saving === "Hero" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Hero Content
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-slate-100">
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label>About Badge</Label>
                  <Input
                    value={settings.aboutBadge || ""}
                    onChange={(e) => updateSetting("aboutBadge", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>About Title</Label>
                  <Input
                    value={settings.aboutTitle || ""}
                    onChange={(e) => updateSetting("aboutTitle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>About Description</Label>
                  <Textarea
                    value={settings.aboutDescription || ""}
                    onChange={(e) =>
                      updateSetting("aboutDescription", e.target.value)
                    }
                    rows={5}
                  />
                </div>
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => saveSettings("About")}
                disabled={saving === "About" || !hasChanges("About")}
                className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                size="sm"
              >
                {saving === "About" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save About Content
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-slate-100">
              <CardContent className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      {
                        key: "yearsExperience" as const,
                        label: "Years of Experience",
                        icon: BarChart3,
                      },
                      {
                        key: "projectsCompleted" as const,
                        label: "Projects Completed",
                        icon: Building2,
                      },
                      {
                        key: "expertEngineers" as const,
                        label: "Expert Engineers",
                        icon: Mail,
                      },
                      {
                        key: "serviceDivisions" as const,
                        label: "Service Divisions",
                        icon: Star,
                      },
                    ] as const
                  ).map((stat) => (
                    <div key={stat.key} className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <stat.icon className="h-4 w-4 text-brand-500" />
                        {stat.label}
                      </Label>
                      <Input
                        type="number"
                        value={settings[stat.key] ?? 0}
                        onChange={(e) =>
                          updateSetting(stat.key, parseInt(e.target.value) || 0)
                        }
                        min={0}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => saveSettings("Stats")}
                disabled={saving === "Stats" || !hasChanges("Stats")}
                className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                size="sm"
              >
                {saving === "Stats" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Stats
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Why Choose Us Tab */}
        <TabsContent value="whyus">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-4">
              {(settings.whyChooseUs || []).map((card, idx) => (
                <Card key={idx} className="border-slate-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-700">
                      Card {idx + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Icon (Lucide name)</Label>
                        <Input
                          value={card.icon}
                          onChange={(e) =>
                            updateWhyChooseUs(idx, "icon", e.target.value)
                          }
                          placeholder="e.g., Shield"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={card.title}
                          onChange={(e) =>
                            updateWhyChooseUs(idx, "title", e.target.value)
                          }
                          placeholder="e.g., Quality Assurance"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={card.description}
                        onChange={(e) =>
                          updateWhyChooseUs(idx, "description", e.target.value)
                        }
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => saveSettings("Why Choose Us")}
                disabled={saving === "Why Choose Us" || !hasChanges("Why Choose Us")}
                className="bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
                size="sm"
              >
                {saving === "Why Choose Us" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Why Choose Us
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
