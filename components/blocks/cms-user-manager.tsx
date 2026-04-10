"use client";

import NiceModal from "@ebay/nice-modal-react";
import { format } from "date-fns";
import { MailCheck, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, Users } from "lucide-react";
import React from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";

import { UserDeleteDialog } from "@/components/modals/user-delete-dialog";
import { UserFormDialog } from "@/components/modals/user-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRoot, TableRow } from "@/components/ui/table";
import {
  createUser,
  deleteUser,
  listUsers,
  type ListUsersResult,
  type UserApiError,
  updateUser,
} from "@/lib/user/user-client";
import type { CreateUserInput, UpdateUserInput, UserDto } from "@/lib/user/user-dto";
import { userRoleOptions, type UserRole } from "@/lib/user/user-role";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_DELAY = 300;

export function CmsUserManager() {
  const [page, setPage] = React.useState(1);
  const [role, setRole] = React.useState<"" | UserRole>("");
  const [searchValue, setSearchValue] = React.useState("");
  const [keyword, setKeyword] = React.useState("");

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setKeyword(searchValue.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_DELAY);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchValue]);

  const query = React.useMemo(
    () => ({
      keyword: keyword || undefined,
      page,
      pageSize: PAGE_SIZE,
      role: role || undefined,
    }),
    [keyword, page, role],
  );

  const { data, error, isLoading, isValidating, mutate } = useSWR<ListUsersResult, UserApiError>(
    ["users", query.keyword ?? "", query.role ?? "", query.page, query.pageSize],
    () => listUsers(query),
    {
      keepPreviousData: true,
    },
  );

  const createMutation = useSWRMutation("create-user", (_key, { arg }: { arg: CreateUserInput }) => createUser(arg));
  const updateMutation = useSWRMutation(
    "update-user",
    (_key, { arg }: { arg: { id: string; input: UpdateUserInput } }) => updateUser(arg.id, arg.input),
  );
  const deleteMutation = useSWRMutation("delete-user", (_key, { arg }: { arg: { id: string } }) => deleteUser(arg.id));

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(data?.totalPages ?? 1, 1);
  const visiblePages = getVisiblePages(page, totalPages);
  const isMutating = createMutation.isMutating || updateMutation.isMutating || deleteMutation.isMutating;
  const verifiedVisibleCount = users.filter((user) => user.emailVerified).length;
  const visibleSessionCount = users.reduce((totalSessions, user) => totalSessions + user.sessionCount, 0);

  React.useEffect(() => {
    if (!data) {
      return;
    }

    if (page > data.totalPages && data.totalPages > 0) {
      setPage(data.totalPages);
    }
  }, [data, page]);

  async function handleCreate(input: CreateUserInput) {
    await createMutation.trigger(input);
    toast.success("User created successfully.");
    await mutate();
  }

  async function handleUpdate(id: string, input: UpdateUserInput) {
    await updateMutation.trigger({
      id,
      input,
    });
    toast.success("User updated successfully.");
    await mutate();
  }

  async function handleDelete(user: UserDto) {
    await deleteMutation.trigger({
      id: user.id,
    });
    toast.success(`Deleted ${user.name}.`);

    const nextTotal = Math.max(total - 1, 0);
    const nextTotalPages = Math.max(Math.ceil(nextTotal / PAGE_SIZE), 1);

    if (page > nextTotalPages) {
      setPage(nextTotalPages);

      return;
    }

    await mutate();
  }

  function openCreateDialog() {
    void NiceModal.show(UserFormDialog, {
      mode: "create",
      onSubmit: handleCreate,
    });
  }

  function openDeleteDialog(user: UserDto) {
    void NiceModal.show(UserDeleteDialog, {
      onConfirm: () => handleDelete(user),
      user,
    });
  }

  function openEditDialog(user: UserDto) {
    void NiceModal.show(UserFormDialog, {
      mode: "edit",
      onSubmit: (input: UpdateUserInput) => handleUpdate(user.id, input),
      user,
    });
  }

  return (
    <div className="space-y-6">
      <div className={`
        flex flex-col gap-4
        lg:flex-row lg:items-center lg:justify-between
      `}>
        <div className={`
          flex flex-1 flex-col gap-3
          sm:flex-row sm:items-center
        `}>
          <div className="w-full max-w-md">
            <Input
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by user name or email"
              startAdornment={<Search className="size-4" />}
              value={searchValue}
            />
          </div>
          <div className="w-full max-w-56">
            <Select
              onValueChange={(value) => {
                setRole(value as "" | UserRole);
                setPage(1);
              }}
              options={[
                {
                  label: "All Roles",
                  value: "",
                },
                ...userRoleOptions,
              ]}
              value={role}
            />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Badge variant="muted">{total} users</Badge>
            {isValidating && !isLoading ? <span className="inline-flex items-center gap-2"><RefreshCw className={`
              size-3 animate-spin
            `} /> Refreshing</span> : null}
          </div>
        </div>

        <Button disabled={isMutating} onClick={openCreateDialog} variant="primary">
          <Plus className="size-4" />
          Add User
        </Button>
      </div>

      <div className={`
        grid gap-4
        sm:grid-cols-3
      `}>
        <MetricCard label="Total Users" value={String(total)} />
        <MetricCard label="Verified On Page" value={String(verifiedVisibleCount)} />
        <MetricCard label="Active Sessions" value={String(visibleSessionCount)} />
      </div>

      <Table>
        <TableRoot>
          <TableHead>
            <tr>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Verification</TableHeaderCell>
              <TableHeaderCell>Linked Auth</TableHeaderCell>
              <TableHeaderCell>Sessions</TableHeaderCell>
              <TableHeaderCell>Updated</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7}>
                    <div className="h-14 animate-pulse rounded-xl bg-white/5" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell className="py-10" colSpan={7}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <p className="max-w-md text-sm text-muted">{error.message || "Failed to load users."}</p>
                    <Button onClick={() => void mutate()} variant="outline">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell className="py-12" colSpan={7}>
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className={`
                      flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4 text-muted
                    `}>
                      <Users className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base text-foreground">{keyword ? "No users match this search." : "No users yet."}</p>
                      <p className="text-sm text-muted">
                        {keyword
                          ? "Try a different keyword or clear the search."
                          : "Create the first CMS user to manage editorial access."}
                      </p>
                    </div>
                    {!keyword ? (
                      <Button onClick={openCreateDialog} variant="outline">
                        <Plus className="size-4" />
                        Create User
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className={`
                        flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/6
                        font-mono text-xs tracking-[0.18em] text-foreground uppercase
                      `}>
                        {getInitials(user.name)}
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Admin" ? "destructive" : "info"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.emailVerified ? "success" : "warning"}>
                      {user.emailVerified ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <ShieldCheck className="size-4 text-primary" />
                      <span>{user.accountCount} linked</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <MailCheck className="size-4 text-emerald-300" />
                      <span>{user.sessionCount} active</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted">{format(new Date(user.updatedAt), "yyyy-MM-dd HH:mm")}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button disabled={isMutating} onClick={() => openEditDialog(user)} size="sm" variant="ghost">
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button disabled={isMutating} onClick={() => openDeleteDialog(user)} size="sm" variant="outline">
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </Table>

      <div className={`
        flex flex-col gap-4
        sm:flex-row sm:items-center sm:justify-between
      `}>
        <p className="text-sm text-muted">
          {total === 0
            ? "No records"
            : `Showing ${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}`}
        </p>
        <div className="flex items-center gap-2">
          <Button
            disabled={page === 1 || isLoading}
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            size="sm"
            variant="outline"
          >
            Prev
          </Button>
          {visiblePages.map((item) => (
            <Button
              key={item}
              disabled={isLoading}
              onClick={() => setPage(item)}
              size="sm"
              variant={item === page ? "primary" : "ghost"}
            >
              {item}
            </Button>
          ))}
          <Button
            disabled={page === totalPages || isLoading}
            onClick={() => setPage((currentPage) => Math.min(currentPage + 1, totalPages))}
            size="sm"
            variant="outline"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getInitials(value: string) {
  const segments = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (segments.length === 0) {
    return "NA";
  }

  return segments.map((segment) => segment[0]?.toUpperCase() ?? "").join("");
}

function getVisiblePages(page: number, totalPages: number) {
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisiblePages + 1));

  return Array.from({ length: maxVisiblePages }, (_, index) => startPage + index);
}
