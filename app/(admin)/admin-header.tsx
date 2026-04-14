"use client";

import { usePathname } from "next/navigation";
import { Command, Sparkles } from "lucide-react";

const titleMap: Record<string, { title: string; description: string }> = {
  "/admin": {
    title: "Dashboard",
    description: "概览内容状态、数据密度和最近更新。",
  },
  "/admin/blogs": {
    title: "Articles",
    description: "集中管理文章、草稿和封面资源。",
  },
  "/admin/categories": {
    title: "Categories",
    description: "维护文章的主题结构与归档维度。",
  },
  "/admin/tags": {
    title: "Tags",
    description: "整理检索标签，让内容关系更清晰。",
  },
  "/admin/changelogs": {
    title: "Changelog",
    description: "记录每一次发布、修正和功能迭代。",
  },
  "/admin/users": {
    title: "Users",
    description: "查看成员状态与权限管理入口。",
  },
};

export function AdminHeader() {
  const pathname = usePathname();
  const match = Object.entries(titleMap)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([key]) => pathname === key || pathname.startsWith(`${key}/`));
  const content =
    match?.[1] ?? {
      title: "Admin",
      description: "管理内容、站点信息与系统成员。",
    };

  return (
    <header className={`
      mb-8 flex flex-col gap-4 rounded-[var(--radius-xl)] border border-white/10 bg-white/4 px-6 py-5 backdrop-blur-xl
      lg:flex-row lg:items-center lg:justify-between
    `}>
      <div>
        <div className="text-label mb-3 flex items-center gap-2 text-primary">
          <Sparkles className="size-3.5" />
          Chen Serif Control Center
        </div>
        <h1 className="font-serif text-4xl leading-none text-foreground">
          {content.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {content.description}
        </p>
      </div>

      <div className={`
        inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm
        text-muted-foreground
      `}>
        <Command className="size-4 text-primary" />
        内容系统已切换到 Chen Serif 设计语言
      </div>
    </header>
  );
}
