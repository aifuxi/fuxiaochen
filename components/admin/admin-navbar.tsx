"use client";

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import NiceModal from "@ebay/nice-modal-react";
import { Bell, ExternalLink, Search } from "lucide-react";
import useSWR from "swr";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";

import { AdminChangePasswordDialog } from "@/components/admin/admin-change-password-dialog";
import { showAdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";
import { ThemeToggle } from "@/components/theme-toggle";

import { apiRequest, buildApiUrl, fetchApiData } from "@/lib/api/fetcher";
import { authClient } from "@/lib/auth-client";
import type {
  AdminNotification,
  AdminNotificationListPayload,
} from "@/lib/server/notifications/mappers";

import { routes } from "@/constants/routes";

type AdminNavbarProps = {
  user: {
    email: string;
    image?: string | null;
    name: string;
  };
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const notificationActionLabels = {
  created: "新增",
  deleted: "删除",
  updated: "更新",
} satisfies Record<AdminNotification["action"], string>;

const notificationTypeLabels = {
  content: "内容",
  interaction: "互动",
  system: "系统",
  user: "用户",
} satisfies Record<AdminNotification["type"], string>;

const formatNotificationTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "刚刚";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);

  if (diffInMinutes < 60) {
    return `${diffInMinutes} 分钟前`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);

  if (diffInHours < 24) {
    return `${diffInHours} 小时前`;
  }

  return date.toLocaleDateString("zh-CN", {
    day: "2-digit",
    month: "2-digit",
  });
};

export function AdminNavbar({ user }: AdminNavbarProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState<
    string | null
  >(null);
  const notificationsUrl = buildApiUrl("/api/admin/notifications", {
    pageSize: 8,
  });
  const {
    data: notificationsData,
    error: notificationsError,
    isLoading: isNotificationsLoading,
    mutate: mutateNotifications,
  } = useSWR<AdminNotificationListPayload>(notificationsUrl, fetchApiData, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });

  const notifications = notificationsData?.items ?? [];
  const unreadCount = notificationsData?.unreadCount ?? 0;

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      router.replace(routes.auth.login);
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  function confirmSignOut() {
    void showAdminConfirmDialog({
      title: "确认退出登录？",
      description: "退出后需要重新登录才能继续访问后台管理功能。",
      confirmLabel: "确认退出",
      confirmingLabel: "正在退出...",
      onConfirm: handleSignOut,
    });
  }

  function openChangePasswordDialog() {
    void NiceModal.show(AdminChangePasswordDialog);
  }

  async function handleNotificationClick(notification: AdminNotification) {
    if (markingNotificationId) {
      return;
    }

    try {
      if (!notification.readAt) {
        setMarkingNotificationId(notification.id);
        await apiRequest<AdminNotification>(
          `/api/admin/notifications/${notification.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ read: true }),
            errorFallback: "通知状态更新失败",
          },
        );
        await mutateNotifications();
      }

      if (notification.href) {
        router.push(notification.href);
      }
    } catch {
      // The global API error listener owns toast display.
    } finally {
      setMarkingNotificationId(null);
    }
  }

  async function markAllNotificationsRead() {
    if (unreadCount === 0 || isMarkingAllRead) {
      return;
    }

    setIsMarkingAllRead(true);

    try {
      await apiRequest<{ updatedCount: number }>(
        "/api/admin/notifications/read-all",
        {
          method: "POST",
          errorFallback: "全部标记已读失败",
        },
      );
      await mutateNotifications();
    } finally {
      setIsMarkingAllRead(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索文章、分类..."
            className="w-64 bg-muted/50 pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link
            href={routes.site.home}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <span className="hidden sm:inline">查看站点</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>

        <ThemeToggle />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute top-1 right-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-medium text-destructive-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
              <span className="sr-only">通知</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-88 p-0">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-medium">消息通知</p>
                <p className="text-xs text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} 条未读` : "暂无未读消息"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsRead}
                disabled={unreadCount === 0 || isMarkingAllRead}
              >
                {isMarkingAllRead ? <Spinner data-icon="inline-start" /> : null}
                全部已读
              </Button>
            </div>
            {isNotificationsLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
                <Spinner />
                正在加载通知
              </div>
            ) : notificationsError ? (
              <div className="space-y-3 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">通知加载失败</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void mutateNotifications()}
                >
                  重试
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                暂无通知
              </div>
            ) : (
              <ScrollArea className="max-h-96">
                <div className="p-1">
                  {notifications.map((notification) => {
                    const isUnread = !notification.readAt;

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        disabled={markingNotificationId !== null}
                        className="flex w-full gap-3 rounded-sm px-3 py-3 text-left transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:outline-hidden"
                        onClick={() =>
                          void handleNotificationClick(notification)
                        }
                      >
                        {markingNotificationId === notification.id ? (
                          <Spinner className="mt-0.5" />
                        ) : (
                          <span
                            className={`mt-1.5 size-2 shrink-0 rounded-full ${
                              isUnread ? "bg-destructive" : "bg-muted"
                            }`}
                          />
                        )}
                        <span className="min-w-0 flex-1 space-y-1">
                          <span className="flex items-center justify-between gap-3">
                            <span className="truncate text-sm font-medium">
                              {notification.title}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                          </span>
                          <span className="line-clamp-2 text-xs text-muted-foreground">
                            {notification.description}
                          </span>
                          <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span>
                              {notificationTypeLabels[notification.type]}
                            </span>
                            <span>·</span>
                            <span>
                              {notificationActionLabels[notification.action]}
                            </span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>个人资料</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                openChangePasswordDialog();
              }}
            >
              修改密码
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={routes.admin.settings}>设置</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={confirmSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? <Spinner data-icon="inline-start" /> : null}
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
