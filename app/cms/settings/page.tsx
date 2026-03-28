"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings2,
  Palette,
  Search,
  MessageCircle,
  Bell,
  Database,
  AlertTriangle,
  Upload,
  Loader2,
  Check,
  RefreshCcw,
  Trash2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";

type SettingsSection = "general" | "appearance" | "seo" | "comments" | "notifications" | "backup";

const navItems: { id: SettingsSection; label: string; icon: typeof Settings2 }[] = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "seo", label: "SEO", icon: Search },
  { id: "comments", label: "Comments", icon: MessageCircle },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "backup", label: "Backup", icon: Database },
];

const accentColors = [
  { color: "#10b981", name: "Emerald" },
  { color: "#6366f1", name: "Indigo" },
  { color: "#f59e0b", name: "Amber" },
  { color: "#ef4444", name: "Red" },
  { color: "#ec4899", name: "Pink" },
  { color: "#8b5cf6", name: "Purple" },
  { color: "#06b6d4", name: "Cyan" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const [selectedColor, setSelectedColor] = useState("#10b981");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form states
  const [blogName, setBlogName] = useState("SuperBlog");
  const [blogUrl, setBlogUrl] = useState("https://superblog.dev");
  const [blogDescription, setBlogDescription] = useState(
    "A modern blog about design systems, web development, and technology."
  );
  const [email, setEmail] = useState("hello@superblog.dev");

  // Toggle states
  const [enableComments, setEnableComments] = useState(true);
  const [moderateComments, setModerateComments] = useState(true);
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [nestedReplies, setNestedReplies] = useState(true);

  // Notification toggles
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const scrollToSection = (sectionId: SettingsSection) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h1 className="mb-2 font-serif text-3xl font-semibold text-foreground">
          Settings
        </h1>
        <p className="text-muted">
          Manage your blog configuration and preferences.
        </p>
      </motion.div>

      {/* Settings Layout */}
      <div className="grid grid-cols-5 gap-8">
        {/* Settings Navigation */}
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="col-span-1"
        >
          <ul className="space-y-1 rounded-xl border border-border bg-card p-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`
                      flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all
                      duration-150
                      ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary"
                        : `
                          text-muted
                          hover:bg-secondary hover:text-foreground
                        `
                    }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.nav>

        {/* Settings Content */}
        <div className="col-span-4 space-y-8">
          {/* General Settings */}
          <motion.section
            id="general"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings2 className="h-5 w-5 text-primary" />
                  General Settings
                </CardTitle>
                <p className="text-sm text-muted">
                  Basic configuration for your blog.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="blogName">Blog Name</Label>
                    <Input
                      id="blogName"
                      value={blogName}
                      onChange={(e) => setBlogName(e.target.value)}
                      placeholder="Enter blog name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blogUrl">Blog URL</Label>
                    <Input
                      id="blogUrl"
                      type="url"
                      value={blogUrl}
                      onChange={(e) => setBlogUrl(e.target.value)}
                      placeholder="https://"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blogDescription">
                    Blog Description <span className="text-muted">(optional)</span>
                  </Label>
                  <Textarea
                    id="blogDescription"
                    value={blogDescription}
                    onChange={(e) => setBlogDescription(e.target.value)}
                    placeholder="A brief description of your blog"
                    className="min-h-24"
                  />
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <NativeSelect id="timezone" defaultValue="Asia/Shanghai">
                      <NativeSelectOption value="Asia/Shanghai">UTC+8 Asia/Shanghai</NativeSelectOption>
                      <NativeSelectOption value="UTC">UTC</NativeSelectOption>
                      <NativeSelectOption value="America/New_York">UTC-5 America/New_York</NativeSelectOption>
                      <NativeSelectOption value="Europe/London">UTC+0 Europe/London</NativeSelectOption>
                      <NativeSelectOption value="Asia/Tokyo">UTC+9 Asia/Tokyo</NativeSelectOption>
                    </NativeSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <NativeSelect id="language" defaultValue="zh-CN">
                      <NativeSelectOption value="zh-CN">简体中文</NativeSelectOption>
                      <NativeSelectOption value="en">English</NativeSelectOption>
                      <NativeSelectOption value="ja">日本語</NativeSelectOption>
                    </NativeSelect>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Appearance Settings */}
          <motion.section
            id="appearance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Palette className="h-5 w-5 text-primary" />
                  Appearance
                </CardTitle>
                <p className="text-sm text-muted">
                  Customize your blog&apos;s look and feel.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-6">
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-secondary">
                      <img
                        src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=160&h=160&fit=crop"
                        alt="Logo preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="secondary" size="sm">
                        <Upload className="h-4 w-4" />
                        Upload New Logo
                      </Button>
                      <p className="text-xs text-muted">PNG, JPG or SVG. Max size 2MB.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Accent Color</Label>
                  <div className="flex gap-3">
                    {accentColors.map((accent) => (
                      <button
                        key={accent.color}
                        onClick={() => setSelectedColor(accent.color)}
                        className={`
                          h-9 w-9 rounded-full transition-all duration-150
                          hover:scale-110
                          ${
                          selectedColor === accent.color
                            ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                            : ""
                        }
                        `}
                        style={{ backgroundColor: accent.color }}
                        title={accent.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <NativeSelect id="theme" defaultValue="dark">
                      <NativeSelectOption value="dark">Dark</NativeSelectOption>
                      <NativeSelectOption value="light">Light</NativeSelectOption>
                      <NativeSelectOption value="system">System</NativeSelectOption>
                    </NativeSelect>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font">Font Family</Label>
                    <NativeSelect id="font" defaultValue="inter">
                      <NativeSelectOption value="inter">Inter</NativeSelectOption>
                      <NativeSelectOption value="system">System Font</NativeSelectOption>
                      <NativeSelectOption value="roboto">Roboto</NativeSelectOption>
                      <NativeSelectOption value="poppins">Poppins</NativeSelectOption>
                    </NativeSelect>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* SEO Settings */}
          <motion.section
            id="seo"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-primary" />
                  SEO Settings
                </CardTitle>
                <p className="text-sm text-muted">
                  Optimize your blog for search engines.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">
                    Default Meta Title <span className="text-muted">(used when no specific title is set)</span>
                  </Label>
                  <Input
                    id="metaTitle"
                    defaultValue="SuperBlog — A Modern Tech Blog"
                    placeholder="Meta title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">
                    Default Meta Description <span className="text-muted">(used when no specific description is set)</span>
                  </Label>
                  <Textarea
                    id="metaDescription"
                    defaultValue="A modern blog about design systems, web development, and technology. Explore in-depth tutorials, best practices, and insights."
                    placeholder="A brief description for search engines"
                    className="min-h-24"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="analyticsId">
                      Google Analytics ID <span className="text-muted">(optional)</span>
                    </Label>
                    <Input id="analyticsId" placeholder="G-XXXXXXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sitemap">Sitemap</Label>
                    <Input
                      id="sitemap"
                      defaultValue="superblog.dev/sitemap.xml"
                      disabled
                      className="opacity-60"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Comment Settings */}
          <motion.section
            id="comments"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Comment Settings
                </CardTitle>
                <p className="text-sm text-muted">
                  Control how comments work on your blog.
                </p>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between border-b border-border py-4">
                  <div className="mr-8 flex-1">
                    <p className="text-sm font-medium text-foreground">Enable Comments</p>
                    <p className="text-xs text-muted">Allow visitors to leave comments on articles</p>
                  </div>
                  <Switch
                    checked={enableComments}
                    onCheckedChange={setEnableComments}
                  />
                </div>
                <div className="flex items-center justify-between border-b border-border py-4">
                  <div className="mr-8 flex-1">
                    <p className="text-sm font-medium text-foreground">Moderate Comments</p>
                    <p className="text-xs text-muted">Require approval before comments appear publicly</p>
                  </div>
                  <Switch
                    checked={moderateComments}
                    onCheckedChange={setModerateComments}
                  />
                </div>
                <div className="flex items-center justify-between border-b border-border py-4">
                  <div className="mr-8 flex-1">
                    <p className="text-sm font-medium text-foreground">Allow Anonymous Comments</p>
                    <p className="text-xs text-muted">Let users comment without creating an account</p>
                  </div>
                  <Switch
                    checked={allowAnonymous}
                    onCheckedChange={setAllowAnonymous}
                  />
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="mr-8 flex-1">
                    <p className="text-sm font-medium text-foreground">Enable Nested Replies</p>
                    <p className="text-xs text-muted">Allow replies to comments (up to 3 levels deep)</p>
                  </div>
                  <Switch
                    checked={nestedReplies}
                    onCheckedChange={setNestedReplies}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Notification Settings */}
          <motion.section
            id="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Settings
                </CardTitle>
                <p className="text-sm text-muted">
                  Manage how you receive notifications.
                </p>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between border-b border-border py-4">
                  <div className="mr-8 flex-1">
                    <p className="text-sm font-medium text-foreground">Email Notifications</p>
                    <p className="text-xs text-muted">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between border-b border-border py-4">
                  <div className="mr-8 flex-1">
                    <p className="text-sm font-medium text-foreground">Comment Notifications</p>
                    <p className="text-xs text-muted">Get notified when someone comments on your posts</p>
                  </div>
                  <Switch
                    checked={commentNotifications}
                    onCheckedChange={setCommentNotifications}
                  />
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="mr-8 flex-1">
                    <p className="text-sm font-medium text-foreground">Weekly Digest</p>
                    <p className="text-xs text-muted">Receive a weekly summary of your blog activity</p>
                  </div>
                  <Switch
                    checked={weeklyDigest}
                    onCheckedChange={setWeeklyDigest}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            id="backup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          >
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
                <p className="text-sm text-muted">
                  Irreversible and destructive actions.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  <div className="min-w-48 flex-1">
                    <p className="mb-3 text-sm font-medium text-foreground">Reset All Settings</p>
                    <Button variant="outline" className={`
                      border-destructive text-destructive
                      hover:bg-destructive hover:text-destructive-foreground
                    `}>
                      <RefreshCcw className="h-4 w-4" />
                      Reset to Defaults
                    </Button>
                  </div>
                  <div className="min-w-48 flex-1">
                    <p className="mb-3 text-sm font-medium text-foreground">Delete All Data</p>
                    <Button variant="outline" className={`
                      border-destructive text-destructive
                      hover:bg-destructive hover:text-destructive-foreground
                    `}>
                      <Trash2 className="h-4 w-4" />
                      Delete Everything
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>

          {/* Form Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
            className="flex justify-end gap-4 border-t border-border pt-6"
          >
            <Button variant="secondary">Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || saved}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
