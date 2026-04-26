"use client";

import { useDeferredValue, useEffect, useState } from "react";

import {
  CheckCircle2,
  Eye,
  Loader2,
  MoreHorizontal,
  Search,
  Shield,
  ShieldCheck,
  UserRound,
  UserRoundX,
} from "lucide-react";
import useSWR from "swr";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { showAdminConfirmDialog } from "@/components/admin/admin-confirm-dialog";

import { apiRequest, buildApiUrl, fetchApiData } from "@/lib/api/fetcher";
import type {
  AdminUserDetail,
  AdminUserListItem,
  AdminUserSummaryStats,
} from "@/lib/server/users/mappers";

type AdminUsersPageProps = {
  currentAdminId: string;
};

type UsersListPayload = {
  items: AdminUserListItem[];
  stats: AdminUserSummaryStats;
};

type UsersListMeta = {
  page: number;
  pageSize: number;
  total: number;
};

const EMPTY_STATS: AdminUserSummaryStats = {
  total: 0,
  admins: 0,
  users: 0,
  verified: 0,
};

const PAGE_SIZE = 20;

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const providerLabelMap: Record<string, string> = {
  credential: "凭证",
  email: "邮箱",
  github: "GitHub 账号",
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "从未";
  }

  return dateTimeFormatter.format(new Date(value));
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getProviderLabel(providerId: string) {
  return providerLabelMap[providerId] ?? providerId;
}

