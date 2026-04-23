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
  credential: "Credentials",
  email: "Email",
  github: "GitHub",
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Never";
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
        Admin
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      <UserRound className="mr-1 size-3" />
      User
    </Badge>
  );
}

function getEmailVerifiedBadge(emailVerified: boolean) {
  if (emailVerified) {
    return (
      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
        <CheckCircle2 className="mr-1 size-3" />
        Verified
      </Badge>
    );
  }

  return <Badge variant="outline">Unverified</Badge>;
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
      });
      await Promise.all([mutate(), mutateSelectedUser()]);
    } catch (actionError) {
      setPageError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to update user role",
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
      });
      await Promise.all([mutate(), mutateSelectedUser()]);
    } catch (actionError) {
      setPageError(
        actionError instanceof Error
          ? actionError.message
          : "Failed to revoke user sessions",
      );
    } finally {
      setIsRevokingSessions(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage admin access, account metadata, and active sessions.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserRound className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Standard Users
            </CardTitle>
            <UserRound className="size-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Emails
            </CardTitle>
            <CheckCircle2 className="size-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search name or email..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
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
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created At</SelectItem>
                  <SelectItem value="updatedAt">Updated At</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortDirection}
                onValueChange={(value) =>
                  setSortDirection(value as "asc" | "desc")
                }
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {pageError ? (
            <div className="border-destructive/30 bg-destructive/5 text-destructive mb-6 rounded-lg border px-4 py-3 text-sm">
              {pageError}
            </div>
          ) : null}

          <div className="border-border rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Providers</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="text-muted-foreground inline-flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && error ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-destructive py-12 text-center"
                    >
                      {error.message}
                    </TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && !error && users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="text-muted-foreground space-y-1">
                        <p className="font-medium">No users found</p>
                        <p className="text-sm">
                          Try adjusting the search or role filter.
                        </p>
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
                                    <Badge variant="outline">You</Badge>
                                  ) : null}
                                </div>
                                <p className="text-muted-foreground text-sm">
                                  {user.emailVerified
                                    ? "Email verified"
                                    : "Email unverified"}
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
                                <span className="text-muted-foreground text-sm">
                                  No linked providers
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
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openUserDetails(user.id)}
                                >
                                  <Eye className="mr-2 size-4" />
                                  View Details
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
                                    ? "Promote to Admin"
                                    : "Change to User"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  disabled={isBusy || isCurrentAdmin}
                                  className="text-destructive"
                                  onClick={() => revokeUserSessions(user.id)}
                                >
                                  {isRevokingSessions === user.id ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                  ) : (
                                    <UserRoundX className="mr-2 size-4" />
                                  )}
                                  Revoke Sessions
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
            <p className="text-muted-foreground text-sm">
              Showing {from}-{to} of {total} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                Next
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
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>
              Review account metadata, providers, and active sessions.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {selectedUserId && isDetailLoading ? (
              <div className="text-muted-foreground flex h-full min-h-48 items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Loading user details...
              </div>
            ) : null}
            {selectedUserId && !isDetailLoading && detailError ? (
              <div className="text-destructive flex h-full min-h-48 items-center justify-center text-sm">
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
                        <Badge variant="outline">Current Admin</Badge>
                      ) : null}
                      {getRoleBadge(selectedUserSummary.role)}
                      {getEmailVerifiedBadge(selectedUserSummary.emailVerified)}
                    </div>
                    <p className="text-muted-foreground text-sm break-all">
                      {selectedUserSummary.email}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <p className="text-muted-foreground text-sm">Created At</p>
                    <p className="mt-1 font-medium">
                      {formatDateTime(selectedUserSummary.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-muted-foreground text-sm">Updated At</p>
                    <p className="mt-1 font-medium">
                      {formatDateTime(selectedUserSummary.updatedAt)}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-muted-foreground text-sm">
                      Active Sessions
                    </p>
                    <p className="mt-1 font-medium">
                      {selectedUserSummary.sessionCount}
                    </p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-muted-foreground text-sm">
                      Most Recent Session
                    </p>
                    <p className="mt-1 font-medium">
                      {formatDateTime(selectedUserSummary.lastSessionAt)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm font-medium">Linked Providers</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUserSummary.linkedProviders.length > 0 ? (
                      selectedUserSummary.linkedProviders.map((providerId) => (
                        <Badge key={providerId} variant="outline">
                          {getProviderLabel(providerId)}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No linked providers found.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-sm font-medium">Actions</p>
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
                        ? "Change to User"
                        : "Promote to Admin"}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={
                        isRevokingSessions === selectedUserSummary.id ||
                        selectedUserSummary.id === currentAdminId
                      }
                      onClick={() => revokeUserSessions(selectedUserSummary.id)}
                    >
                      {isRevokingSessions === selectedUserSummary.id ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <UserRoundX className="mr-2 size-4" />
                      )}
                      Revoke All Sessions
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
