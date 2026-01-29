"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  FileText,
  FolderTree,
  History,
  LayoutDashboard,
  Tags,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Sidebar Menu Configuration
const sidebarItems = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Blogs", href: "/admin/blogs", icon: FileText },
  { title: "Categories", href: "/admin/categories", icon: FolderTree },
  { title: "Tags", href: "/admin/tags", icon: Tags },
  { title: "Changelogs", href: "/admin/changelogs", icon: History },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-cyber-black/95 backdrop-blur-sm">
      {/* Header Logo Area */}
      <div className="relative flex h-16 items-center border-b border-white/10 px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-xl tracking-widest uppercase"
        >
          <span
            className={`
              text-neon-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)] transition-all
              group-hover:text-neon-magenta
            `}
          >
            Admin
          </span>
          <span className="text-white/80">.OS</span>
        </Link>
        {/* Decorative light dot */}
        <div
          className={`
            bg-neon-green absolute top-1/2 right-4 h-1.5 w-1.5 -translate-y-1/2 animate-pulse rounded-full
            shadow-[0_0_8px_var(--color-neon-green)]
          `}
        />
      </div>

      {/* Navigation Area */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="grid gap-2 px-3">
          {sidebarItems.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname?.startsWith(item.href));

            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  `
                    group relative flex items-center gap-3 overflow-hidden rounded-sm px-4 py-3 text-sm font-medium
                    transition-all duration-300
                  `,
                  // Base state: Gray text
                  `
                    text-gray-400
                    hover:bg-white/5 hover:text-neon-cyan
                  `,
                  // Active state: Neon cyan text, bright background, glowing border
                  isActive
                    ? "bg-white/5 text-neon-cyan shadow-[inset_2px_0_0_0_var(--color-neon-cyan)]"
                    : "hover:shadow-[inset_2px_0_0_0_rgba(255,255,255,0.2)]",
                )}
              >
                {/* Background scanline effect (Visible on Hover/Active) */}
                <div
                  className={cn(
                    `
                      absolute inset-0
                      bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,255,0.05)_50%,transparent_100%)] opacity-0
                      transition-opacity duration-500
                    `,
                    (isActive || "group-hover:opacity-100") &&
                      `translate-x-[-100%] animate-[glitch_2s_ease-in-out_infinite] opacity-100`,
                    // Note: reusing glitch animation or define scan? Let's stick to simple opacity for now or reuse glitch keyframes if they work for scanning.
                    // Actually, glitch is defined in global.css. Let's use a simpler hover effect for now to avoid complexity without new keyframes.
                  )}
                />

                <item.icon
                  className={cn(
                    `
                      h-4 w-4 transition-transform duration-300
                      group-hover:scale-110
                    `,
                    isActive && "drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]",
                  )}
                />
                <span className="font-mono tracking-wide">{item.title}</span>

                {/* Right decorative corner */}
                {isActive && (
                  <span className="absolute right-2 h-1.5 w-1.5 rotate-45 bg-neon-cyan" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Bar */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/20 p-3">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-neon-purple to-blue-600 p-[1px]">
            <div className="h-full w-full rounded bg-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xs font-bold tracking-wider text-gray-300">
              SYSTEM_OP
            </span>
            <span className="text-neon-green font-mono text-[10px]">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
