"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your blog settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>
              Basic information about your blog.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" defaultValue="Fuxiaochen" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                defaultValue="Building accessible, pixel-perfect digital experiences for the web."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                type="url"
                defaultValue="https://fuxiaochen.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO</CardTitle>
            <CardDescription>
              Search engine optimization settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="metaTitle">Default Meta Title</Label>
              <Input
                id="metaTitle"
                defaultValue="Fuxiaochen - Full Stack Developer"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="metaDescription">Default Meta Description</Label>
              <Textarea
                id="metaDescription"
                defaultValue="Building accessible, pixel-perfect digital experiences for the web. Writing about web development, design, and productivity."
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Sitemap</Label>
                <p className="text-muted-foreground text-sm">
                  Automatically generate sitemap.xml
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable RSS Feed</Label>
                <p className="text-muted-foreground text-sm">
                  Generate RSS feed for readers and RSS clients
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Comments Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>Configure comment settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Comments</Label>
                <p className="text-muted-foreground text-sm">
                  Allow readers to comment on posts
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval</Label>
                <p className="text-muted-foreground text-sm">
                  Moderate comments before publishing
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-muted-foreground text-sm">
                  Receive email for new comments
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
            <CardDescription>Your social media profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input id="twitter" placeholder="https://twitter.com/username" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="github">GitHub</Label>
              <Input id="github" placeholder="https://github.com/username" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Delete All Posts</p>
                <p className="text-muted-foreground text-sm">
                  Permanently delete all blog posts.
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Delete All
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium">Reset Settings</p>
                <p className="text-muted-foreground text-sm">
                  Reset all settings to defaults.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