function getRoleBadge(role: AdminUserListItem["role"]) {
  if (role === "admin") {
    return (
      <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">
        <ShieldCheck className="mr-1 size-3" />
        管理员
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      <UserRound className="mr-1 size-3" />
      普通用户
    </Badge>
  );
}

function getEmailVerifiedBadge(emailVerified: boolean) {
  if (emailVerified) {
    return (
      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
        <CheckCircle2 className="mr-1 size-3" />
        已验证
      </Badge>
    );
  }

  return <Badge variant="outline">未验证</Badge>;
}

export function AdminUsersPage({ currentAdminId }: AdminUsersPageProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "updatedAt" | "name" | "email"
  >("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isRoleUpdating, setIsRoleUpdating] = useState<string | null>(null);
  const [isRevokingSessions, setIsRevokingSessions] = useState<string | null>(
    null,
  );
  const [pageError, setPageError] = useState<string | null>(null);

  const deferredSearchQuery = useDeferredValue(searchQuery.trim());
  const usersUrl = buildApiUrl("/api/admin/users", {
    page,
    pageSize: PAGE_SIZE,
    query: deferredSearchQuery || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
    sortBy,
    sortDirection,
  });

  useEffect(() => {
    setPage(1);
  }, [deferredSearchQuery, roleFilter, sortBy, sortDirection]);

  const { data, error, isLoading, mutate } = useSWR<{
    data: UsersListPayload;
    meta: UsersListMeta;
  }>(
    usersUrl,
    (url: string) =>
      apiRequest<UsersListPayload, UsersListMeta>(url) as Promise<{
        data: UsersListPayload;
        meta: UsersListMeta;
      }>,
    {
      revalidateOnFocus: false,
    },
  );

  const detailUrl = selectedUserId
    ? `/api/admin/users/${selectedUserId}`
    : null;
  const {
    data: selectedUser,
    error: detailError,
    isLoading: isDetailLoading,
    mutate: mutateSelectedUser,
  } = useSWR<AdminUserDetail>(
    detailUrl,
    detailUrl ? fetchApiData<AdminUserDetail> : null,
    {
      revalidateOnFocus: false,
    },
  );

  const users = data?.data.items ?? [];
  const stats = data?.data.stats ?? EMPTY_STATS;
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / PAGE_SIZE) : 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  const selectedListUser =
    users.find((user) => user.id === selectedUserId) ?? null;

  const selectedUserSummary = selectedUser ?? selectedListUser;

  const handleSheetOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedUserId(null);
    }
  };

  const openUserDetails = (id: string) => {
    setSelectedUserId(id);
    setPageError(null);
  };

  const updateUserRole = async (
    user: AdminUserListItem,
    nextRole: AdminUserListItem["role"],
  ) => {
    setPageError(null);
    setIsRoleUpdating(user.id);

    try {
      await apiRequest(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: nextRole,
        }),
        toastOnError: false,
      });
      await Promise.all([mutate(), mutateSelectedUser()]);
    } catch (actionError) {
      setPageError(
        actionError instanceof Error ? actionError.message : "更新用户角色失败",
      );
    } finally {
      setIsRoleUpdating(null);
    }
  };

  const revokeUserSessions = async (userId: string) => {
    setPageError(null);
    setIsRevokingSessions(userId);

    try {
      await apiRequest(`/api/admin/users/${userId}/sessions`, {
        method: "DELETE",
        toastOnError: false,
      });
      await Promise.all([mutate(), mutateSelectedUser()]);
    } catch (actionError) {
      setPageError(
        actionError instanceof Error ? actionError.message : "撤销用户会话失败",
      );
    } finally {
      setIsRevokingSessions(null);
    }
  };

  const confirmRevokeUserSessions = (
    user: Pick<AdminUserListItem, "id" | "name">,
  ) => {
    void showAdminConfirmDialog({
      title: "确认撤销这个用户的会话？",
      description: `将撤销「${user.name}」的全部活跃会话，对方需要重新登录。此操作无法撤销。`,
      confirmLabel: "确认撤销",
      onConfirm: () => revokeUserSessions(user.id),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">用户</h1>
          <p className="text-muted-foreground">
            管理管理员授权、账号信息与活跃会话。
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">全部用户</CardTitle>
            <UserRound className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">管理员</CardTitle>
            <Shield className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">普通用户</CardTitle>
            <UserRound className="size-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">已验证邮箱</CardTitle>
            <CheckCircle2 className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户目录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名或邮箱..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                  <SelectItem value="user">普通用户</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(
                    value as "createdAt" | "updatedAt" | "name" | "email",
                  )
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="排序字段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">创建时间</SelectItem>
                  <SelectItem value="updatedAt">更新时间</SelectItem>
                  <SelectItem value="name">姓名</SelectItem>
                  <SelectItem value="email">邮箱</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortDirection}
                onValueChange={(value) =>
                  setSortDirection(value as "asc" | "desc")
                }
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="排序方向" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">降序</SelectItem>
                  <SelectItem value="asc">升序</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {pageError ? (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {pageError}
            </div>
          ) : null}

          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>验证状态</TableHead>
                  <TableHead>登录方式</TableHead>
                  <TableHead>会话</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="inline-flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        正在加载用户...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && error ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-12 text-center text-destructive"
                    >
                      {error.message}
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && !error && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="space-y-1 text-muted-foreground">
                        <p className="font-medium">未找到用户</p>
                        <p className="text-sm">请调整搜索或角色筛选条件。</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && !error
                  ? users.map((user) => {
                      const isCurrentAdmin = user.id === currentAdminId;
                      const isBusy =
                        isRoleUpdating === user.id ||
                        isRevokingSessions === user.id;
                      const nextRole = user.role === "admin" ? "user" : "admin";

                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <button
                              type="button"
                              className="flex items-center gap-3 text-left"
                              onClick={() => openUserDetails(user.id)}
                            >
                              <Avatar className="size-9">
                                <AvatarImage
                                  src={user.image ?? undefined}
                                  alt={user.name}
                                />
                                <AvatarFallback>
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{user.name}</p>
                                  {isCurrentAdmin ? (
                                    <Badge variant="outline">当前用户</Badge>
                                  ) : null}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {user.emailVerified
                                    ? "邮箱已验证"
                                    : "邮箱未验证"}
                                </p>
                              </div>
                            </button>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.email}
                          </TableCell>
                          <TableCell>
                            {getEmailVerifiedBadge(user.emailVerified)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {user.linkedProviders.length > 0 ? (
                                user.linkedProviders.map((providerId) => (
                                  <Badge key={providerId} variant="outline">
                                    {getProviderLabel(providerId)}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  暂无绑定登录方式
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {user.sessionCount}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDateTime(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="size-4" />
                                  <span className="sr-only">操作</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openUserDetails(user.id)}
                                >
                                  <Eye className="mr-2 size-4" />
                                  查看详情
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  disabled={
                                    isBusy ||
                                    (isCurrentAdmin && nextRole === "user")
                                  }
                                  onClick={() => updateUserRole(user, nextRole)}
                                >
                                  {isRoleUpdating === user.id ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                  ) : (
                                    <Shield className="mr-2 size-4" />
                                  )}
                                  {nextRole === "admin"
                                    ? "设为管理员"
                                    : "设为普通用户"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  disabled={isBusy || isCurrentAdmin}
                                  className="text-destructive"
                                  onClick={() =>
                                    confirmRevokeUserSessions(user)
                                  }
                                >
                                  {isRevokingSessions === user.id ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                  ) : (
                                    <UserRoundX className="mr-2 size-4" />
                                  )}
                                  撤销会话
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  : null}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              显示 {from}-{to} / {total} 位用户
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={selectedUserId !== null}
        onOpenChange={handleSheetOpenChange}
      >
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>用户详情</SheetTitle>
            <SheetDescription>
              查看账号信息、绑定登录方式和活跃会话。
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {selectedUserId && isDetailLoading ? (
              <div className="flex h-full min-h-48 items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                正在加载用户详情...
              </div>
            ) : null}
            {selectedUserId && !isDetailLoading && detailError ? (
              <div className="flex h-full min-h-48 items-center justify-center text-sm text-destructive">
                {detailError.message}
              </div>
            ) : null}
            {selectedUserSummary ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4 rounded-xl border p-4">
                  <Avatar className="size-14">
                    <AvatarImage
                      src={selectedUserSummary.image ?? undefined}
                      alt={selectedUserSummary.name}
                    />
                    <AvatarFallback>
                      {getInitials(selectedUserSummary.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">
                        {selectedUserSummary.name}
                      </h2>
                      {selectedUserSummary.id === currentAdminId ? (
                        <Badge variant="outline">当前管理员</Badge>
                      ) : null}
                      {getRoleBadge(selectedUserSummary.role)}
                      {getEmailVerifiedBadge(selectedUserSummary.emailVerified)}
                    </div>
                    <p className="text-sm break-all text-muted-foreground">
                      {selectedUserSummary.email}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">创建时间</p>
                    <p className="mt-1 font-medium">
                      {formatDateTime(selectedUserSummary.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">更新时间</p>
                    <p className="mt-1 font-medium">
                      {formatDateTime(selectedUserSummary.updatedAt)}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">活跃会话</p>
                    <p className="mt-1 font-medium">
                      {selectedUserSummary.sessionCount}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-sm text-muted-foreground">最近会话</p>
                    <p className="mt-1 font-medium">
                      {formatDateTime(selectedUserSummary.lastSessionAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm font-medium">绑定登录方式</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUserSummary.linkedProviders.length > 0 ? (
                      selectedUserSummary.linkedProviders.map((providerId) => (
                        <Badge key={providerId} variant="outline">
                          {getProviderLabel(providerId)}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        暂无绑定登录方式
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm font-medium">操作</p>
                  <div className="mt-4 flex flex-col gap-3">
                    <Button
                      variant="outline"
                      disabled={
                        isRoleUpdating === selectedUserSummary.id ||
                        (selectedUserSummary.id === currentAdminId &&
                          selectedUserSummary.role === "admin")
                      }
                      onClick={() =>
                        updateUserRole(
                          selectedUserSummary,
                          selectedUserSummary.role === "admin"
                            ? "user"
                            : "admin",
                        )
                      }
                    >
                      {isRoleUpdating === selectedUserSummary.id ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Shield className="mr-2 size-4" />
                      )}
                      {selectedUserSummary.role === "admin"
                        ? "设为普通用户"
                        : "设为管理员"}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={
                        isRevokingSessions === selectedUserSummary.id ||
                        selectedUserSummary.id === currentAdminId
                      }
                      onClick={() =>
                        confirmRevokeUserSessions(selectedUserSummary)
                      }
                    >
                      {isRevokingSessions === selectedUserSummary.id ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <UserRoundX className="mr-2 size-4" />
                      )}
                      撤销全部会话
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
