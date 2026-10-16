"use client";

import {
  Database,
  Bell,
  Clock3,
  FileText,
  Link2,
  Menu,
  Settings,
  Tags,
  X,
  Globe2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactElement, type ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { useTheme } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type AdminPanel = "notifications" | "backup" | "compose" | "profile";

type Props = {
  children: ReactNode;
  unreadCount: number | null;
  notificationError: string;
  onOpen: (panel: AdminPanel, returnFocus?: HTMLElement | null) => void;
  writingFocused: boolean;
  postPending: boolean;
};

const navGroups = [
  {
    name: "内容",
    items: [
      { name: "文章管理", shortName: "文章", icon: FileText, href: "/admin/posts" },
      { name: "分类与标签", shortName: "分类", icon: Tags, href: "/admin/categories" },
      { name: "更新日志", shortName: "日志", icon: Clock3, href: "/admin/changelog" },
    ],
  },
  {
    name: "互动",
    items: [{ name: "友情链接", shortName: "友链", icon: Link2, href: "/admin/friends-links" }],
  },
  {
    name: "系统",
    items: [
      { name: "系统设置", shortName: "设置", icon: Settings, href: "/admin/settings" },
      { name: "备份管理", shortName: "备份", icon: Database, href: "/admin/backups" },
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
  const mobilePanel = useRef<"notifications" | "profile" | null>(null);
  const mobileMenuButton = useRef<HTMLButtonElement | null>(null);
  const { theme } = useTheme();
  const themeLabel = theme === "dark" ? "切换到浅色模式" : "切换到深色模式";
  const notificationLabel = notificationError
    ? "通知读取失败，打开后重试"
    : `通知，${unreadCount ?? "未知数量"} 条未读`;

  const openUtility = (
    panel: "notifications" | "profile",
    mobile: boolean,
    trigger: HTMLElement,
  ) => {
    if (postPending) return;
    if (mobile) {
      // 等抽屉关闭并恢复焦点后再打开业务弹窗，关闭后能回到悬浮导航按钮。
      mobilePanel.current = panel;
      setMobileOpen(false);
    } else onOpen(panel, trigger);
  };

  const utilities = (mobile: boolean) => {
    const toggle = <ThemeToggle className="admin-utility-button" showLabel={mobile} title="" />;
    const notifications = (
      <Button
        size="compact"
        variant="ghost"
        className="admin-utility-button"
        disabled={postPending}
        aria-haspopup="dialog"
        aria-label={notificationLabel}
        onClick={(event) => openUtility("notifications", mobile, event.currentTarget)}
      >
        <Bell size={20} aria-hidden="true" />
        {mobile && <span>通知</span>}
        {(notificationError || unreadCount === null || unreadCount > 0) && (
          <span className="admin-notification-count" aria-hidden="true">
            {notificationError
              ? "!"
              : unreadCount === null
                ? "—"
                : unreadCount > 99
                  ? "99+"
                  : unreadCount}
          </span>
        )}
      </Button>
    );
    const profile = (
      <Button
        size="compact"
        variant="ghost"
        className="admin-utility-button admin-profile"
        aria-haspopup="dialog"
        aria-label="账户菜单"
        disabled={postPending}
        onClick={(event) => openUtility("profile", mobile, event.currentTarget)}
      >
        <Image src="/avatar.avif" width={28} height={28} alt="" />
        {mobile && <span>管理账户</span>}
      </Button>
    );
    return (
      <fieldset className="admin-utility-actions">
        <legend className="sr-only">全局操作</legend>
        {mobile ? toggle : <DockHint label={themeLabel}>{toggle}</DockHint>}
        {mobile ? notifications : <DockHint label={notificationLabel}>{notifications}</DockHint>}
        {mobile ? profile : <DockHint label="管理账户">{profile}</DockHint>}
      </fieldset>
    );
  };

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
      <div className="admin-dock-navigation">
        <div className="admin-brand">
          {mobile ? (
            <BrandLogo className="admin-brand-logo" />
          ) : (
            <DockHint label="前往网站首页">
              <Link
                href="/"
                className="admin-dock-home"
                aria-label="前往网站首页"
                aria-disabled={postPending || undefined}
                onClick={(event) => {
                  if (postPending) event.preventDefault();
                }}
              >
                <BrandLogo className="admin-brand-logo" />
              </Link>
            </DockHint>
          )}
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
                    {mobile ? (
                      <span>{item.name}</span>
                    ) : (
                      <span className="admin-dock-label" aria-hidden="true">
                        {item.shortName}
                      </span>
                    )}
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
        {mobile && frontLink(true)}
        {utilities(mobile)}
      </div>
    </div>
  );

  return (
    <div className={`admin-layout ${writingFocused ? "admin-layout-writing" : ""}`}>
      <aside className="admin-sidebar" aria-label="侧边栏">
        <TooltipProvider delay={250}>{sidebar(false)}</TooltipProvider>
      </aside>
      <div className="admin-main-column">
        <main data-page-motion className="admin-content">
          {children}
        </main>
        <footer className="admin-footer">
          <span>© 付小晨</span>
        </footer>
      </div>
      <Button
        size="compact"
        variant="ghost"
        className="admin-menu-button"
        ref={mobileMenuButton}
        aria-label="打开导航"
        aria-haspopup="dialog"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} aria-hidden="true" />
      </Button>
      <Dialog
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        onOpenChangeComplete={(open) => {
          if (!open && mobilePanel.current) {
            const panel = mobilePanel.current;
            mobilePanel.current = null;
            onOpen(panel, mobileMenuButton.current);
          }
        }}
      >
        <DialogContent className="admin-mobile-dialog" finalFocus={mobileMenuButton}>
          <DialogTitle className="sr-only">管理导航</DialogTitle>
          {sidebar(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
}
