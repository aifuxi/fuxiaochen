"use client";

import {
  Database,
  Bell,
  Clock3,
  FileText,
  Link2,
  Menu,
  Plus,
  Settings,
  Tags,
  X,
  Globe2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactElement, type ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type AdminPanel = "notifications" | "backup" | "compose" | "profile";

type Props = {
  children: ReactNode;
  unreadCount: number | null;
  notificationError: string;
  onOpen: (panel: AdminPanel) => void;
  writingFocused: boolean;
  postPending: boolean;
};

const navGroups = [
  {
    name: "内容",
    items: [
      { name: "文章管理", icon: FileText, href: "/admin/posts" },
      { name: "分类与标签", icon: Tags, href: "/admin/categories" },
      { name: "更新日志", icon: Clock3, href: "/admin/changelog" },
    ],
  },
  {
    name: "互动",
    items: [{ name: "友情链接", icon: Link2, href: "/admin/friends-links" }],
  },
  {
    name: "系统",
    items: [
      { name: "系统设置", icon: Settings, href: "/admin/settings" },
      { name: "备份管理", icon: Database, href: "/admin/backups" },
    ],
  },
];

function DockHint({ label, children }: { label: string; children: ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function AdminShell({
  children,
  unreadCount,
  notificationError,
  onOpen,
  writingFocused,
  postPending,
}: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const frontLink = (mobile: boolean) => (
    <Link
      href="/"
      className="admin-front-link"
      aria-label="前往网站首页"
      aria-disabled={postPending || undefined}
      onClick={(event) => {
        if (postPending) event.preventDefault();
        else setMobileOpen(false);
      }}
    >
      <Globe2 size={mobile ? 16 : 20} aria-hidden="true" />
      {mobile && <span>前往网站首页</span>}
    </Link>
  );

  const sidebar = (mobile: boolean) => (
    <div className="admin-sidebar-inner">
      <div>
        <div className="admin-brand">
          <BrandLogo className="admin-brand-logo" />
          <span className={mobile ? "admin-brand-name" : "sr-only"}>
            付小晨 <small>管理空间</small>
          </span>
          {mobile && (
            <Button
              variant="ghost"
              size="compact"
              className="admin-mobile-close"
              aria-label="关闭导航"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </Button>
          )}
        </div>
        <nav className="admin-nav" aria-label="管理导航">
          {navGroups.map((group) => (
            <div key={group.name} className="admin-nav-group">
              <p className={mobile ? "admin-nav-group-label" : "sr-only"}>{group.name}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const content = (
                  <>
                    <Icon size={mobile ? 18 : 20} strokeWidth={1.8} aria-hidden="true" />
                    {mobile && <span>{item.name}</span>}
                  </>
                );
                const sharedProps = {
                  className: `admin-nav-item ${active ? "is-active" : ""}`,
                  "aria-label": item.name,
                  "aria-disabled": postPending || undefined,
                };
                const link = (
                  <Link
                    key={item.name}
                    href={item.href}
                    {...sharedProps}
                    aria-current={active ? "page" : undefined}
                    onClick={(event) => {
                      if (postPending) event.preventDefault();
                      else setMobileOpen(false);
                    }}
                  >
                    {content}
                  </Link>
                );
                return mobile ? (
                  link
                ) : (
                  <DockHint key={item.href} label={item.name}>
                    {link}
                  </DockHint>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
      <div className="admin-sidebar-bottom">
        {mobile ? frontLink(true) : <DockHint label="前往网站首页">{frontLink(false)}</DockHint>}
      </div>
    </div>
  );

  return (
    <div className={`admin-layout ${writingFocused ? "admin-layout-writing" : ""}`}>
      <aside className="admin-sidebar" aria-label="侧边栏">
        <TooltipProvider delay={250}>{sidebar(false)}</TooltipProvider>
      </aside>
      <div className="admin-main-column">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <Button
              size="compact"
              variant="ghost"
              className="admin-menu-button"
              aria-label="打开导航"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </Button>
          </div>
          <div className="admin-topbar-actions">
            <ThemeToggle className="admin-icon-button" />
            <Button
              size="compact"
              variant="ghost"
              disabled={postPending}
              aria-haspopup="dialog"
              title={notificationError || undefined}
              aria-label={
                notificationError
                  ? "通知读取失败，打开后重试"
                  : `通知，${unreadCount ?? "未知数量"} 条未读`
              }
              onClick={() => onOpen("notifications")}
            >
              <Bell size={17} aria-hidden="true" />
              <span>{unreadCount === null ? "—" : unreadCount > 99 ? "99+" : unreadCount}</span>
            </Button>
            <Button
              size="compact"
              variant="secondary"
              className="admin-create"
              aria-label="新建文章"
              disabled={postPending}
              onClick={() => onOpen("compose")}
            >
              <Plus size={16} aria-hidden="true" />
              <span>新建文章</span>
            </Button>
            <Button
              size="compact"
              variant="ghost"
              className="admin-profile"
              onClick={() => onOpen("profile")}
              aria-label="账户菜单"
              disabled={postPending}
            >
              <Image src="/avatar.avif" width={30} height={30} alt="" />
              <span>管理账户</span>
            </Button>
          </div>
        </header>
        <main data-page-motion className="admin-content">
          {children}
        </main>
        <footer className="admin-footer">
          <span>© 付小晨</span>
        </footer>
      </div>
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="admin-mobile-dialog">
          <DialogTitle className="sr-only">管理导航</DialogTitle>
          {sidebar(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
