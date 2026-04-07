"use client";

import { Bell, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CmsHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className={`
      mb-8 flex flex-col gap-5
      lg:flex-row lg:items-end lg:justify-between
    `}>
      <div className="space-y-2">
        <div className="type-label">CMS Surface</div>
        <h1 className="font-serif text-5xl tracking-[-0.05em]">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted">{description}</p>
      </div>
      <div className={`
        flex flex-col gap-3
        sm:flex-row sm:items-center
      `}>
        <Input className="min-w-72" placeholder="Search articles, comments, settings..." startAdornment={<Search className={`
          size-4
        `} />} />
        <Button size="icon" variant="outline">
          <Bell className="size-4" />
        </Button>
      </div>
    </header>
  );
}
