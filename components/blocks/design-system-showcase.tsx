"use client";

import NiceModal from "@ebay/nice-modal-react";
import { useState } from "react";

import { ResourceTable } from "@/components/blocks/resource-table";
import { SubscribeDialog } from "@/components/modals/subscribe-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { taxonomyRows } from "@/lib/mocks/cms-content";

export function DesignSystemShowcase() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="type-label">Core Tokens</div>
          <CardTitle>Color, typography, and hierarchy</CardTitle>
          <CardDescription>Semantic tokens drive every public and CMS surface before page-specific styling appears.</CardDescription>
        </CardHeader>
        <CardContent className={`
          grid gap-4
          md:grid-cols-4
        `}>
          {[
            { label: "Background", value: "#050505", className: "bg-background" },
            { label: "Primary", value: "#10b981", className: "bg-primary text-primary-foreground" },
            { label: "Card", value: "rgba(255,255,255,0.03)", className: "bg-card" },
            { label: "Border", value: "rgba(255,255,255,0.1)", className: "bg-white/10" },
          ].map((token) => (
            <div key={token.label} className="space-y-3 rounded-[1.5rem] border border-white/8 bg-white/3 p-4">
              <div className={`
                h-24 rounded-[1.25rem]
                ${token.className}
              `} />
              <div className="font-medium">{token.label}</div>
              <div className="font-mono text-[11px] tracking-[0.28em] text-muted uppercase">{token.value}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs defaultValue="controls">
        <TabsList>
          <TabsTrigger value="controls">Controls</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="motion">Motion</TabsTrigger>
        </TabsList>
        <TabsContent value="controls">
          <Card>
            <CardContent className={`
              grid gap-6
              md:grid-cols-2
            `}>
              <div className="space-y-4">
                <div className="type-label">Buttons & badges</div>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div className="type-label">Stateful primitives</div>
                <Select
                  defaultValue="editorial"
                  options={[
                    { label: "Editorial", value: "editorial" },
                    { label: "CMS", value: "cms" },
                    { label: "Documentation", value: "docs" },
                  ]}
                />
                <div className={`
                  flex items-center justify-between rounded-[1.3rem] border border-white/8 bg-white/4 px-4 py-3
                `}>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Realtime notifications</div>
                    <div className="text-xs text-muted">Mock switch state using Base UI.</div>
                  </div>
                  <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>
                <label className={`
                  flex items-center gap-3 rounded-[1.3rem] border border-white/8 bg-white/4 px-4 py-3 text-sm
                `}>
                  <Checkbox defaultChecked />
                  Enable compact publishing mode
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="data">
          <ResourceTable
            columns={[
              { key: "label", label: "Name" },
              { key: "usage", label: "Usage" },
              { key: "tone", label: "Tone" },
            ]}
            rows={taxonomyRows}
          />
        </TabsContent>
        <TabsContent value="motion">
          <Card>
            <CardContent className={`
              grid gap-4
              md:grid-cols-2
            `}>
              <div className="rounded-[1.6rem] border border-white/8 bg-white/3 p-5">
                <div className="mb-3 type-label">Glow CTA</div>
                <Button onClick={() => void NiceModal.show(SubscribeDialog, { email: "designer@example.com" })}>
                  Open NiceModal Dialog
                </Button>
              </div>
              <div className="rounded-[1.6rem] border border-white/8 bg-white/3 p-5">
                <div className="mb-3 type-label">Atmosphere</div>
                <p className="text-sm leading-6 text-muted">
                  Motion stays concentrated in hero surfaces, focus rings, and feedback cues rather than everywhere.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
