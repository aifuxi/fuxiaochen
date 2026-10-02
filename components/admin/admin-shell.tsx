"use client";

import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  ImageIcon,
  Link2,
  Menu,
  MessageCircle,
  Plus,
  Search,
  Settings,
  Tags,
  Users,
  X,
  Globe2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export type AdminPanel =
  | "search"
  | "compose"
  | "notifications"
  | "profile"
  | "comments"
  | "upload"
  | "categories"
  | "analytics"
  | "schedule";

type Props = {
  children: ReactNode;
  pendingCount: number | null;
  unreadCount: number;
  onOpen: (panel: AdminPanel) => void;
};

const nav = [
  { name: "仪表盘", icon: Home, href: "/admin" },
  { name: "内容管理", icon: FileText, href: "/admin/posts" },
  { name: "评论管理", icon: MessageCircle, href: "/admin/comments" },
  { name: "媒体库", icon: ImageIcon, href: "/admin/media" },
  { name: "分类与标签", icon: Tags, href: "/admin/categories" },
  { name: "数据分析", icon: BarChart3, href: "/admin/analytics" },
  { name: "访客日志", icon: Users, href: "/admin/visitors" },
  { name: "友情链接", icon: Link2, href: "/admin/friends-links" },
  { name: "更新日志", icon: Clock3, href: "/admin/changelog" },
  { name: "系统设置", icon: Settings, href: "/admin/settings" },
];

export function AdminShell({ children, pendingCount, unreadCount, onOpen }: Props) {
  const pathname = usePathname();
  const workspacePage =
    pathname === "/admin/posts" ||
    pathname === "/admin/settings" ||
    pathname === "/admin/comments" ||
    pathname === "/admin/friends-links" ||
    pathname === "/admin/visitors" ||
    pathname === "/admin/media" ||
    pathname === "/admin/changelog";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen("search");
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [onOpen]);

  const sidebar = (mobile: boolean) => (
    <div className="admin-sidebar-inner">
      <div>
        <div className="admin-brand">
          <Image src="/logo.svg" width={32} height={32} alt="" className="admin-brand-logo" />
          {(!collapsed || mobile) && (
            <span className="admin-brand-name">
              fuxiaochen <small>管理空间</small>
            </span>
          )}
          {mobile && (
            <Button
              variant="ghost"
              size="sm"
              className="admin-mobile-close"
              aria-label="关闭导航"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </Button>
          )}
        </div>
        <nav className="admin-nav" aria-label="管理导航">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const content = (
              <>
                <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                {(!collapsed || mobile) && <span>{item.name}</span>}
                {item.name === "评论管理" && (pendingCount ?? 0) > 0 && (!collapsed || mobile) && (
                  <span className="admin-nav-badge">{pendingCount}</span>
                )}
              </>
            );
            const sharedProps = {
              className: `admin-nav-item ${active ? "is-active" : ""}`,
              "aria-label": item.name,
              title: collapsed && !mobile ? item.name : undefined,
            };
            return (
              <Link
                key={item.name}
                href={item.href}
                {...sharedProps}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="admin-sidebar-bottom">
        <Link href="/" className="admin-front-link" title="前往网站首页">
          <Globe2 size={16} aria-hidden="true" />
          {(!collapsed || mobile) && <span>前往网站首页</span>}
        </Link>
        {!mobile && (
          <Button
            size="sm"
            variant="ghost"
            className="admin-collapse"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {collapsed ? (
              <ChevronRight size={17} />
            ) : (
              <>
                <ChevronLeft size={17} />
                <span>收起侧边栏</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`admin-layout ${collapsed ? "admin-layout-collapsed" : ""} ${workspacePage ? "admin-layout-workspace" : ""}`}
    >
      <aside className="admin-sidebar" aria-label="侧边栏">
        {sidebar(false)}
      </aside>
      <div className="admin-main-column">
        <header className="admin-topbar">
          <div className="admin-topbar-start">
            <Button
              size="sm"
              variant="ghost"
              className="admin-menu-button"
              aria-label="打开导航"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </Button>
            <Button
              variant="ghost"
              size="compact"
              className="admin-search-trigger"
              type="button"
              aria-label="搜索文章或分类"
              aria-haspopup="dialog"
              aria-keyshortcuts="Meta+K Control+K"
              onClick={() => onOpen("search")}
            >
              <Search size={16} aria-hidden="true" />
              <span>搜索文章 / 分类…</span>
              <kbd aria-hidden="true">⌘K</kbd>
            </Button>
          </div>
          <div className="admin-topbar-actions">
            <Button
              size={workspacePage ? "compact" : "sm"}
              variant={workspacePage ? "secondary" : "primary"}
              className="admin-create"
              onClick={() => onOpen("compose")}
            >
              <Plus size={16} aria-hidden="true" />
              <span>新建文章</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="admin-icon-button"
              aria-label={`通知，${unreadCount} 条未读`}
              onClick={() => onOpen("notifications")}
            >
              <Bell size={18} aria-hidden="true" />
              {unreadCount > 0 && <span className="admin-count">{unreadCount}</span>}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="admin-profile"
              onClick={() => onOpen("profile")}
              aria-label="账户菜单"
            >
              <Image src="/avatar.avif" width={30} height={30} alt="" />
              <span>管理账户</span>
            </Button>
          </div>
        </header>
        <main className="admin-content">{children}</main>
        <footer className="admin-footer">
          <span>© fuxiaochen · 演示数据</span>
          <span>管理空间 / 001</span>
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
